import { Metadata } from "next";
import PilotRegistration from "@/components/Auth/PilotRegistration";
import Breadcrumb from "@/components/Breadcrumb";

export const metadata: Metadata = {
  title: "Pilot Registration - ComplianceDrone",
  description: "Join the ComplianceDrone pilot network. Professional thermal inspection pilots with flexible scheduling and competitive compensation.",
  keywords: "drone pilot, thermal inspection, Part 107, pilot registration, ComplianceDrone",
  openGraph: {
    title: "Pilot Registration - ComplianceDrone",
    description: "Join the ComplianceDrone pilot network. Professional thermal inspection pilots with flexible scheduling and competitive compensation.",
    type: "website",
  }
};

const PilotRegistrationPage = () => {
  return (
    <>
      <Breadcrumb 
        pageTitle="Pilot Registration" 
        breadcrumbItems={[
          { text: "Home", href: "/" },
          { text: "Pilots", href: "/pilots" },
          { text: "Registration", href: "/pilot-registration" }
        ]}
      />

      <PilotRegistration />
    </>
  );
};

export default PilotRegistrationPage;