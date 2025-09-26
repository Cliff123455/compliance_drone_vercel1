import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/auth";
import { storage } from "@/server/storage";
import { db } from "@/server/db";
import { inspectionJobs as jobs } from "@/shared/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
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
    if (!pilotProfile) {
      return NextResponse.json(
        { error: "Pilot profile not found" },
        { status: 404 }
      );
    }

    // Get jobs assigned to this pilot
    const myProjects = await db
      .select({
        id: jobs.id,
        title: jobs.title,
        description: jobs.description,
        location: jobs.location,
        status: jobs.status,
        fileCount: jobs.fileCount,
        processedCount: jobs.processedCount,
        scheduledDate: jobs.scheduledDate,
        completedAt: jobs.completedAt,
        createdAt: jobs.createdAt,
      })
      .from(jobs)
      .where(eq(jobs.assignedPilotId, pilotProfile.id))
      .orderBy(desc(jobs.createdAt));

    // Add compensation and other details
    const projectsWithDetails = myProjects.map(project => ({
      ...project,
      compensation: getCompensationForJob(project.fileCount || 0),
      rating: getMockRating(project.status || 'unknown'),
      feedback: getMockFeedback(project.status || 'unknown'),
    }));

    return NextResponse.json(projectsWithDetails);
  } catch (error) {
    console.error("Error fetching my projects:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Helper functions
function getCompensationForJob(fileCount: number): number {
  const baseRate = 500; // $5 per file in cents
  const complexityMultiplier = fileCount > 200 ? 1.5 : fileCount > 100 ? 1.2 : 1.0;
  return Math.round(fileCount * baseRate * complexityMultiplier);
}

function getMockRating(status: string): number | undefined {
  return status === 'completed' ? Math.floor(Math.random() * 2) + 4 : undefined; // 4-5 stars
}

function getMockFeedback(status: string): string | undefined {
  const feedbacks = [
    "Excellent work! Very thorough inspection and detailed report.",
    "Professional service, timely delivery.",
    "High quality thermal imaging, identified all anomalies correctly.",
    "Great communication throughout the project."
  ];
  
  return status === 'completed' ? feedbacks[Math.floor(Math.random() * feedbacks.length)] : undefined;
}