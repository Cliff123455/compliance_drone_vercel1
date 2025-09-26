import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/auth";
import { storage } from "@/server/storage";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Get user from database with pilot profile
    const user = await storage.getUserByEmail(session.user.email);
    
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Get pilot profile if exists
    const pilotProfile = await storage.getPilotProfile(user.id);

    const userResponse = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      profileImageUrl: user.profileImageUrl,
      pilotProfile: pilotProfile ? {
        id: pilotProfile.id,
        status: pilotProfile.status,
        companyName: pilotProfile.companyName,
        phoneNumber: pilotProfile.phoneNumber,
        part107Certified: pilotProfile.part107Certified,
        completedJobs: pilotProfile.completedJobs,
        averageRating: pilotProfile.averageRating,
        totalEarnings: pilotProfile.totalEarnings,
        thermalExperienceYears: pilotProfile.thermalExperienceYears,
        totalFlightHours: pilotProfile.totalFlightHours
      } : undefined
    };

    return NextResponse.json(userResponse);
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}