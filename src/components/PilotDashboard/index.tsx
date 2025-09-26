"use client";

import { useState } from 'react';
import { User, PilotProfile } from '../../../shared/schema';
import DashboardOverview from './DashboardOverview';
import JobBoard from './JobBoard';
import MyProjects from './MyProjects';
import ProfileSettings from './ProfileSettings';

interface PilotDashboardProps {
  user: User;
  pilotProfile: PilotProfile;
}

type DashboardView = 'overview' | 'jobBoard' | 'myProjects' | 'profile';

const PilotDashboard = ({ user, pilotProfile }: PilotDashboardProps) => {
  const [activeView, setActiveView] = useState<DashboardView>('overview');

  const navigationItems = [
    { key: 'overview', label: 'Overview', icon: '📊' },
    { key: 'jobBoard', label: 'Job Board', icon: '🎯' },
    { key: 'myProjects', label: 'My Projects', icon: '📋' },
    { key: 'profile', label: 'Profile', icon: '👤' },
  ] as const;

  const renderContent = () => {
    switch (activeView) {
      case 'overview':
        return <DashboardOverview user={user} pilotProfile={pilotProfile} />;
      case 'jobBoard':
        return <JobBoard pilotProfile={pilotProfile} />;
      case 'myProjects':
        return <MyProjects pilotProfile={pilotProfile} />;
      case 'profile':
        return <ProfileSettings user={user} pilotProfile={pilotProfile} />;
      default:
        return <DashboardOverview user={user} pilotProfile={pilotProfile} />;
    }
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-white">
                Pilot Dashboard
              </h1>
              <p className="text-orange-100">
                Welcome back, {user.firstName || user.email}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm text-orange-100">Status</div>
                <div className={`text-sm font-semibold px-2 py-1 rounded ${
                  pilotProfile.status === 'approved' ? 'bg-green-500 text-white' :
                  pilotProfile.status === 'active' ? 'bg-blue-500 text-white' :
                  'bg-yellow-500 text-black'
                }`}>
                  {pilotProfile.status ? pilotProfile.status.charAt(0).toUpperCase() + pilotProfile.status.slice(1) : 'Unknown'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <nav className="space-y-2">
              {navigationItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => setActiveView(item.key)}
                  className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                    activeView === item.key
                      ? 'bg-orange-500 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <span className="mr-3 text-lg">{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PilotDashboard;