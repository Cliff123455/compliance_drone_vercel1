// Database schema for ComplianceDrone authentication and pilot management
// Integrates with Replit Auth integration for secure authentication

import { sql } from 'drizzle-orm';
import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  serial,
  uniqueIndex,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Session storage table - Required for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table - Required for Replit Auth, extended with pilot fields
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Pilot status enum
export const pilotStatusEnum = pgEnum('pilot_status', [
  'pending',     // Initial registration, awaiting review
  'approved',    // Approved by admin, can access platform
  'active',      // Currently active pilot with jobs
  'inactive',    // Temporarily inactive
  'suspended'    // Account suspended
]);

// Pilot profiles - Extended information for drone pilots
export const pilotProfiles = pgTable("pilot_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  
  // Professional Information
  companyName: varchar("company_name"),
  businessType: varchar("business_type"), // 'individual', 'llc', 'corporation', 'partnership'
  taxId: varchar("tax_id"),
  
  // Contact Information
  phoneNumber: varchar("phone_number"),
  address: text("address"),
  city: varchar("city"),
  state: varchar("state"),
  zipCode: varchar("zip_code"),
  
  // Pilot Qualifications
  part107Certified: boolean("part_107_certified").default(false),
  part107Number: varchar("part_107_number"),
  licenseExpiryDate: timestamp("license_expiry_date"),
  thermalExperienceYears: integer("thermal_experience_years"),
  totalFlightHours: integer("total_flight_hours"),
  
  // Equipment Information
  droneModels: jsonb("drone_models").$type<string[]>(), // Array of drone model names
  thermalCameraModels: jsonb("thermal_camera_models").$type<string[]>(),
  
  // Insurance Information
  hasInsurance: boolean("has_insurance").default(false),
  insuranceProvider: varchar("insurance_provider"),
  insurancePolicyNumber: varchar("insurance_policy_number"),
  insuranceExpiryDate: timestamp("insurance_expiry_date"),
  liabilityCoverage: integer("liability_coverage"), // Coverage amount in USD
  
  // Geographic Coverage
  serviceStates: jsonb("service_states").$type<string[]>(),
  maxTravelDistance: integer("max_travel_distance"), // Miles from base location
  
  // Platform Status
  status: pilotStatusEnum("status").default('pending'),
  approvedAt: timestamp("approved_at"),
  approvedBy: varchar("approved_by"), // Admin user ID who approved
  
  // Performance Metrics
  completedJobs: integer("completed_jobs").default(0),
  averageRating: integer("average_rating"), // 1-5 star rating
  totalEarnings: integer("total_earnings").default(0), // In cents
  
  // Application Information
  notes: text("notes"), // Admin notes
  applicationNotes: text("application_notes"), // Pilot's application essay/notes
  
  // Comprehensive Questionnaire Fields (23 questions)
  experienceDescription: text("experience_description"), // Q1: Experience in drone industry
  careerType: varchar("career_type"), // Q3: Full-time/Part-time/etc
  availableDays: jsonb("available_days").$type<string[]>(), // Q4: Days available for missions
  hasOwnBusiness: boolean("has_own_business").default(false), // Q5: Own drone business
  pastJobExperience: text("past_job_experience"), // Q6: Job experience outside UAS
  airspaceApprovalExperience: text("airspace_approval_experience"), // Q7: Airspace approval methods
  industriesExperience: jsonb("industries_experience").$type<string[]>(), // Q8: Industries experienced in
  communicationPreferences: jsonb("communication_preferences").$type<string[]>(), // Q9: Preferred communication
  howHeardAboutUs: varchar("how_heard_about_us"), // Q10: How they heard about us
  preferredMissionType: varchar("preferred_mission_type"), // Q11: Type of missions interested in
  militaryService: boolean("military_service").default(false), // Q12: Military service
  mannedAircraftLicense: boolean("manned_aircraft_license").default(false), // Q13: Manned aircraft license
  advancedTraining: text("advanced_training"), // Q14: Advanced UAS training/education
  openToTraining: boolean("open_to_training").default(true), // Q15: Open to training/workshops
  softwareExperience: jsonb("software_experience").$type<string[]>(), // Q16: Software experience
  emergencySituations: text("emergency_situations"), // Q17: Emergency situations handled
  willingToTravel: boolean("willing_to_travel").default(true), // Q18: Willing to travel for projects
  hasVehicleForTravel: text("has_vehicle_for_travel"), // Q19: Vehicle suitable for travel
  canChargeBatteriesOnRoad: boolean("can_charge_batteries_on_road").default(true), // Q20: Battery charging capability
  teamExperience: text("team_experience"), // Q21: Experience working with pilot teams
  specialProjects: text("special_projects"), // Q22: Special projects worked on
  worksWithOtherPilots: text("works_with_other_pilots"), // Q23: Working with other pilots
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Legacy inspection jobs table - retains existing job board features
export const inspectionJobs = pgTable("inspection_jobs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clientUserId: varchar("client_user_id").references(() => users.id),
  assignedPilotId: varchar("assigned_pilot_id").references(() => pilotProfiles.id),

  // Job Details
  title: varchar("title").notNull(),
  description: text("description"),
  location: varchar("location"),
  coordinatesLat: varchar("coordinates_lat"),
  coordinatesLng: varchar("coordinates_lng"),

  // Job Status
  status: varchar("status").default('created'), // 'created', 'assigned', 'in_progress', 'completed', 'cancelled'

  // File Processing
  fileCount: integer("file_count").default(0),
  processedCount: integer("processed_count").default(0),
  anomalyCount: integer("anomaly_count"),
  reportGenerated: boolean("report_generated").default(false),

  // Scheduling
  scheduledDate: timestamp("scheduled_date"),
  completedAt: timestamp("completed_at"),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Automated processing jobs created by Python pipeline
export const processingJobs = pgTable("jobs", {
  id: serial("id").primaryKey(),
  jobId: text("job_id").notNull().unique(),
  pilotId: text("pilot_id"),
  location: text("location"),
  status: text("status").default('pending'),
  createdAt: timestamp("created_at").defaultNow(),
});

export const processingResults = pgTable("results", {
  id: serial("id").primaryKey(),
  jobId: text("job_id").references(() => processingJobs.jobId, { onDelete: 'cascade' }),
  anomaliesFound: integer("anomalies_found"),
  excelUrl: text("excel_url"),
  pdfUrl: text("pdf_url"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  jobUnique: uniqueIndex("results_job_id_unique").on(table.jobId),
}));

export const flightPaths = pgTable("flight_paths", {
  id: serial("id").primaryKey(),
  jobId: text("job_id").references(() => processingJobs.jobId, { onDelete: 'cascade' }),
  kmzFileUrl: text("kmz_file_url"),
  generatedPathUrl: text("generated_path_url"),
  geojsonUrl: text("geojson_url"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  jobUnique: uniqueIndex("flight_paths_job_id_unique").on(table.jobId),
}));

// Relations
export const usersRelations = relations(users, ({ one }) => ({
  pilotProfile: one(pilotProfiles, {
    fields: [users.id],
    references: [pilotProfiles.userId],
  }),
}));

export const pilotProfilesRelations = relations(pilotProfiles, ({ one, many }) => ({
  user: one(users, {
    fields: [pilotProfiles.userId],
    references: [users.id],
  }),
  assignedJobs: many(inspectionJobs, {
    relationName: "pilot_jobs",
  }),
}));

export const inspectionJobsRelations = relations(inspectionJobs, ({ one }) => ({
  client: one(users, {
    fields: [inspectionJobs.clientUserId],
    references: [users.id],
  }),
  assignedPilot: one(pilotProfiles, {
    fields: [inspectionJobs.assignedPilotId],
    references: [pilotProfiles.id],
  }),
}));

export const processingJobsRelations = relations(processingJobs, ({ many }) => ({
  results: many(processingResults),
  flightPaths: many(flightPaths),
}));

export const processingResultsRelations = relations(processingResults, ({ one }) => ({
  job: one(processingJobs, {
    fields: [processingResults.jobId],
    references: [processingJobs.jobId],
  }),
}));

export const flightPathsRelations = relations(flightPaths, ({ one }) => ({
  job: one(processingJobs, {
    fields: [flightPaths.jobId],
    references: [processingJobs.jobId],
  }),
}));

// Type definitions for TypeScript
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type UpsertPilotProfile = typeof pilotProfiles.$inferInsert;
export type PilotProfile = typeof pilotProfiles.$inferSelect;
export type UpsertInspectionJob = typeof inspectionJobs.$inferInsert;
export type InspectionJob = typeof inspectionJobs.$inferSelect;
export type ProcessingJob = typeof processingJobs.$inferSelect;
export type ProcessingJobInsert = typeof processingJobs.$inferInsert;
export type ProcessingResult = typeof processingResults.$inferSelect;
export type ProcessingResultInsert = typeof processingResults.$inferInsert;
export type FlightPath = typeof flightPaths.$inferSelect;
export type FlightPathInsert = typeof flightPaths.$inferInsert;

// Combined types for API responses
export type UserWithPilotProfile = User & {
  pilotProfile?: PilotProfile;
};

export type PilotWithUser = PilotProfile & {
  user: User;
};