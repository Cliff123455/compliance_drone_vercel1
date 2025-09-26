"use client";

import type { ChangeEvent, DragEvent } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";

interface JobResult {
  job_id: string;
  anomalies_found: number;
  excel_url: string;
  pdf_url: string;
}

interface JobStatusResponse {
  job: {
    job_id: string;
    pilot_id: string | null;
    location: string | null;
    status: string;
    created_at: string;
  };
  result?: {
    anomalies_found: number;
    excel_url: string;
    pdf_url: string;
  } | null;
}

interface FlightPathResult {
  job_id: string;
  kmz_url: string;
  kml_url: string;
  geojson_url: string;
}

export default function PilotUploadPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [location, setLocation] = useState("");
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<string>("idle");
  const [result, setResult] = useState<JobResult | null>(null);
  const [kmzFile, setKmzFile] = useState<File | null>(null);
  const [flightResult, setFlightResult] = useState<FlightPathResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingKmz, setIsUploadingKmz] = useState(false);

  const handleFiles = useCallback((incoming: FileList | null) => {
    if (!incoming) return;
    const next: File[] = [];
    for (const file of Array.from(incoming)) {
      next.push(file);
    }
    setFiles((prev) => [...prev, ...next]);
  }, []);

  const handleDrop = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    handleFiles(event.dataTransfer.files);
  }, [handleFiles]);

  const handleFileInput = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    handleFiles(event.target.files);
  }, [handleFiles]);

  const removeFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, idx) => idx !== index));
  }, []);

  const submitJob = useCallback(async () => {
    if (files.length === 0) {
      setError("Please add at least one thermal image or document.");
      return;
    }

    setError(null);
    setIsSubmitting(true);
    setJobStatus("processing");

    try {
      const formData = new FormData();
      formData.append("location", location);
      files.forEach((file) => {
        formData.append("files", file);
      });

      const response = await fetch("/api/process-job", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const message = await response.json().catch(() => ({ message: "Failed to process job" }));
        throw new Error(message?.message ?? "Failed to process job");
      }

      const payload: JobResult = await response.json();
      setResult(payload);
      setJobId(payload.job_id);
      setJobStatus("completed");
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to process job");
      setJobStatus("failed");
    } finally {
      setIsSubmitting(false);
    }
  }, [files, location]);

  useEffect(() => {
    if (!jobId) return;

    let active = true;
    const poll = async () => {
      try {
        const res = await fetch(`/api/job/${jobId}/status`);
        if (!res.ok) return;
        const data: JobStatusResponse = await res.json();
        if (!active) return;
        if (data.job?.status) {
          setJobStatus(data.job.status);
        }
        if (data.result) {
          setResult((prev) =>
            prev
              ? { ...prev, ...data.result, job_id: prev.job_id }
              : {
                  job_id: data.job.job_id,
                  anomalies_found: data.result.anomalies_found ?? 0,
                  excel_url: data.result.excel_url ?? "",
                  pdf_url: data.result.pdf_url ?? "",
                },
          );
        }
      } catch (err) {
        console.warn("Polling error", err);
      }
    };

    const interval = window.setInterval(poll, 5000);
    poll();

    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [jobId]);

  const uploadKmz = useCallback(async () => {
    if (!jobId || !kmzFile) {
      setError("Upload a KMZ file after a job has been created.");
      return;
    }

    setIsUploadingKmz(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("jobId", jobId);
      formData.append("kmz", kmzFile);

      const res = await fetch("/api/upload-kmz", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const message = await res.json().catch(() => ({ message: "Failed to upload KMZ" }));
        throw new Error(message?.message ?? "Failed to upload KMZ");
      }

      const payload: FlightPathResult = await res.json();
      setFlightResult(payload);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to upload KMZ");
    } finally {
      setIsUploadingKmz(false);
    }
  }, [jobId, kmzFile]);

  const statusLabel = useMemo(() => {
    switch (jobStatus) {
      case "processing":
        return "Processing…";
      case "completed":
        return "Completed";
      case "failed":
        return "Failed";
      default:
        return "Idle";
    }
  }, [jobStatus]);

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-8 px-4 py-12">
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">Pilot Upload &amp; Report Generation</h1>
        <p className="mt-2 text-gray-600">
          Drag and drop thermal images, KMZ, or KML files to generate anomaly reports and PDF summaries.
        </p>
      </div>

      <div
        onDragOver={(event) => event.preventDefault()}
        onDrop={handleDrop}
        className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-10 text-center"
      >
        <p className="text-lg font-medium text-gray-700">Drop files here or click to upload</p>
        <p className="mt-1 text-sm text-gray-500">Supported formats: JPEG, PNG, TIFF, KMZ, KML</p>
        <label className="mt-4 inline-flex cursor-pointer items-center rounded-md bg-blue-600 px-4 py-2 text-white shadow-sm hover:bg-blue-500">
          Browse files
          <input
            type="file"
            multiple
            className="hidden"
            accept=".jpg,.jpeg,.png,.tif,.tiff,.kmz,.kml"
            onChange={handleFileInput}
          />
        </label>
      </div>

      {files.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800">Selected files</h2>
          <ul className="mt-3 space-y-2">
            {files.map((file, index) => (
              <li key={`${file.name}-${index}`} className="flex items-center justify-between rounded-md bg-gray-50 px-3 py-2">
                <span className="text-sm text-gray-700">
                  {file.name} <span className="text-gray-400">({Math.round(file.size / 1024)} KB)</span>
                </span>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="text-sm text-red-600 hover:text-red-500"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-col gap-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <label className="text-sm font-medium text-gray-700" htmlFor="location">
          Inspection location (optional)
        </label>
        <input
          id="location"
          type="text"
          value={location}
          onChange={(event) => setLocation(event.target.value)}
          placeholder="Solar Farm - Austin, TX"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <button
          type="button"
          onClick={submitJob}
          disabled={isSubmitting}
          className="inline-flex w-full items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-white shadow-sm transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-blue-300"
        >
          {isSubmitting ? "Generating report…" : "Generate report"}
        </button>
      </div>

      {error && <p className="rounded-md bg-red-100 px-4 py-3 text-sm text-red-700">{error}</p>}

      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-800">Job status</h2>
        <p className="mt-1 text-sm text-gray-600">Current status: {statusLabel}</p>
        {result && (
          <div className="mt-4 space-y-2 text-sm text-gray-700">
            <p>
              <span className="font-medium">Job ID:</span> {result.job_id}
            </p>
            <p>
              <span className="font-medium">Anomalies found:</span> {result.anomalies_found}
            </p>
            <div className="flex flex-wrap gap-3">
              {result.excel_url && (
                <a
                  href={result.excel_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center rounded-md border border-blue-600 px-3 py-1 text-blue-600 hover:bg-blue-50"
                >
                  Download Excel
                </a>
              )}
              {result.pdf_url && (
                <a
                  href={result.pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center rounded-md border border-blue-600 px-3 py-1 text-blue-600 hover:bg-blue-50"
                >
                  Download PDF
                </a>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-800">Upload KMZ flight path</h2>
        <p className="mt-1 text-sm text-gray-600">
          Optional: upload a KMZ flight path to generate downloadable KML and GeoJSON routes for pilots.
        </p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            type="file"
            accept=".kmz,.kml"
            onChange={(event) => setKmzFile(event.target.files?.[0] ?? null)}
            className="flex-1 text-sm text-gray-700"
          />
          <button
            type="button"
            onClick={uploadKmz}
            disabled={!kmzFile || !jobId || isUploadingKmz}
            className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-indigo-300"
          >
            {isUploadingKmz ? "Generating…" : "Generate flight path"}
          </button>
        </div>
        {flightResult && (
          <div className="mt-4 space-y-2 text-sm text-gray-700">
            <p className="font-medium text-gray-800">Flight path ready</p>
            <div className="flex flex-wrap gap-3">
              <a
                href={flightResult.kmz_url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-md border border-indigo-600 px-3 py-1 text-indigo-600 hover:bg-indigo-50"
              >
                Original KMZ
              </a>
              <a
                href={flightResult.kml_url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-md border border-indigo-600 px-3 py-1 text-indigo-600 hover:bg-indigo-50"
              >
                Download KML
              </a>
              <a
                href={flightResult.geojson_url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-md border border-indigo-600 px-3 py-1 text-indigo-600 hover:bg-indigo-50"
              >
                Download GeoJSON
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
