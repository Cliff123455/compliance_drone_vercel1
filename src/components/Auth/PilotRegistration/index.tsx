"use client";

import axios from "axios";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useMemo, useState } from "react";
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
  flightHoursRanges,
} from "@/data/pilotEquipmentData";

const PilotRegistrationSchema = z
  .object({
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
    experienceDescription: z
      .string()
      .min(50, "Please provide at least 50 characters describing your experience"),
    totalFlightHours: z.string().min(1, "Please select your total flight hours"),
    careerType: z.string().min(1, "Please select your career type"),
    availableDays: z
      .array(z.string())
      .min(1, "Please select at least one available day"),
    hasOwnBusiness: z.boolean(),
    companyName: z.string().optional(),
    pastJobExperience: z
      .string()
      .min(10, "Please describe your past job experience"),
    airspaceApprovalExperience: z
      .string()
      .min(1, "Please describe your airspace approval experience"),
    industriesExperience: z
      .array(z.string())
      .min(1, "Please select at least one industry"),
    communicationPreferences: z
      .array(z.string())
      .min(1, "Please select at least one communication method"),
    howHeardAboutUs: z
      .string()
      .min(1, "Please tell us how you heard about us"),
    preferredMissionType: z
      .string()
      .min(1, "Please select your preferred mission type"),
    militaryService: z.boolean(),
    mannedAircraftLicense: z.boolean(),
    advancedTraining: z.string().optional(),
    openToTraining: z.boolean(),
    softwareExperience: z
      .array(z.string())
      .min(1, "Please select at least one software"),
    emergencySituations: z.string().optional(),
    willingToTravel: z.boolean(),
    hasVehicleForTravel: z
      .string()
      .min(10, "Please describe your vehicle situation"),
    canChargeBatteriesOnRoad: z.boolean(),
    teamExperience: z
      .string()
      .min(10, "Please describe your team experience"),
    specialProjects: z.string().optional(),
    worksWithOtherPilots: z
      .string()
      .min(10, "Please describe your work with other pilots"),
  })
  .refine((data) => {
    if (data.hasOwnBusiness) {
      return data.companyName && data.companyName.length > 0;
    }
    return true;
  }, {
    message: "Company name is required when you have your own business",
    path: ["companyName"],
  });

const personalInfoSchema = z
  .object({
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
    hasOwnBusiness: z.boolean(),
    companyName: z.string().optional(),
    pastJobExperience: z
      .string()
      .min(10, "Please describe your past job experience"),
    howHeardAboutUs: z
      .string()
      .min(1, "Please tell us how you heard about us"),
  })
  .refine((data) => {
    if (data.hasOwnBusiness) {
      return data.companyName && data.companyName.length > 0;
    }
    return true;
  }, {
    message: "Company name is required when you have your own business",
    path: ["companyName"],
  });

const licensingSchema = z.object({
  experienceDescription: z
    .string()
    .min(50, "Please provide at least 50 characters describing your experience"),
  totalFlightHours: z.string().min(1, "Please select your total flight hours"),
  careerType: z.string().min(1, "Please select your career type"),
  airspaceApprovalExperience: z
    .string()
    .min(1, "Please describe your airspace approval experience"),
  industriesExperience: z
    .array(z.string())
    .min(1, "Please select at least one industry"),
  militaryService: z.boolean(),
  mannedAircraftLicense: z.boolean(),
  advancedTraining: z.string().optional(),
  openToTraining: z.boolean(),
});

const operationsSchema = z.object({
  preferredMissionType: z
    .string()
    .min(1, "Please select your preferred mission type"),
  softwareExperience: z
    .array(z.string())
    .min(1, "Please select at least one software"),
  availableDays: z
    .array(z.string())
    .min(1, "Please select at least one available day"),
  communicationPreferences: z
    .array(z.string())
    .min(1, "Please select at least one communication method"),
  emergencySituations: z.string().optional(),
  willingToTravel: z.boolean(),
  hasVehicleForTravel: z
    .string()
    .min(10, "Please describe your vehicle situation"),
  canChargeBatteriesOnRoad: z.boolean(),
});

const collaborationSchema = z.object({
  teamExperience: z
    .string()
    .min(10, "Please describe your team experience"),
  specialProjects: z.string().optional(),
  worksWithOtherPilots: z
    .string()
    .min(10, "Please describe your work with other pilots"),
});

type PilotFormState = z.infer<typeof PilotRegistrationSchema>;

const steps = [
  {
    title: "Personal Information",
    description: "Tell us how to contact you and learn about your business.",
  },
  {
    title: "Licensing & Experience",
    description: "Share your credentials and industry background.",
  },
  {
    title: "Operations & Availability",
    description: "Help us understand when and how you fly missions.",
  },
  {
    title: "Collaboration",
    description: "Show us how you work with teams and special projects.",
  },
];

const defaultFormState: PilotFormState = {
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
  worksWithOtherPilots: "",
};

const PilotRegistration = () => {
  const [formData, setFormData] = useState<PilotFormState>(defaultFormState);
  const [loader, setLoader] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const stepValidationFns = useMemo(
    () => [
      () => personalInfoSchema.safeParse(formData),
      () => licensingSchema.safeParse(formData),
      () => operationsSchema.safeParse(formData),
      () => collaborationSchema.safeParse(formData),
    ],
    [formData],
  );

  const handleInputChange = (field: keyof PilotFormState, value: PilotFormState[keyof PilotFormState]) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleArrayChange = (field: keyof PilotFormState, value: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: checked
        ? ([...(prev[field] as string[]), value] as PilotFormState[keyof PilotFormState])
        : ((prev[field] as string[]).filter((item) => item !== value) as PilotFormState[keyof PilotFormState]),
    }));
  };

  const handleToggle = (field: keyof PilotFormState, value: boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value as PilotFormState[keyof PilotFormState],
    }));
  };

  const goToNextStep = () => {
    const validationResult = stepValidationFns[currentStep]();
    if (!validationResult.success) {
      toast.error(validationResult.error.errors[0]?.message ?? "Please complete the required fields");
      return;
    }

    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goToPreviousStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const submitRegistration = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const validation = stepValidationFns[currentStep]();
    if (!validation.success) {
      toast.error(validation.error.errors[0]?.message ?? "Please complete the required fields");
      return;
    }

    if (!integrations?.isAuthEnabled) {
      toast.error(messages.auth);
      return;
    }

    setLoader(true);

    const finalValidation = PilotRegistrationSchema.safeParse(formData);
    if (!finalValidation.success) {
      toast.error(finalValidation.error.errors[0]?.message ?? "Please review your answers");
      setLoader(false);
      return;
    }

    try {
      await axios.post("/api/register-pilot", formData);
      toast.success("Pilot registration submitted! We'll review your application within 48 hours.");

      const emailSignIn = await signIn("email", {
        email: formData.email,
        redirect: false,
        callbackUrl: "/auth/signin",
      });

      if (emailSignIn?.error) {
        toast.error("We couldn't send your verification email. Please try signing in manually.");
      } else {
        toast.success("Check your inbox to verify your email and activate your account.");
      }

      setFormData(defaultFormState);
      setCurrentStep(0);
    } catch (error) {
      toast.error("Registration failed. Please check your information and try again.");
    } finally {
      setLoader(false);
    }
  };

  return (
    <section className="bg-gray-2 py-16 dark:bg-dark-2 sm:py-20">
      <div className="container px-0 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-2xl bg-white p-6 shadow-lg dark:bg-dark-3 dark:shadow-box-dark sm:p-10">
            <div className="mb-8 text-center sm:text-left">
              <h2 className="text-2xl font-bold text-dark dark:text-white sm:text-3xl">
                Join the ComplianceDrone Pilot Network
              </h2>
              <p className="mt-2 text-base text-body-color dark:text-dark-6">
                Complete this four-step application to help us verify your credentials and get you missions faster.
              </p>
            </div>

            <ol className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
              {steps.map((step, index) => {
                const isActive = index === currentStep;
                const isCompleted = index < currentStep;

                return (
                  <li
                    key={step.title}
                    className="flex flex-1 items-start gap-3 rounded-xl border border-stroke p-4 dark:border-dark-4"
                  >
                    <span
                      className={`flex h-9 w-9 items-center justify-center rounded-full border text-sm font-semibold transition-colors ${
                        isActive
                          ? "border-primary bg-primary text-white"
                          : isCompleted
                          ? "border-primary/40 bg-primary/10 text-primary"
                          : "border-gray-300 bg-white text-gray-500 dark:border-dark-4 dark:bg-dark-2"
                      }`}
                    >
                      {index + 1}
                    </span>
                    <div>
                      <p
                        className={`text-sm font-semibold ${
                          isActive ? "text-primary" : "text-dark dark:text-white"
                        }`}
                      >
                        {step.title}
                      </p>
                      <p className="mt-1 text-sm text-body-color dark:text-dark-6">{step.description}</p>
                    </div>
                  </li>
                );
              })}
            </ol>

            <form onSubmit={submitRegistration} className="space-y-8">
              {currentStep === 0 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        placeholder="Jane Doe"
                        className="w-full rounded-lg border border-stroke bg-white px-4 py-3 text-base text-dark placeholder:text-body-color/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-dark-4 dark:bg-dark-2 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value.toLowerCase())}
                        placeholder="you@email.com"
                        className="w-full rounded-lg border border-stroke bg-white px-4 py-3 text-base text-dark placeholder:text-body-color/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-dark-4 dark:bg-dark-2 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="relative">
                      <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
                        Password *
                      </label>
                      <input
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) => handleInputChange("password", e.target.value)}
                        placeholder="Create a secure password"
                        className="w-full rounded-lg border border-stroke bg-white px-4 py-3 text-base text-dark placeholder:text-body-color/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-dark-4 dark:bg-dark-2 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-3 top-11 text-sm font-medium text-primary"
                      >
                        {showPassword ? "Hide" : "Show"}
                      </button>
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        value={formData.phoneNumber}
                        onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                        placeholder="(555) 555-5555"
                        className="w-full rounded-lg border border-stroke bg-white px-4 py-3 text-base text-dark placeholder:text-body-color/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-dark-4 dark:bg-dark-2 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
                      Do you currently have your own drone business? *
                    </label>
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <button
                        type="button"
                        onClick={() => handleToggle("hasOwnBusiness", true)}
                        className={`flex flex-1 items-center justify-center rounded-lg border px-4 py-3 text-sm font-semibold transition-colors ${
                          formData.hasOwnBusiness
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-stroke text-dark hover:border-primary hover:text-primary dark:border-dark-4 dark:text-white"
                        }`}
                      >
                        Yes
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggle("hasOwnBusiness", false)}
                        className={`flex flex-1 items-center justify-center rounded-lg border px-4 py-3 text-sm font-semibold transition-colors ${
                          !formData.hasOwnBusiness
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-stroke text-dark hover:border-primary hover:text-primary dark:border-dark-4 dark:text-white"
                        }`}
                      >
                        No
                      </button>
                    </div>
                    {formData.hasOwnBusiness && (
                      <div className="mt-4">
                        <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
                          Company Name *
                        </label>
                        <input
                          type="text"
                          value={formData.companyName}
                          onChange={(e) => handleInputChange("companyName", e.target.value)}
                          placeholder="Compliance Drone LLC"
                          className="w-full rounded-lg border border-stroke bg-white px-4 py-3 text-base text-dark placeholder:text-body-color/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-dark-4 dark:bg-dark-2 dark:text-white"
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
                      How did you hear about ComplianceDrone? *
                    </label>
                    <select
                      value={formData.howHeardAboutUs}
                      onChange={(e) => handleInputChange("howHeardAboutUs", e.target.value)}
                      className="w-full rounded-lg border border-stroke bg-white px-4 py-3 text-base text-dark focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-dark-4 dark:bg-dark-2 dark:text-white"
                    >
                      <option value="">Select an option</option>
                      {referralSources.map((source) => (
                        <option key={source} value={source}>
                          {source}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
                      What is your current full-time/past job experience outside of UAS? *
                    </label>
                    <textarea
                      value={formData.pastJobExperience}
                      onChange={(e) => handleInputChange("pastJobExperience", e.target.value)}
                      placeholder="e.g., Construction Manager, Master Electrician, etc."
                      className="h-28 w-full rounded-lg border border-stroke bg-white px-4 py-3 text-base text-dark placeholder:text-body-color/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-dark-4 dark:bg-dark-2 dark:text-white"
                    />
                  </div>
                </div>
              )}

              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
                      In your own words, how would you describe your experience in the drone industry? *
                    </label>
                    <textarea
                      value={formData.experienceDescription}
                      onChange={(e) => handleInputChange("experienceDescription", e.target.value)}
                      placeholder="Share certifications, mission types, industries served, etc."
                      className="h-32 w-full rounded-lg border border-stroke bg-white px-4 py-3 text-base text-dark placeholder:text-body-color/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-dark-4 dark:bg-dark-2 dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
                        Total drone flight hours *
                      </label>
                      <select
                        value={formData.totalFlightHours}
                        onChange={(e) => handleInputChange("totalFlightHours", e.target.value)}
                        className="w-full rounded-lg border border-stroke bg-white px-4 py-3 text-base text-dark focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-dark-4 dark:bg-dark-2 dark:text-white"
                      >
                        <option value="">Select flight hours</option>
                        {flightHoursRanges.map((range) => (
                          <option key={range.value} value={range.value}>
                            {range.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
                        What would you consider your drone career to be? *
                      </label>
                      <select
                        value={formData.careerType}
                        onChange={(e) => handleInputChange("careerType", e.target.value)}
                        className="w-full rounded-lg border border-stroke bg-white px-4 py-3 text-base text-dark focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-dark-4 dark:bg-dark-2 dark:text-white"
                      >
                        <option value="">Select career type</option>
                        {careerTypes.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
                      In what ways have you applied for airspace approval? *
                    </label>
                    <select
                      value={formData.airspaceApprovalExperience}
                      onChange={(e) => handleInputChange("airspaceApprovalExperience", e.target.value)}
                      className="w-full rounded-lg border border-stroke bg-white px-4 py-3 text-base text-dark focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-dark-4 dark:bg-dark-2 dark:text-white"
                    >
                      <option value="">Select an option</option>
                      {airspaceApprovalMethods.map((method) => (
                        <option key={method} value={method}>
                          {method}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-3 block text-sm font-medium text-dark dark:text-white">
                      What industries do you have experience flying drones in? *
                    </label>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {industries.map((industry) => (
                        <label
                          key={industry}
                          className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 text-sm font-medium transition-colors ${
                            formData.industriesExperience.includes(industry)
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-stroke text-dark hover:border-primary hover:text-primary dark:border-dark-4 dark:text-white"
                          }`}
                        >
                          <input
                            type="checkbox"
                            className="hidden"
                            checked={formData.industriesExperience.includes(industry)}
                            onChange={(e) => handleArrayChange("industriesExperience", industry, e.target.checked)}
                          />
                          {industry}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
                        Have you served in the military? *
                      </label>
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => handleToggle("militaryService", true)}
                          className={`flex-1 rounded-lg border px-4 py-3 text-sm font-semibold transition-colors ${
                            formData.militaryService
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-stroke text-dark hover:border-primary hover:text-primary dark:border-dark-4 dark:text-white"
                          }`}
                        >
                          Yes
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggle("militaryService", false)}
                          className={`flex-1 rounded-lg border px-4 py-3 text-sm font-semibold transition-colors ${
                            !formData.militaryService
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-stroke text-dark hover:border-primary hover:text-primary dark:border-dark-4 dark:text-white"
                          }`}
                        >
                          No
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
                        Do you have a manned aircraft license? *
                      </label>
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => handleToggle("mannedAircraftLicense", true)}
                          className={`flex-1 rounded-lg border px-4 py-3 text-sm font-semibold transition-colors ${
                            formData.mannedAircraftLicense
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-stroke text-dark hover:border-primary hover:text-primary dark:border-dark-4 dark:text-white"
                          }`}
                        >
                          Yes
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggle("mannedAircraftLicense", false)}
                          className={`flex-1 rounded-lg border px-4 py-3 text-sm font-semibold transition-colors ${
                            !formData.mannedAircraftLicense
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-stroke text-dark hover:border-primary hover:text-primary dark:border-dark-4 dark:text-white"
                          }`}
                        >
                          No
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
                      What advanced training have you completed? (optional)
                    </label>
                    <textarea
                      value={formData.advancedTraining}
                      onChange={(e) => handleInputChange("advancedTraining", e.target.value)}
                      placeholder="e.g., Thermography Level 1, Energy Audits, etc."
                      className="h-24 w-full rounded-lg border border-stroke bg-white px-4 py-3 text-base text-dark placeholder:text-body-color/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-dark-4 dark:bg-dark-2 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
                      Are you open to additional training from ComplianceDrone? *
                    </label>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => handleToggle("openToTraining", true)}
                        className={`flex-1 rounded-lg border px-4 py-3 text-sm font-semibold transition-colors ${
                          formData.openToTraining
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-stroke text-dark hover:border-primary hover:text-primary dark:border-dark-4 dark:text-white"
                        }`}
                      >
                        Yes
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggle("openToTraining", false)}
                        className={`flex-1 rounded-lg border px-4 py-3 text-sm font-semibold transition-colors ${
                          !formData.openToTraining
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-stroke text-dark hover:border-primary hover:text-primary dark:border-dark-4 dark:text-white"
                        }`}
                      >
                        No
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
                      What type of drone mission are you most interested in? *
                    </label>
                    <select
                      value={formData.preferredMissionType}
                      onChange={(e) => handleInputChange("preferredMissionType", e.target.value)}
                      className="w-full rounded-lg border border-stroke bg-white px-4 py-3 text-base text-dark focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-dark-4 dark:bg-dark-2 dark:text-white"
                    >
                      <option value="">Select mission type</option>
                      {missionTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-3 block text-sm font-medium text-dark dark:text-white">
                      What days are best for you for flying missions? *
                    </label>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {daysOfWeek.map((day) => (
                        <label
                          key={day}
                          className={`flex cursor-pointer items-center justify-center rounded-lg border px-4 py-3 text-sm font-medium transition-colors ${
                            formData.availableDays.includes(day)
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-stroke text-dark hover:border-primary hover:text-primary dark:border-dark-4 dark:text-white"
                          }`}
                        >
                          <input
                            type="checkbox"
                            className="hidden"
                            checked={formData.availableDays.includes(day)}
                            onChange={(e) => handleArrayChange("availableDays", day, e.target.checked)}
                          />
                          {day}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="mb-3 block text-sm font-medium text-dark dark:text-white">
                      What is your preferred method of communication? *
                    </label>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                      {communicationMethods.map((method) => (
                        <label
                          key={method}
                          className={`flex cursor-pointer items-center justify-center rounded-lg border px-4 py-3 text-sm font-medium transition-colors ${
                            formData.communicationPreferences.includes(method)
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-stroke text-dark hover:border-primary hover:text-primary dark:border-dark-4 dark:text-white"
                          }`}
                        >
                          <input
                            type="checkbox"
                            className="hidden"
                            checked={formData.communicationPreferences.includes(method)}
                            onChange={(e) => handleArrayChange("communicationPreferences", method, e.target.checked)}
                          />
                          {method}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="mb-3 block text-sm font-medium text-dark dark:text-white">
                      What drone software platforms do you use regularly? *
                    </label>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {droneSOFTWARE.map((software) => (
                        <label
                          key={software}
                          className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 text-sm font-medium transition-colors ${
                            formData.softwareExperience.includes(software)
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-stroke text-dark hover:border-primary hover:text-primary dark:border-dark-4 dark:text-white"
                          }`}
                        >
                          <input
                            type="checkbox"
                            className="hidden"
                            checked={formData.softwareExperience.includes(software)}
                            onChange={(e) => handleArrayChange("softwareExperience", software, e.target.checked)}
                          />
                          {software}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
                      Describe any emergency situations you&apos;ve managed while flying. (optional)
                    </label>
                    <textarea
                      value={formData.emergencySituations}
                      onChange={(e) => handleInputChange("emergencySituations", e.target.value)}
                      placeholder="Tell us about an emergency or unexpected situation and how you handled it."
                      className="h-24 w-full rounded-lg border border-stroke bg-white px-4 py-3 text-base text-dark placeholder:text-body-color/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-dark-4 dark:bg-dark-2 dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
                        Are you willing to travel for extended missions? *
                      </label>
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => handleToggle("willingToTravel", true)}
                          className={`flex-1 rounded-lg border px-4 py-3 text-sm font-semibold transition-colors ${
                            formData.willingToTravel
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-stroke text-dark hover:border-primary hover:text-primary dark:border-dark-4 dark:text-white"
                          }`}
                        >
                          Yes
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggle("willingToTravel", false)}
                          className={`flex-1 rounded-lg border px-4 py-3 text-sm font-semibold transition-colors ${
                            !formData.willingToTravel
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-stroke text-dark hover:border-primary hover:text-primary dark:border-dark-4 dark:text-white"
                          }`}
                        >
                          No
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
                        Are you able to charge batteries on the road? *
                      </label>
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => handleToggle("canChargeBatteriesOnRoad", true)}
                          className={`flex-1 rounded-lg border px-4 py-3 text-sm font-semibold transition-colors ${
                            formData.canChargeBatteriesOnRoad
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-stroke text-dark hover:border-primary hover:text-primary dark:border-dark-4 dark:text-white"
                          }`}
                        >
                          Yes
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggle("canChargeBatteriesOnRoad", false)}
                          className={`flex-1 rounded-lg border px-4 py-3 text-sm font-semibold transition-colors ${
                            !formData.canChargeBatteriesOnRoad
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-stroke text-dark hover:border-primary hover:text-primary dark:border-dark-4 dark:text-white"
                          }`}
                        >
                          No
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
                      Do you have a vehicle fit for being on the road for lengths at a time? *
                    </label>
                    <textarea
                      value={formData.hasVehicleForTravel}
                      onChange={(e) => handleInputChange("hasVehicleForTravel", e.target.value)}
                      placeholder="e.g., Yes, Ram 2021 with job box and interior laptop and screen mount for flying."
                      className="h-24 w-full rounded-lg border border-stroke bg-white px-4 py-3 text-base text-dark placeholder:text-body-color/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-dark-4 dark:bg-dark-2 dark:text-white"
                    />
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
                      Do you have experience working with a team of pilots for an extended project? *
                    </label>
                    <textarea
                      value={formData.teamExperience}
                      onChange={(e) => handleInputChange("teamExperience", e.target.value)}
                      placeholder="e.g., Yes, currently managing pilots on projects across different locations."
                      className="h-28 w-full rounded-lg border border-stroke bg-white px-4 py-3 text-base text-dark placeholder:text-body-color/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-dark-4 dark:bg-dark-2 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
                      If you have worked on a special project, tell us about it. (optional)
                    </label>
                    <textarea
                      value={formData.specialProjects}
                      onChange={(e) => handleInputChange("specialProjects", e.target.value)}
                      placeholder="Describe any special projects you&apos;ve worked on..."
                      className="h-28 w-full rounded-lg border border-stroke bg-white px-4 py-3 text-base text-dark placeholder:text-body-color/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-dark-4 dark:bg-dark-2 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
                      Do you work regularly with other drone pilots? *
                    </label>
                    <textarea
                      value={formData.worksWithOtherPilots}
                      onChange={(e) => handleInputChange("worksWithOtherPilots", e.target.value)}
                      placeholder="e.g., Yes, collaborating with pilots on various projects."
                      className="h-28 w-full rounded-lg border border-stroke bg-white px-4 py-3 text-base text-dark placeholder:text-body-color/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-dark-4 dark:bg-dark-2 dark:text-white"
                    />
                  </div>
                </div>
              )}

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={currentStep === 0 ? undefined : goToPreviousStep}
                  disabled={currentStep === 0}
                  className={`inline-flex w-full items-center justify-center rounded-lg border px-6 py-3 text-sm font-semibold transition-colors sm:w-auto ${
                    currentStep === 0
                      ? "cursor-not-allowed border-stroke text-body-color"
                      : "border-stroke text-dark hover:border-primary hover:text-primary dark:border-dark-4 dark:text-white"
                  }`}
                >
                  Back
                </button>

                {currentStep < steps.length - 1 ? (
                  <button
                    type="button"
                    onClick={goToNextStep}
                    className="inline-flex w-full items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50 sm:w-auto"
                  >
                    Next Step
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loader}
                    className="inline-flex w-full items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-60 sm:w-auto"
                  >
                    {loader ? <Loader /> : "Submit Application"}
                  </button>
                )}
              </div>

              <div className="border-t border-dashed border-stroke pt-6 text-center dark:border-dark-4">
                <p className="text-sm text-body-color dark:text-dark-6">
                  Already have an account?{" "}
                  <Link href="/auth/signin" className="font-semibold text-primary hover:underline">
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
