import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/auth";
import { storage } from "@/server/storage";
import { db } from "@/server/db";
import { users, pilotProfiles } from "@/shared/schema";
import { eq } from "drizzle-orm";

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const { user: userData, pilotProfile: pilotData } = await request.json();

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

    // Update user data if provided
    if (userData) {
      await db
        .update(users)
        .set({
          firstName: userData.firstName,
          lastName: userData.lastName,
          updatedAt: new Date(),
        })
        .where(eq(users.id, user.id));
    }

    // Update pilot profile data if provided
    if (pilotData) {
      await db
        .update(pilotProfiles)
        .set({
          companyName: pilotData.companyName,
          phoneNumber: pilotData.phoneNumber,
          address: pilotData.address,
          city: pilotData.city,
          state: pilotData.state,
          zipCode: pilotData.zipCode,
          part107Number: pilotData.part107Number,
          thermalExperienceYears: pilotData.thermalExperienceYears,
          totalFlightHours: pilotData.totalFlightHours,
          insuranceProvider: pilotData.insuranceProvider,
          insurancePolicyNumber: pilotData.insurancePolicyNumber,
          droneModels: pilotData.droneModels,
          thermalCameraModels: pilotData.thermalCameraModels,
          serviceStates: pilotData.serviceStates,
          maxTravelDistance: pilotData.maxTravelDistance,
          updatedAt: new Date(),
        })
        .where(eq(pilotProfiles.id, pilotProfile.id));
    }

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}