import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/auth";
import { storage } from "@/server/storage";
import { db } from "@/server/db";
import { inspectionJobs as jobs, pilotProfiles } from "@/shared/schema";
import { eq, and } from "drizzle-orm";

export async function PATCH(
  request: NextRequest,
  context: { params: { jobId: string } }
) {
  const { params } = context;
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const { status } = await request.json();

    if (!['assigned', 'in_progress', 'completed', 'cancelled'].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      );
    }

    // Get user and pilot profile
    const user = await storage.getUserByEmail(session.user.email);
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const pilotProfile = await storage.getPilotProfile(user.id);
    if (!pilotProfile) {
      return NextResponse.json(
        { error: "Pilot profile not found" },
        { status: 404 }
      );
    }

    // Check if job exists and is assigned to this pilot
    const [job] = await db
      .select()
      .from(jobs)
      .where(
        and(
          eq(jobs.id, params.jobId),
          eq(jobs.assignedPilotId, pilotProfile.id)
        )
      );

    if (!job) {
      return NextResponse.json(
        { error: "Job not found or not assigned to you" },
        { status: 404 }
      );
    }

    // Update job status
    const updateData: any = {
      status,
      updatedAt: new Date(),
    };

    // If completing the job, set completion date and update pilot stats
    if (status === 'completed') {
      updateData.completedAt = new Date();
      updateData.reportGenerated = true;
      
      // Update pilot profile stats
      await db
        .update(pilotProfiles)
        .set({
          completedJobs: (pilotProfile.completedJobs || 0) + 1,
          totalEarnings: (pilotProfile.totalEarnings || 0) + getCompensationForJob(job.fileCount || 0),
          status: 'active', // Mark pilot as active after completing first job
          updatedAt: new Date(),
        })
        .where(eq(pilotProfiles.id, pilotProfile.id));
    }

    const [updatedJob] = await db
      .update(jobs)
      .set(updateData)
      .where(eq(jobs.id, params.jobId))
      .returning();

    return NextResponse.json({
      success: true,
      message: `Job status updated to ${status}`,
      job: updatedJob,
    });
  } catch (error) {
    console.error("Error updating job status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

function getCompensationForJob(fileCount: number): number {
  const baseRate = 500; // $5 per file in cents
  const complexityMultiplier = fileCount > 200 ? 1.5 : fileCount > 100 ? 1.2 : 1.0;
  return Math.round(fileCount * baseRate * complexityMultiplier);
}