"use client";

import { User, PilotProfile } from '../../../shared/schema';

interface DashboardOverviewProps {
  user: User;
  pilotProfile: PilotProfile;
}

const DashboardOverview = ({ user, pilotProfile }: DashboardOverviewProps) => {
  const statsCards = [
    {
      title: 'Completed Jobs',
      value: pilotProfile.completedJobs || 0,
      icon: '✅',
      bgColor: 'bg-green-500'
    },
    {
      title: 'Total Earnings',
      value: `$${((pilotProfile.totalEarnings || 0) / 100).toLocaleString()}`,
      icon: '💰',
      bgColor: 'bg-blue-500'
    },
    {
      title: 'Average Rating',
      value: pilotProfile.averageRating ? `${pilotProfile.averageRating.toFixed(1)} ⭐` : 'No ratings yet',
      icon: '⭐',
      bgColor: 'bg-yellow-500'
    },
    {
      title: 'Flight Hours',
      value: `${pilotProfile.totalFlightHours || 0}h`,
      icon: '🚁',
      bgColor: 'bg-purple-500'
    }
  ];

  const certificationStatus = [
    {
      label: 'Part 107 Certified',
      status: pilotProfile.part107Certified,
      detail: pilotProfile.part107Number || 'Not provided'
    },
    {
      label: 'Insurance Coverage',
      status: pilotProfile.hasInsurance,
      detail: pilotProfile.insuranceProvider || 'Not provided'
    },
    {
      label: 'Thermal Experience',
      status: (pilotProfile.thermalExperienceYears || 0) > 0,
      detail: `${pilotProfile.thermalExperienceYears || 0} years`
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-white mb-2">
          Welcome back, {user.firstName || user.email?.split('@')[0]}!
        </h2>
        <p className="text-gray-300">
          {pilotProfile.companyName && `${pilotProfile.companyName} • `}
          Member since {pilotProfile.createdAt ? new Date(pilotProfile.createdAt).toLocaleDateString() : 'Unknown'}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat, index) => (
          <div key={index} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">{stat.title}</p>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
              </div>
              <div className={`${stat.bgColor} p-3 rounded-lg`}>
                <span className="text-2xl">{stat.icon}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Certification Status */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">Certification Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {certificationStatus.map((cert, index) => (
            <div key={index} className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${cert.status ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <div>
                <p className="text-white font-medium">{cert.label}</p>
                <p className="text-gray-400 text-sm">{cert.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-3 rounded-lg font-medium transition-colors">
            View Available Jobs
          </button>
          <button className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-3 rounded-lg font-medium transition-colors">
            Update Profile
          </button>
          <button className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-3 rounded-lg font-medium transition-colors">
            Contact Support
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {(pilotProfile.completedJobs || 0) > 0 ? (
            <div className="text-gray-300">
              <p>• Profile created on {pilotProfile.createdAt ? new Date(pilotProfile.createdAt).toLocaleDateString() : 'Unknown'}</p>
              <p>• {pilotProfile.completedJobs} jobs completed</p>
              {pilotProfile.approvedAt && (
                <p>• Approved for platform on {pilotProfile.approvedAt ? new Date(pilotProfile.approvedAt).toLocaleDateString() : 'Unknown'}</p>
              )}
            </div>
          ) : (
            <p className="text-gray-400">No recent activity. Start by browsing available jobs!</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;