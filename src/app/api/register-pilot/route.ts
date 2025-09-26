import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { prisma } from "@/libs/prismaDB";
import { db } from "../../../../server/db";
import { users, pilotProfiles } from "../../../../shared/schema";
import { eq } from "drizzle-orm";

interface PilotRegistrationData {
  // Basic user info
  name: string;
  email: string;
  password: string;
  phoneNumber: string;
  
  // 23-Question Questionnaire Fields
  experienceDescription: string;
  totalFlightHours: string;
  careerType: string;
  availableDays: string[];
  hasOwnBusiness: boolean;
  companyName?: string;
  pastJobExperience: string;
  airspaceApprovalExperience: string;
  industriesExperience: string[];
  communicationPreferences: string[];
  howHeardAboutUs: string;
  preferredMissionType: string;
  militaryService: boolean;
  mannedAircraftLicense: boolean;
  advancedTraining?: string;
  openToTraining: boolean;
  softwareExperience: string[];
  emergencySituations?: string;
  willingToTravel: boolean;
  hasVehicleForTravel: string;
  canChargeBatteriesOnRoad: boolean;
  teamExperience: string;
  specialProjects?: string;
  worksWithOtherPilots: string;
}

export async function POST(request: Request) {
  try {
    const body: PilotRegistrationData = await request.json();
    const {
      name,
      email,
      password,
      phoneNumber,
      experienceDescription,
      totalFlightHours,
      careerType,
      availableDays,
      hasOwnBusiness,
      companyName,
      pastJobExperience,
      airspaceApprovalExperience,
      industriesExperience,
      communicationPreferences,
      howHeardAboutUs,
      preferredMissionType,
      militaryService,
      mannedAircraftLicense,
      advancedTraining,
      openToTraining,
      softwareExperience,
      emergencySituations,
      willingToTravel,
      hasVehicleForTravel,
      canChargeBatteriesOnRoad,
      teamExperience,
      specialProjects,
      worksWithOtherPilots
    } = body;

    // Validation for new questionnaire format
    if (!name || !email || !password || !phoneNumber) {
      return NextResponse.json(
        { error: "Missing required basic information" },
        { status: 400 }
      );
    }

    if (!experienceDescription || experienceDescription.length < 50) {
      return NextResponse.json(
        { error: "Please provide at least 50 characters describing your experience" },
        { status: 400 }
      );
    }

    if (!totalFlightHours || !careerType) {
      return NextResponse.json(
        { error: "Missing required flight hours or career type" },
        { status: 400 }
      );
    }

    if (!availableDays?.length) {
      return NextResponse.json(
        { error: "Please select at least one available day" },
        { status: 400 }
      );
    }

    if (hasOwnBusiness && !companyName) {
      return NextResponse.json(
        { error: "Company name is required when you have your own business" },
        { status: 400 }
      );
    }

    if (!pastJobExperience || !airspaceApprovalExperience) {
      return NextResponse.json(
        { error: "Missing required job experience or airspace approval information" },
        { status: 400 }
      );
    }

    if (!industriesExperience?.length || !communicationPreferences?.length) {
      return NextResponse.json(
        { error: "Please select at least one industry and communication method" },
        { status: 400 }
      );
    }

    if (!howHeardAboutUs || !preferredMissionType) {
      return NextResponse.json(
        { error: "Missing required referral source or mission type" },
        { status: 400 }
      );
    }

    if (!softwareExperience?.length) {
      return NextResponse.json(
        { error: "Please select at least one software you have experience with" },
        { status: 400 }
      );
    }

    if (!hasVehicleForTravel || hasVehicleForTravel.length < 10) {
      return NextResponse.json(
        { error: "Please describe your vehicle situation for travel" },
        { status: 400 }
      );
    }

    if (!teamExperience || teamExperience.length < 10) {
      return NextResponse.json(
        { error: "Please describe your team experience" },
        { status: 400 }
      );
    }

    if (!worksWithOtherPilots || worksWithOtherPilots.length < 10) {
      return NextResponse.json(
        { error: "Please describe your work with other pilots" },
        { status: 400 }
      );
    }

    // Check if user already exists (Prisma)
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      );
    }

    // Check if user already exists (Drizzle)
    const existingUserDrizzle = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUserDrizzle.length > 0) {
      return NextResponse.json(
        { error: "Email already registered in pilot system" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // SAGA PATTERN IMPLEMENTATION: Drizzle operations first, then Prisma
    // This prevents orphaned records by allowing proper rollback on failure
    
    let drizzleUser: any = null;
    let pilotProfile: any = null;
    let prismaUser: any = null;

    try {
      // STEP 1: Create user in Drizzle (for pilot profiles) - First operation
      drizzleUser = await db
        .insert(users)
        .values({
          email,
          firstName: name.split(' ')[0],
          lastName: name.split(' ').slice(1).join(' ') || '',
        })
        .returning();

      if (!drizzleUser || drizzleUser.length === 0) {
        throw new Error("Failed to create user in pilot system");
      }

      // STEP 2: Create pilot profile with questionnaire data - Second operation  
      pilotProfile = await db
        .insert(pilotProfiles)
        .values({
          userId: drizzleUser[0].id,
          
          // Contact Information  
          phoneNumber,
          
          // Professional Information
          companyName: companyName || null,
          
          // Flight Information
          totalFlightHours: parseInt(totalFlightHours.split('-')[0]) || 0, // Extract first number from range
          
          // Platform Status
          status: 'pending', // Will be reviewed by admin
          
          // Comprehensive Questionnaire Fields (23 questions)
          experienceDescription,
          careerType,
          availableDays,
          hasOwnBusiness,
          pastJobExperience,
          airspaceApprovalExperience,
          industriesExperience,
          communicationPreferences,
          howHeardAboutUs,
          preferredMissionType,
          militaryService,
          mannedAircraftLicense,
          advancedTraining: advancedTraining || null,
          openToTraining,
          softwareExperience,
          emergencySituations: emergencySituations || null,
          willingToTravel,
          hasVehicleForTravel,
          canChargeBatteriesOnRoad,
          teamExperience,
          specialProjects: specialProjects || null,
          worksWithOtherPilots,
          
          // Initialize metrics
          completedJobs: 0,
          totalEarnings: 0,
        })
        .returning();

      if (!pilotProfile || pilotProfile.length === 0) {
        throw new Error("Failed to create pilot profile");
      }

      // STEP 3: Create user in Prisma (for NextAuth compatibility) - Final operation
      prismaUser = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
        },
      });

      if (!prismaUser) {
        throw new Error("Failed to create user for authentication");
      }

      // SUCCESS: All operations completed successfully
      return NextResponse.json({
        success: true,
        message: "Pilot registration submitted successfully",
        user: {
          id: prismaUser.id,
          email: prismaUser.email,
          name: prismaUser.name
        },
        pilotProfile: {
          id: pilotProfile[0].id,
          status: pilotProfile[0].status
        }
      });

    } catch (sagaError) {
      console.error("Registration saga failed:", sagaError);
      
      // COMPENSATING TRANSACTIONS: Rollback operations in reverse order
      
      // If Prisma user creation failed, rollback Drizzle operations
      if (pilotProfile && pilotProfile.length > 0) {
        try {
          console.log("Rolling back pilot profile creation...");
          await db.delete(pilotProfiles).where(eq(pilotProfiles.id, pilotProfile[0].id));
        } catch (rollbackError) {
          console.error("Failed to rollback pilot profile:", rollbackError);
        }
      }
      
      if (drizzleUser && drizzleUser.length > 0) {
        try {
          console.log("Rolling back Drizzle user creation...");
          await db.delete(users).where(eq(users.id, drizzleUser[0].id));
        } catch (rollbackError) {
          console.error("Failed to rollback Drizzle user:", rollbackError);
        }
      }

      // Re-throw error to be handled by outer catch block
      throw sagaError;
    }

  } catch (error) {
    console.error("Pilot registration error:", error);
    
    // Enhanced error handling for better debugging and user experience
    if (error instanceof Error) {
      // Handle specific database constraint violations
      if (error.message.includes('unique constraint') || error.message.includes('duplicate key')) {
        return NextResponse.json(
          { error: "Email already registered" },
          { status: 400 }
        );
      }

      // Handle saga-specific errors with more context
      if (error.message.includes('Failed to create user in pilot system')) {
        return NextResponse.json(
          { error: "Unable to create pilot profile. Please check your information and try again." },
          { status: 500 }
        );
      }

      if (error.message.includes('Failed to create pilot profile')) {
        return NextResponse.json(
          { error: "Unable to save pilot profile information. Please try again." },
          { status: 500 }
        );
      }

      if (error.message.includes('Failed to create user for authentication')) {
        return NextResponse.json(
          { error: "Unable to create authentication account. Please try again." },
          { status: 500 }
        );
      }

      // Handle validation errors from Prisma/Drizzle
      if (error.message.includes('violates foreign key constraint')) {
        return NextResponse.json(
          { error: "Data validation failed. Please check your information." },
          { status: 400 }
        );
      }

      // Handle connection errors
      if (error.message.includes('connect') || error.message.includes('timeout')) {
        return NextResponse.json(
          { error: "Database connection error. Please try again in a moment." },
          { status: 503 }
        );
      }

      // Handle password hashing errors
      if (error.message.includes('bcrypt') || error.message.includes('hash')) {
        return NextResponse.json(
          { error: "Password processing error. Please try again." },
          { status: 500 }
        );
      }
    }

    // Generic fallback error
    return NextResponse.json(
      { 
        error: "Registration failed. Please verify your information and try again.",
        details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined
      },
      { status: 500 }
    );
  }
}