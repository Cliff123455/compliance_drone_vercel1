import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/auth";
import { storage } from "@/server/storage";
import { db } from "@/server/db";
import { inspectionJobs as jobs } from "@/shared/schema";
import { eq, and, isNull, or } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Get user and verify pilot status
    const user = await storage.getUserByEmail(session.user.email);
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const pilotProfile = await storage.getPilotProfile(user.id);
    if (!pilotProfile || pilotProfile.status !== 'approved') {
      return NextResponse.json(
        { error: "Pilot profile not approved" },
        { status: 403 }
      );
    }

    // Get available jobs (not assigned or status is created)
    const availableJobs = await db
      .select({
        id: jobs.id,
        title: jobs.title,
        description: jobs.description,
        location: jobs.location,
        coordinatesLat: jobs.coordinatesLat,
        coordinatesLng: jobs.coordinatesLng,
        status: jobs.status,
        fileCount: jobs.fileCount,
        scheduledDate: jobs.scheduledDate,
        createdAt: jobs.createdAt,
      })
      .from(jobs)
      .where(
        and(
          or(
            eq(jobs.status, 'created'),
            eq(jobs.status, 'available')
          ),
          isNull(jobs.assignedPilotId)
        )
      )
      .orderBy(jobs.createdAt);

    // Add mock compensation and requirements (these could be added to schema later)
    const jobsWithDetails = availableJobs.map(job => ({
      ...job,
      compensation: getCompensationForJob(job.fileCount || 0),
      requirements: getRequirementsForJob(job.title),
      type: getJobType(job.title),
    }));

    return NextResponse.json(jobsWithDetails);
  } catch (error) {
    console.error("Error fetching available jobs:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Helper functions to determine job details
function getCompensationForJob(fileCount: number): number {
  // Base rate per file + complexity multiplier
  const baseRate = 500; // $5 per file in cents
  const complexityMultiplier = fileCount > 200 ? 1.5 : fileCount > 100 ? 1.2 : 1.0;
  return Math.round(fileCount * baseRate * complexityMultiplier);
}

function getRequirementsForJob(title: string): string[] {
  const baseReqs = ['Part 107 Certified'];
  
  if (title.toLowerCase().includes('solar')) {
    return [...baseReqs, 'Solar inspection experience', 'Thermal camera required'];
  }
  
  if (title.toLowerCase().includes('electrical') || title.toLowerCase().includes('substation')) {
    return [...baseReqs, 'High-voltage experience preferred', 'Insurance required'];
  }
  
  return [...baseReqs, 'Thermal imaging experience'];
}

function getJobType(title: string): string {
  if (title.toLowerCase().includes('solar')) return 'solar';
  if (title.toLowerCase().includes('electrical') || title.toLowerCase().includes('substation')) return 'electrical';
  return 'infrastructure';
}