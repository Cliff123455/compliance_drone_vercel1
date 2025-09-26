import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/auth";
import { storage } from "@/server/storage";
import { db } from "@/server/db";
import { inspectionJobs as jobs } from "@/shared/schema";
import { eq, and } from "drizzle-orm";

export async function POST(
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

    // Get user and pilot profile
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

    // Check if job exists and is available
    const [job] = await db
      .select()
      .from(jobs)
      .where(
        and(
          eq(jobs.id, params.jobId),
          eq(jobs.status, 'created')
        )
      );

    if (!job) {
      return NextResponse.json(
        { error: "Job not found or not available" },
        { status: 404 }
      );
    }

    // Assign the job to the pilot
    const [updatedJob] = await db
      .update(jobs)
      .set({
        assignedPilotId: pilotProfile.id,
        status: 'assigned',
        updatedAt: new Date(),
      })
      .where(eq(jobs.id, params.jobId))
      .returning();

    return NextResponse.json({
      success: true,
      message: "Successfully applied for job",
      job: updatedJob,
    });
  } catch (error) {
    console.error("Error applying for job:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}