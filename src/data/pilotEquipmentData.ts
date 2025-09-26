// Equipment data for pilot registration dropdowns
// Based on industry-standard thermal inspection equipment

export const droneModels = [
  // DJI Enterprise
  "DJI Matrice 30T",
  "DJI Matrice 300 RTK",
  "DJI Mavic 3T",
  "DJI Mavic 2 Enterprise Advanced",
  "DJI Phantom 4 RTK",
  "DJI Air 2S",
  
  // Autel
  "Autel EVO II Dual 640T",
  "Autel EVO II Pro RTK",
  "Autel Alpha",
  
  // Skydio
  "Skydio X2D",
  "Skydio 2+",
  
  // Parrot
  "Parrot ANAFI Thermal",
  "Parrot ANAFI USA",
  
  // Other/Custom
  "Other Professional Drone",
  "Custom Build"
];

export const thermalCameraModels = [
  // FLIR/Teledyne
  "FLIR Vue Pro R",
  "FLIR Vue TZ20-R",
  "FLIR Boson 640",
  "FLIR Boson 320",
  "Teledyne FLIR Hadron 640R",
  
  // DJI Integrated
  "DJI Zenmuse H20T",
  "DJI Zenmuse XT2",
  "DJI Zenmuse H20N",
  
  // Workswell
  "Workswell WIRIS Pro",
  "Workswell WIRIS Security",
  
  // Optris
  "Optris PI Connect",
  "Optris PI 640",
  
  // Other
  "Other Professional Thermal Camera",
  "Multiple Camera Systems"
];

export const certificationTypes = [
  {
    id: "part107",
    name: "Part 107 Remote Pilot Certificate",
    required: true,
    description: "FAA Remote Pilot Certificate under Part 107"
  },
  {
    id: "medical",
    name: "Medical Certificate",
    required: false,
    description: "FAA Medical Certificate (if applicable)"
  },
  {
    id: "liability_insurance",
    name: "Liability Insurance",
    required: true,
    description: "Commercial liability insurance for drone operations"
  },
  {
    id: "hull_insurance",
    name: "Hull Insurance",
    required: false,
    description: "Equipment/hull insurance for drone hardware"
  }
];

export const businessTypes = [
  "Individual/Sole Proprietor",
  "LLC (Limited Liability Company)", 
  "Corporation",
  "Partnership",
  "Non-Profit Organization"
];

export const statesAndTerritories = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado",
  "Connecticut", "Delaware", "Florida", "Georgia", "Hawaii", "Idaho",
  "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana",
  "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota",
  "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada",
  "New Hampshire", "New Jersey", "New Mexico", "New York",
  "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon",
  "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota",
  "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington",
  "West Virginia", "Wisconsin", "Wyoming", "Washington DC",
  "Puerto Rico", "US Virgin Islands", "American Samoa", "Guam",
  "Northern Mariana Islands"
];

export const insuranceProviders = [
  "SkyWatch.AI",
  "DroneInsurance.com", 
  "Avion Insurance",
  "Unmanned Vehicle Insurance",
  "Verifly",
  "Global Aerospace",
  "AIG",
  "Chubb",
  "Hartford",
  "Travelers",
  "Other/Custom Provider"
];

export const experienceLevels = [
  { value: "0", label: "New to thermal imaging" },
  { value: "1", label: "1+ years experience" },
  { value: "2", label: "2+ years experience" }, 
  { value: "3", label: "3+ years experience" },
  { value: "5", label: "5+ years experience" },
  { value: "10", label: "10+ years experience" }
];

export const flightHoursRanges = [
  { value: "0-50", label: "0-50 hours" },
  { value: "50-100", label: "50-100 hours" },
  { value: "100-250", label: "100-250 hours" },
  { value: "250-500", label: "250-500 hours" },
  { value: "500-1000", label: "500-1000 hours" },
  { value: "1000+", label: "1000+ hours" }
];

export const maxTravelDistances = [
  { value: "25", label: "25 miles" },
  { value: "50", label: "50 miles" },
  { value: "100", label: "100 miles" },
  { value: "200", label: "200 miles" },
  { value: "500", label: "500 miles" },
  { value: "nationwide", label: "Nationwide travel" }
];

// Additional data for comprehensive questionnaire

export const careerTypes = [
  "Full-time",
  "Part-time",
  "Hobby/Recreation",
  "Seasonal"
];

export const daysOfWeek = [
  "Sunday",
  "Monday", 
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday"
];

export const industries = [
  "Agriculture",
  "Construction", 
  "Real Estate",
  "Utilities",
  "Oil & Gas",
  "Renewable Energy",
  "Surveying / Mapping",
  "Search & Rescue",
  "Public Safety",
  "Insurance",
  "Entertainment",
  "Research",
  "Other"
];

export const communicationMethods = [
  "Email",
  "Phone Call", 
  "Text",
  "Video Call",
  "In-Person Meeting"
];

export const referralSources = [
  "Search Engine",
  "Social Media",
  "Word of Mouth",
  "Industry Publication",
  "Trade Show/Conference",
  "Partner Referral",
  "Direct Contact",
  "Other"
];

export const missionTypes = [
  "Thermal Inspections",
  "Solar Panel Inspections", 
  "Building Inspections",
  "Infrastructure Inspections",
  "Power Line Inspections",
  "Oil & Gas Inspections",
  "Agricultural Monitoring",
  "Construction Progress",
  "Real Estate Photography",
  "Search & Rescue",
  "Other"
];

export const droneSOFTWARE = [
  "DJI Go 4",
  "DJI Pilot 2",
  "DJI Flight Hub 2",
  "Drone Deploy",
  "Pix4D Capture",
  "Pix4D Mapper",
  "Litchi",
  "Adobe Photoshop",
  "Adobe Premiere Pro",
  "Adobe Lightroom",
  "FLIR Tools",
  "FLIR Research Studio",
  "Thermal Capture",
  "Site Scan for ArcGIS",
  "Propeller Aero",
  "Other"
];

export const airspaceApprovalMethods = [
  "LAANC Authorization",
  "Part 107 Waiver",
  "Sectional Chart Review",
  "NOTAM Filing",
  "Airport Coordination",
  "Military Base Coordination",
  "None - Only in Class G airspace",
  "Other"
];