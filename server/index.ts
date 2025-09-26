// Main Express server for ComplianceDrone with authentication
import express from 'express';
import next from 'next';
import { storage } from './storage';
import { setupAuth, isAuthenticated } from './replitAuth';
import { createServer } from 'http';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { FormData, File } from 'undici';

// Initialize Next.js
const dev = process.env.NODE_ENV !== 'production';
const nextApp = next({ dev });
const handle = nextApp.getRequestHandler();

export async function createApp(): Promise<express.Express> {
  // Prepare Next.js
  await nextApp.prepare();

  const app = express();
  const uploadDir = path.join(process.cwd(), 'uploads/tmp');
  fs.mkdirSync(uploadDir, { recursive: true });
  const upload = multer({ dest: uploadDir });
  const pythonApi = process.env.PYTHON_API ?? 'http://python-api:8000';
  
  // Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Setup authentication
  await setupAuth(app);

  // Auth routes (these override Next.js API routes)
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUserWithPilotProfile(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.post('/api/process-job', isAuthenticated, upload.array('files'), async (req: any, res) => {
    const tempFiles = (req.files ?? []) as Express.Multer.File[];
    try {
      if (!Array.isArray(tempFiles) || tempFiles.length === 0) {
        return res.status(400).json({ message: 'At least one file must be uploaded' });
      }

      const pilotId = req.body.pilot_id || req.user?.claims?.sub;
      const location = req.body.location ?? '';

      const formData = new FormData();
      formData.append('pilot_id', pilotId ?? '');
      formData.append('location', location);

      for (const file of tempFiles) {
        const buffer = await fs.promises.readFile(file.path);
        const blob = new File([buffer], file.originalname, {
          type: file.mimetype || 'application/octet-stream',
        });
        formData.append('files', blob, file.originalname);
      }

      const pythonRes = await fetch(`${pythonApi}/process-job`, {
        method: 'POST',
        body: formData as unknown as globalThis.FormData,
      });

      let payload: any = null;
      try {
        payload = await pythonRes.json();
      } catch (err) {
        console.error('Failed to parse Python response:', err);
      }

      if (!pythonRes.ok || !payload) {
        throw new Error(payload?.detail || 'Python service failed to process job');
      }

      await storage.upsertProcessingJob({
        jobId: payload.job_id,
        pilotId: pilotId ?? null,
        location: location || null,
        status: 'completed',
      });

      await storage.saveProcessingResult({
        jobId: payload.job_id,
        anomaliesFound: payload.anomalies_found ?? 0,
        excelUrl: payload.excel_url,
        pdfUrl: payload.pdf_url,
      });

      res.json(payload);
    } catch (error) {
      console.error('Processing error:', error);
      res.status(500).json({ message: 'Failed to process job' });
    } finally {
      await Promise.all(
        tempFiles.map(async (file) => {
          try {
            await fs.promises.unlink(file.path);
          } catch (err) {
            console.warn('Failed to clean temp file', err);
          }
        }),
      );
    }
  });

  app.get('/api/job/:jobId/status', isAuthenticated, async (req: any, res) => {
    try {
      const jobId = req.params.jobId;
      const job = await storage.getProcessingJob(jobId);
      if (!job) {
        return res.status(404).json({ message: 'Job not found' });
      }
      res.json(job);
    } catch (error) {
      console.error('Job status error:', error);
      res.status(500).json({ message: 'Failed to fetch job status' });
    }
  });

  app.post('/api/upload-kmz', isAuthenticated, upload.single('kmz'), async (req: any, res) => {
    const file = req.file as Express.Multer.File | undefined;
    try {
      if (!file) {
        return res.status(400).json({ message: 'KMZ file is required' });
      }

      const jobId = req.body.jobId;
      if (!jobId) {
        return res.status(400).json({ message: 'jobId is required' });
      }

      const buffer = await fs.promises.readFile(file.path);
      const blob = new File([buffer], file.originalname, {
        type: file.mimetype || 'application/vnd.google-earth.kmz',
      });

      const formData = new FormData();
      formData.append('job_id', jobId);
      formData.append('kmz', blob, file.originalname);

      const pythonRes = await fetch(`${pythonApi}/generate-flight-path`, {
        method: 'POST',
        body: formData as unknown as globalThis.FormData,
      });

      let payload: any = null;
      try {
        payload = await pythonRes.json();
      } catch (err) {
        console.error('Failed to parse KMZ response:', err);
      }

      if (!pythonRes.ok || !payload) {
        throw new Error(payload?.detail || 'Failed to generate flight path');
      }

      await storage.saveFlightPath({
        jobId,
        kmzFileUrl: payload.kmz_url ?? '',
        generatedPathUrl: payload.kml_url ?? '',
        geojsonUrl: payload.geojson_url ?? '',
      });

      res.json(payload);
    } catch (error) {
      console.error('KMZ upload error:', error);
      res.status(500).json({ message: 'Failed to upload KMZ' });
    } finally {
      if (file) {
        try {
          await fs.promises.unlink(file.path);
        } catch (err) {
          console.warn('Failed to clean KMZ temp file', err);
        }
      }
    }
  });

  // Pilot registration endpoint
  app.post('/api/auth/register-pilot', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const pilotData = req.body;

      // Check if pilot profile already exists
      const existingProfile = await storage.getPilotProfile(userId);
      if (existingProfile) {
        return res.status(409).json({ message: "Pilot profile already exists" });
      }

      // Create pilot profile
      const profile = await storage.createPilotProfile({
        userId,
        ...pilotData,
        status: 'pending'
      });

      res.status(201).json(profile);
    } catch (error) {
      console.error("Error creating pilot profile:", error);
      res.status(500).json({ message: "Failed to create pilot profile" });
    }
  });

  // Get pilot profile endpoint
  app.get('/api/auth/pilot-profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await storage.getPilotProfile(userId);
      
      if (!profile) {
        return res.status(404).json({ message: "Pilot profile not found" });
      }

      res.json(profile);
    } catch (error) {
      console.error("Error fetching pilot profile:", error);
      res.status(500).json({ message: "Failed to fetch pilot profile" });
    }
  });

  // Handle all other requests with Next.js
  app.use((req, res) => {
    return handle(req, res);
  });

  return app;
}

export async function startServer(port: number = 5000) {
  const app = await createApp();
  const server = createServer(app);
  
  server.listen(port, '0.0.0.0', () => {
    console.log(`ComplianceDrone server running on port ${port}`);
  });
  
  return server;
}

// Start server if this file is run directly
if (require.main === module) {
  startServer();
}