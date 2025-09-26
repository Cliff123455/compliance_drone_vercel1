import { Metadata } from "next";
import PilotDashboard from "@/components/PilotDashboard";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/auth";
import { redirect } from "next/navigation";
import { storage } from "@/server/storage";

export const metadata: Metadata = {
  title: "Pilot Dashboard | ComplianceDrone - Thermal Inspection Platform",
  description: "Pilot dashboard for managing thermal inspection projects and assignments",
};

const PilotDashboardPage = async () => {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    redirect("/auth/signin");
  }

  // Get user and pilot profile
  const user = await storage.getUserByEmail(session.user.email);
  
  if (!user) {
    redirect("/auth/signin");
  }

  const pilotProfile = await storage.getPilotProfile(user.id);
  
  if (!pilotProfile) {
    redirect("/pilot-registration");
  }

  // If pilot is pending approval, show pending status
  if (pilotProfile.status === 'pending') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-4">Application Under Review</h1>
          <p className="text-gray-300">Your pilot application is currently being reviewed. You&apos;ll receive an email once approved.</p>
        </div>
      </div>
    );
  }

  if (pilotProfile.status === 'suspended') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-4 text-red-500">Account Suspended</h1>
          <p className="text-gray-300">Your pilot account has been suspended. Please contact support for assistance.</p>
        </div>
      </div>
    );
  }

  return (
    <PilotDashboard 
      user={user} 
      pilotProfile={pilotProfile}
    />
  );
};

export default PilotDashboardPage;