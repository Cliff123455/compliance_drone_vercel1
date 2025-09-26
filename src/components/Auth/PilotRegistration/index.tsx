"use client";
import axios from "axios";
import { signIn } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";
import Loader from "@/components/Common/Loader";
import { integrations, messages } from "../../../../integrations.config";
import z from "zod";
import {
  careerTypes,
  daysOfWeek,
  industries,
  communicationMethods,
  referralSources,
  missionTypes,
  droneSOFTWARE,
  airspaceApprovalMethods,
  flightHoursRanges
} from "@/data/pilotEquipmentData";

// Comprehensive validation schema for 23-question pilot questionnaire
const PilotRegistrationSchema = z.object({
  // Basic user info
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" })
    .refine((val) => /[A-Z]/.test(val), {
      message: "Password must contain at least one uppercase letter",
    })
    .refine((val) => /[a-z]/.test(val), {
      message: "Password must contain at least one lowercase letter",
    })
    .refine((val) => /\d/.test(val), {
      message: "Password must contain at least one number",
    }),
  phoneNumber: z.string().min(10, "Please enter a valid phone number"),
  
  // 23-Question Questionnaire Fields
  experienceDescription: z.string().min(50, "Please provide at least 50 characters describing your experience"),
  totalFlightHours: z.string().min(1, "Please select your total flight hours"),
  careerType: z.string().min(1, "Please select your career type"),
  availableDays: z.array(z.string()).min(1, "Please select at least one available day"),
  hasOwnBusiness: z.boolean(),
  companyName: z.string().optional(),
  pastJobExperience: z.string().min(10, "Please describe your past job experience"),
  airspaceApprovalExperience: z.string().min(1, "Please describe your airspace approval experience"),
  industriesExperience: z.array(z.string()).min(1, "Please select at least one industry"),
  communicationPreferences: z.array(z.string()).min(1, "Please select at least one communication method"),
  howHeardAboutUs: z.string().min(1, "Please tell us how you heard about us"),
  preferredMissionType: z.string().min(1, "Please select your preferred mission type"),
  militaryService: z.boolean(),
  mannedAircraftLicense: z.boolean(),
  advancedTraining: z.string().optional(),
  openToTraining: z.boolean(),
  softwareExperience: z.array(z.string()).min(1, "Please select at least one software"),
  emergencySituations: z.string().optional(),
  willingToTravel: z.boolean(),
  hasVehicleForTravel: z.string().min(10, "Please describe your vehicle situation"),
  canChargeBatteriesOnRoad: z.boolean(),
  teamExperience: z.string().min(10, "Please describe your team experience"),
  specialProjects: z.string().optional(),
  worksWithOtherPilots: z.string().min(10, "Please describe your work with other pilots")
}).refine((data) => {
  if (data.hasOwnBusiness) {
    return data.companyName && data.companyName.length > 0;
  }
  return true;
}, {
  message: "Company name is required when you have your own business",
  path: ["companyName"]
});

const PilotRegistration = () => {
  const [formData, setFormData] = useState({
    // Basic info
    name: "",
    email: "",
    password: "",
    phoneNumber: "",
    
    // 23-Question Questionnaire Fields
    experienceDescription: "",
    totalFlightHours: "",
    careerType: "",
    availableDays: [] as string[],
    hasOwnBusiness: false,
    companyName: "",
    pastJobExperience: "",
    airspaceApprovalExperience: "",
    industriesExperience: [] as string[],
    communicationPreferences: [] as string[],
    howHeardAboutUs: "",
    preferredMissionType: "",
    militaryService: false,
    mannedAircraftLicense: false,
    advancedTraining: "",
    openToTraining: true,
    softwareExperience: [] as string[],
    emergencySituations: "",
    willingToTravel: true,
    hasVehicleForTravel: "",
    canChargeBatteriesOnRoad: true,
    teamExperience: "",
    specialProjects: "",
    worksWithOtherPilots: ""
  });

  const [loader, setLoader] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayChange = (field: string, value: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: checked 
        ? [...(prev[field as keyof typeof prev] as string[]), value]
        : (prev[field as keyof typeof prev] as string[]).filter(item => item !== value)
    }));
  };

  const submitRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!integrations?.isAuthEnabled) {
      toast.error(messages.auth);
      return;
    }

    setLoader(true);

    const result = PilotRegistrationSchema.safeParse(formData);
    if (!result.success) {
      toast.error(result.error.errors[0].message);
      setLoader(false);
      return;
    }

    try {
      await axios.post("/api/register-pilot", formData);
      toast.success("Pilot registration submitted successfully! We'll review your application within 48 hours.");
      
      // Reset form
      setFormData({
        name: "",
        email: "",
        password: "",
        phoneNumber: "",
        experienceDescription: "",
        totalFlightHours: "",
        careerType: "",
        availableDays: [],
        hasOwnBusiness: false,
        companyName: "",
        pastJobExperience: "",
        airspaceApprovalExperience: "",
        industriesExperience: [],
        communicationPreferences: [],
        howHeardAboutUs: "",
        preferredMissionType: "",
        militaryService: false,
        mannedAircraftLicense: false,
        advancedTraining: "",
        openToTraining: true,
        softwareExperience: [],
        emergencySituations: "",
        willingToTravel: true,
        hasVehicleForTravel: "",
        canChargeBatteriesOnRoad: true,
        teamExperience: "",
        specialProjects: "",
        worksWithOtherPilots: ""
      });
    } catch (error) {
      toast.error("Registration failed. Please check your information and try again.");
    } finally {
      setLoader(false);
    }
  };

  return (
    <section className="bg-gray-2 py-20 dark:bg-dark-2 lg:py-25">
      <div className="container">
        <div className="mx-auto max-w-[800px]">
          <div className="wow fadeInUp rounded-lg bg-white px-8 py-12 shadow-form dark:bg-dark-3 dark:shadow-box-dark sm:px-12">
            <div className="mb-9 text-center">
              <h2 className="mb-3 text-2xl font-bold text-dark dark:text-white sm:text-3xl">
                Pilot Registration Questionnaire
              </h2>
              <p className="text-base text-body-color dark:text-dark-6">
                Please complete all sections of this comprehensive questionnaire to apply as a pilot for ComplianceDrone.
              </p>
            </div>

            <form onSubmit={submitRegistration} className="space-y-6">
              {/* Basic Information Section */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-dark dark:text-white">Basic Information</h3>
                
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="relative">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2">
                      <svg className="h-4 w-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    </span>
                    <input
                      type="text"
                      placeholder="Full Name *"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      className="w-full rounded-lg border border-stroke bg-transparent py-3.5 pl-14.5 pr-4 font-medium text-dark placeholder-dark-5 outline-none focus:border-primary dark:border-dark-4 dark:bg-dark-3 dark:text-white dark:placeholder-gray-400 dark:focus:border-primary"
                      required
                    />
                  </div>

                  <div className="relative">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2">
                      <svg className="h-4 w-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                      </svg>
                    </span>
                    <input
                      type="email"
                      placeholder="Email Address *"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value.toLowerCase())}
                      className="w-full rounded-lg border border-stroke bg-transparent py-3.5 pl-14.5 pr-4 font-medium text-dark placeholder-dark-5 outline-none focus:border-primary dark:border-dark-4 dark:bg-dark-3 dark:text-white dark:placeholder-gray-400 dark:focus:border-primary"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="relative">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2">
                      <svg className="h-4 w-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2z" clipRule="evenodd" />
                      </svg>
                    </span>
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Password *"
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      className="w-full rounded-lg border border-stroke bg-transparent py-3.5 pl-14.5 pr-12 font-medium text-dark placeholder-dark-5 outline-none focus:border-primary dark:border-dark-4 dark:bg-dark-3 dark:text-white dark:placeholder-gray-400 dark:focus:border-primary"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>

                  <div className="relative">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2">
                      <svg className="h-4 w-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                      </svg>
                    </span>
                    <input
                      type="tel"
                      placeholder="Phone Number *"
                      value={formData.phoneNumber}
                      onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                      className="w-full rounded-lg border border-stroke bg-transparent py-3.5 pl-14.5 pr-4 font-medium text-dark placeholder-dark-5 outline-none focus:border-primary dark:border-dark-4 dark:bg-dark-3 dark:text-white dark:placeholder-gray-400 dark:focus:border-primary"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Questionnaire Section */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-dark dark:text-white">Pilot Questionnaire</h3>
                
                {/* Question 1: Experience Description */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-dark dark:text-white">
                    1. In your own words, how would you describe your experience in the drone industry? *
                  </label>
                  <textarea
                    value={formData.experienceDescription}
                    onChange={(e) => handleInputChange("experienceDescription", e.target.value)}
                    className="h-32 w-full rounded-lg border border-stroke bg-transparent px-4 py-3 font-medium text-dark placeholder-dark-5 outline-none focus:border-primary dark:border-dark-4 dark:bg-dark-3 dark:text-white dark:placeholder-gray-400 dark:focus:border-primary"
                    placeholder="Describe your experience, certifications, and expertise..."
                    required
                  />
                </div>

                {/* Question 2: Flight Hours */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-dark dark:text-white">
                    2. How many total drone flight hours have you flown? *
                  </label>
                  <select
                    value={formData.totalFlightHours}
                    onChange={(e) => handleInputChange("totalFlightHours", e.target.value)}
                    className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 font-medium text-dark outline-none focus:border-primary dark:border-dark-4 dark:bg-dark-3 dark:text-white dark:focus:border-primary"
                    required
                  >
                    <option value="" className="bg-white dark:bg-dark-3">Select flight hours</option>
                    {flightHoursRanges.map((range) => (
                      <option key={range.value} value={range.value} className="bg-white dark:bg-dark-3">
                        {range.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Question 3: Career Type */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-dark dark:text-white">
                    3. What would you consider your drone career to be? *
                  </label>
                  <select
                    value={formData.careerType}
                    onChange={(e) => handleInputChange("careerType", e.target.value)}
                    className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 font-medium text-dark outline-none focus:border-primary dark:border-dark-4 dark:bg-dark-3 dark:text-white dark:focus:border-primary"
                    required
                  >
                    <option value="" className="bg-white dark:bg-dark-3">Select career type</option>
                    {careerTypes.map((type) => (
                      <option key={type} value={type} className="bg-white dark:bg-dark-3">
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Question 4: Available Days */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-dark dark:text-white">
                    4. What days are best for you for flying missions? *
                  </label>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {daysOfWeek.map((day) => (
                      <label key={day} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.availableDays.includes(day)}
                          onChange={(e) => handleArrayChange("availableDays", day, e.target.checked)}
                          className="h-4 w-4 rounded border-stroke text-primary focus:ring-primary dark:border-dark-4"
                        />
                        <span className="text-sm text-dark dark:text-white">{day}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Question 5: Own Business */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-dark dark:text-white">
                    5. Do you currently have your own drone business? *
                  </label>
                  <div className="space-y-3">
                    <div className="flex space-x-6">
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="hasOwnBusiness"
                          checked={formData.hasOwnBusiness === true}
                          onChange={() => handleInputChange("hasOwnBusiness", true)}
                          className="h-4 w-4 text-primary focus:ring-primary"
                        />
                        <span className="text-sm text-dark dark:text-white">Yes</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="hasOwnBusiness"
                          checked={formData.hasOwnBusiness === false}
                          onChange={() => handleInputChange("hasOwnBusiness", false)}
                          className="h-4 w-4 text-primary focus:ring-primary"
                        />
                        <span className="text-sm text-dark dark:text-white">No</span>
                      </label>
                    </div>
                    {formData.hasOwnBusiness && (
                      <input
                        type="text"
                        placeholder="Company Name *"
                        value={formData.companyName}
                        onChange={(e) => handleInputChange("companyName", e.target.value)}
                        className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 font-medium text-dark placeholder-dark-5 outline-none focus:border-primary dark:border-dark-4 dark:bg-dark-3 dark:text-white dark:placeholder-gray-400 dark:focus:border-primary"
                        required
                      />
                    )}
                  </div>
                </div>

                {/* Question 6: Past Job Experience */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-dark dark:text-white">
                    6. What is your current full-time/past job experience outside of UAS? *
                  </label>
                  <textarea
                    value={formData.pastJobExperience}
                    onChange={(e) => handleInputChange("pastJobExperience", e.target.value)}
                    className="h-24 w-full rounded-lg border border-stroke bg-transparent px-4 py-3 font-medium text-dark placeholder-dark-5 outline-none focus:border-primary dark:border-dark-4 dark:bg-dark-3 dark:text-white dark:placeholder-gray-400 dark:focus:border-primary"
                    placeholder="e.g., Construction Manager, Master Electrician, etc."
                    required
                  />
                </div>

                {/* Question 7: Airspace Approval */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-dark dark:text-white">
                    7. In what ways have you applied for airspace approval? *
                  </label>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {airspaceApprovalMethods.map((method) => (
                      <label key={method} className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="airspaceApprovalExperience"
                          checked={formData.airspaceApprovalExperience === method}
                          onChange={() => handleInputChange("airspaceApprovalExperience", method)}
                          className="h-4 w-4 text-primary focus:ring-primary"
                        />
                        <span className="text-sm text-dark dark:text-white">{method}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Question 8: Industries Experience */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-dark dark:text-white">
                    8. What industries do you have experience flying drones in? *
                  </label>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {industries.map((industry) => (
                      <label key={industry} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.industriesExperience.includes(industry)}
                          onChange={(e) => handleArrayChange("industriesExperience", industry, e.target.checked)}
                          className="h-4 w-4 rounded border-stroke text-primary focus:ring-primary dark:border-dark-4"
                        />
                        <span className="text-sm text-dark dark:text-white">{industry}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Question 9: Communication Preferences */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-dark dark:text-white">
                    9. What is your preferred method of communication? *
                  </label>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {communicationMethods.map((method) => (
                      <label key={method} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.communicationPreferences.includes(method)}
                          onChange={(e) => handleArrayChange("communicationPreferences", method, e.target.checked)}
                          className="h-4 w-4 rounded border-stroke text-primary focus:ring-primary dark:border-dark-4"
                        />
                        <span className="text-sm text-dark dark:text-white">{method}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Question 10: How heard about us */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-dark dark:text-white">
                    10. How did you hear about us? *
                  </label>
                  <select
                    value={formData.howHeardAboutUs}
                    onChange={(e) => handleInputChange("howHeardAboutUs", e.target.value)}
                    className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 font-medium text-dark outline-none focus:border-primary dark:border-dark-4 dark:bg-dark-3 dark:text-white dark:focus:border-primary"
                    required
                  >
                    <option value="" className="bg-white dark:bg-dark-3">Select source</option>
                    {referralSources.map((source) => (
                      <option key={source} value={source} className="bg-white dark:bg-dark-3">
                        {source}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Question 11: Mission Type */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-dark dark:text-white">
                    11. What type of drone mission are you most interested in? *
                  </label>
                  <select
                    value={formData.preferredMissionType}
                    onChange={(e) => handleInputChange("preferredMissionType", e.target.value)}
                    className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 font-medium text-dark outline-none focus:border-primary dark:border-dark-4 dark:bg-dark-3 dark:text-white dark:focus:border-primary"
                    required
                  >
                    <option value="" className="bg-white dark:bg-dark-3">Select mission type</option>
                    {missionTypes.map((type) => (
                      <option key={type} value={type} className="bg-white dark:bg-dark-3">
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Question 12: Military Service */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-dark dark:text-white">
                    12. Do you currently or have you previously served in the military? *
                  </label>
                  <div className="flex space-x-6">
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="militaryService"
                        checked={formData.militaryService === true}
                        onChange={() => handleInputChange("militaryService", true)}
                        className="h-4 w-4 text-primary focus:ring-primary"
                      />
                      <span className="text-sm text-dark dark:text-white">Yes</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="militaryService"
                        checked={formData.militaryService === false}
                        onChange={() => handleInputChange("militaryService", false)}
                        className="h-4 w-4 text-primary focus:ring-primary"
                      />
                      <span className="text-sm text-dark dark:text-white">No</span>
                    </label>
                  </div>
                </div>

                {/* Question 13: Manned Aircraft License */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-dark dark:text-white">
                    13. Do you have a manned aircraft license? *
                  </label>
                  <div className="flex space-x-6">
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="mannedAircraftLicense"
                        checked={formData.mannedAircraftLicense === true}
                        onChange={() => handleInputChange("mannedAircraftLicense", true)}
                        className="h-4 w-4 text-primary focus:ring-primary"
                      />
                      <span className="text-sm text-dark dark:text-white">Yes</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="mannedAircraftLicense"
                        checked={formData.mannedAircraftLicense === false}
                        onChange={() => handleInputChange("mannedAircraftLicense", false)}
                        className="h-4 w-4 text-primary focus:ring-primary"
                      />
                      <span className="text-sm text-dark dark:text-white">No</span>
                    </label>
                  </div>
                </div>

                {/* Question 14: Advanced Training */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-dark dark:text-white">
                    14. Do you have any advanced training or education pertaining to UAS?
                  </label>
                  <textarea
                    value={formData.advancedTraining}
                    onChange={(e) => handleInputChange("advancedTraining", e.target.value)}
                    className="h-24 w-full rounded-lg border border-stroke bg-transparent px-4 py-3 font-medium text-dark placeholder-dark-5 outline-none focus:border-primary dark:border-dark-4 dark:bg-dark-3 dark:text-white dark:placeholder-gray-400 dark:focus:border-primary"
                    placeholder="e.g., Level 1 Drone Thermographer, specific courses, etc."
                  />
                </div>

                {/* Question 15: Open to Training */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-dark dark:text-white">
                    15. Are you open to participating in training or workshops to enhance your skills? *
                  </label>
                  <div className="flex space-x-6">
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="openToTraining"
                        checked={formData.openToTraining === true}
                        onChange={() => handleInputChange("openToTraining", true)}
                        className="h-4 w-4 text-primary focus:ring-primary"
                      />
                      <span className="text-sm text-dark dark:text-white">Yes</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="openToTraining"
                        checked={formData.openToTraining === false}
                        onChange={() => handleInputChange("openToTraining", false)}
                        className="h-4 w-4 text-primary focus:ring-primary"
                      />
                      <span className="text-sm text-dark dark:text-white">No</span>
                    </label>
                  </div>
                </div>

                {/* Question 16: Software Experience */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-dark dark:text-white">
                    16. Of the following software, what do you have experience with? *
                  </label>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {droneSOFTWARE.map((software) => (
                      <label key={software} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.softwareExperience.includes(software)}
                          onChange={(e) => handleArrayChange("softwareExperience", software, e.target.checked)}
                          className="h-4 w-4 rounded border-stroke text-primary focus:ring-primary dark:border-dark-4"
                        />
                        <span className="text-sm text-dark dark:text-white">{software}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Question 17: Emergency Situations */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-dark dark:text-white">
                    17. Have you faced any challenging or emergency situations during drone operations, and if so, how did you address them?
                  </label>
                  <textarea
                    value={formData.emergencySituations}
                    onChange={(e) => handleInputChange("emergencySituations", e.target.value)}
                    className="h-24 w-full rounded-lg border border-stroke bg-transparent px-4 py-3 font-medium text-dark placeholder-dark-5 outline-none focus:border-primary dark:border-dark-4 dark:bg-dark-3 dark:text-white dark:placeholder-gray-400 dark:focus:border-primary"
                    placeholder="Describe any challenging situations and how you handled them..."
                  />
                </div>

                {/* Question 18: Willing to Travel */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-dark dark:text-white">
                    18. Are you willing to travel away from home if we have a multiple-day project? *
                  </label>
                  <div className="flex space-x-6">
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="willingToTravel"
                        checked={formData.willingToTravel === true}
                        onChange={() => handleInputChange("willingToTravel", true)}
                        className="h-4 w-4 text-primary focus:ring-primary"
                      />
                      <span className="text-sm text-dark dark:text-white">Yes</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="willingToTravel"
                        checked={formData.willingToTravel === false}
                        onChange={() => handleInputChange("willingToTravel", false)}
                        className="h-4 w-4 text-primary focus:ring-primary"
                      />
                      <span className="text-sm text-dark dark:text-white">No</span>
                    </label>
                  </div>
                </div>

                {/* Question 19: Vehicle for Travel */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-dark dark:text-white">
                    19. Do you have a vehicle fit for being on the road for lengths at a time? *
                  </label>
                  <textarea
                    value={formData.hasVehicleForTravel}
                    onChange={(e) => handleInputChange("hasVehicleForTravel", e.target.value)}
                    className="h-24 w-full rounded-lg border border-stroke bg-transparent px-4 py-3 font-medium text-dark placeholder-dark-5 outline-none focus:border-primary dark:border-dark-4 dark:bg-dark-3 dark:text-white dark:placeholder-gray-400 dark:focus:border-primary"
                    placeholder="e.g., Yes, Ram 2021 with job box and interior laptop and screen mount for flying."
                    required
                  />
                </div>

                {/* Question 20: Battery Charging */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-dark dark:text-white">
                    20. Are you able to charge batteries on the road? *
                  </label>
                  <div className="flex space-x-6">
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="canChargeBatteriesOnRoad"
                        checked={formData.canChargeBatteriesOnRoad === true}
                        onChange={() => handleInputChange("canChargeBatteriesOnRoad", true)}
                        className="h-4 w-4 text-primary focus:ring-primary"
                      />
                      <span className="text-sm text-dark dark:text-white">Yes</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="canChargeBatteriesOnRoad"
                        checked={formData.canChargeBatteriesOnRoad === false}
                        onChange={() => handleInputChange("canChargeBatteriesOnRoad", false)}
                        className="h-4 w-4 text-primary focus:ring-primary"
                      />
                      <span className="text-sm text-dark dark:text-white">No</span>
                    </label>
                  </div>
                </div>

                {/* Question 21: Team Experience */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-dark dark:text-white">
                    21. Do you have experience working with a team of pilots for an extended project? *
                  </label>
                  <textarea
                    value={formData.teamExperience}
                    onChange={(e) => handleInputChange("teamExperience", e.target.value)}
                    className="h-24 w-full rounded-lg border border-stroke bg-transparent px-4 py-3 font-medium text-dark placeholder-dark-5 outline-none focus:border-primary dark:border-dark-4 dark:bg-dark-3 dark:text-white dark:placeholder-gray-400 dark:focus:border-primary"
                    placeholder="e.g., Yes, currently managing pilots on projects across different locations."
                    required
                  />
                </div>

                {/* Question 22: Special Projects */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-dark dark:text-white">
                    22. If you have worked on a special project, tell us about it.
                  </label>
                  <textarea
                    value={formData.specialProjects}
                    onChange={(e) => handleInputChange("specialProjects", e.target.value)}
                    className="h-24 w-full rounded-lg border border-stroke bg-transparent px-4 py-3 font-medium text-dark placeholder-dark-5 outline-none focus:border-primary dark:border-dark-4 dark:bg-dark-3 dark:text-white dark:placeholder-gray-400 dark:focus:border-primary"
                    placeholder="Describe any special projects you've worked on..."
                  />
                </div>

                {/* Question 23: Works with Other Pilots */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-dark dark:text-white">
                    23. Do you work regularly with other drone pilots? *
                  </label>
                  <textarea
                    value={formData.worksWithOtherPilots}
                    onChange={(e) => handleInputChange("worksWithOtherPilots", e.target.value)}
                    className="h-24 w-full rounded-lg border border-stroke bg-transparent px-4 py-3 font-medium text-dark placeholder-dark-5 outline-none focus:border-primary dark:border-dark-4 dark:bg-dark-3 dark:text-white dark:placeholder-gray-400 dark:focus:border-primary"
                    placeholder="e.g., Yes, collaborating with pilots on various projects."
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="submit"
                  disabled={loader}
                  className="inline-flex w-full items-center justify-center rounded-lg bg-primary px-8 py-4 font-semibold text-white transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50"
                >
                  {loader ? <Loader /> : "Submit Application"}
                </button>
              </div>

              <div className="mt-6 text-center">
                <p className="text-base text-body-color dark:text-dark-6">
                  Already have an account?{" "}
                  <Link
                    href="/auth/signin"
                    className="text-primary hover:underline"
                  >
                    Sign in here
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PilotRegistration;