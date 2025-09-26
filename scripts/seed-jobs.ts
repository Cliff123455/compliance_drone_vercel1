// Script to seed sample thermal inspection jobs for testing
import { db } from "../server/db";
import { jobs } from "../shared/schema";

const sampleJobs = [
  {
    title: "Large Solar Farm Thermal Inspection - Phoenix",
    description: "Comprehensive thermal inspection of 500MW solar installation. Requires detailed thermal imaging of all panels and electrical connections to identify hot spots and potential failures.",
    location: "Phoenix, AZ",
    coordinatesLat: "33.4484",
    coordinatesLng: "-112.0740",
    status: "created" as const,
    fileCount: 250,
    processedCount: 0,
    scheduledDate: new Date("2025-09-25"),
  },
  {
    title: "Electrical Substation Thermal Survey",
    description: "Thermal inspection of high-voltage electrical substation. Looking for overheating transformers, switches, and connections. Critical infrastructure requiring experienced pilot.",
    location: "Austin, TX",
    coordinatesLat: "30.2672",
    coordinatesLng: "-97.7431",
    status: "created" as const,
    fileCount: 75,
    processedCount: 0,
    scheduledDate: new Date("2025-09-30"),
  },
  {
    title: "Commercial Solar Array - Maintenance Check",
    description: "Routine thermal inspection for 50MW commercial solar array. Previous anomalies detected, need follow-up analysis and detailed reporting.",
    location: "San Diego, CA",
    coordinatesLat: "32.7157",
    coordinatesLng: "-117.1611",
    status: "created" as const,
    fileCount: 120,
    processedCount: 0,
    scheduledDate: new Date("2025-10-05"),
  },
  {
    title: "Wind Farm Electrical Infrastructure",
    description: "Thermal inspection of wind turbine electrical systems. Check transformer boxes, connections, and control systems for thermal anomalies.",
    location: "Amarillo, TX",
    coordinatesLat: "35.2220",
    coordinatesLng: "-101.8313",
    status: "created" as const,
    fileCount: 180,
    processedCount: 0,
    scheduledDate: new Date("2025-10-08"),
  },
  {
    title: "Industrial Solar Installation Inspection",
    description: "Large industrial facility solar installation inspection. Focus on inverters, combiner boxes, and panel connections for potential overheating issues.",
    location: "Las Vegas, NV",
    coordinatesLat: "36.1699",
    coordinatesLng: "-115.1398",
    status: "created" as const,
    fileCount: 200,
    processedCount: 0,
    scheduledDate: new Date("2025-10-12"),
  }
];

export async function seedJobs() {
  try {
    console.log("Seeding sample thermal inspection jobs...");
    
    const insertedJobs = await db
      .insert(jobs)
      .values(sampleJobs)
      .returning();
    
    console.log(`Successfully seeded ${insertedJobs.length} jobs:`);
    insertedJobs.forEach(job => {
      console.log(`- ${job.title} (${job.location})`);
    });
    
    return insertedJobs;
  } catch (error) {
    console.error("Error seeding jobs:", error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  seedJobs().then(() => {
    console.log("Job seeding completed");
    process.exit(0);
  }).catch(error => {
    console.error("Job seeding failed:", error);
    process.exit(1);
  });
}