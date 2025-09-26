"use client";

import { useState, useEffect } from 'react';
import { PilotProfile } from '../../../shared/schema';

interface Job {
  id: string;
  title: string;
  description: string;
  location: string;
  status: string;
  fileCount: number;
  scheduledDate: string;
  compensation?: number;
  requirements?: string[];
  type?: 'solar' | 'electrical' | 'infrastructure';
}

interface JobBoardProps {
  pilotProfile: PilotProfile;
}

const JobBoard = ({ pilotProfile }: JobBoardProps) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'solar' | 'electrical' | 'infrastructure'>('all');
  const [appliedJobs, setAppliedJobs] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchAvailableJobs();
  }, []);

  const fetchAvailableJobs = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/jobs/available');
      if (response.ok) {
        const data = await response.json();
        setJobs(data);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyForJob = async (jobId: string) => {
    try {
      const response = await fetch(`/api/jobs/${jobId}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        setAppliedJobs(prev => new Set([...Array.from(prev), jobId]));
        // Could show success toast here
      }
    } catch (error) {
      console.error('Error applying for job:', error);
    }
  };

  // Mock data for demonstration - this will be replaced by API data
  const mockJobs: Job[] = [
    {
      id: '1',
      title: 'Large Solar Farm Thermal Inspection',
      description: 'Comprehensive thermal inspection of 500MW solar installation. Requires detailed thermal imaging of all panels and electrical connections.',
      location: 'Phoenix, AZ',
      status: 'available',
      fileCount: 250,
      scheduledDate: '2025-09-25',
      compensation: 125000, // $1,250 in cents
      requirements: ['Part 107 Certified', '2+ years thermal experience', 'Insurance required'],
      type: 'solar'
    },
    {
      id: '2',
      title: 'Electrical Substation Inspection',
      description: 'Thermal inspection of high-voltage electrical substation. Looking for overheating transformers and connections.',
      location: 'Austin, TX',
      status: 'available',
      fileCount: 75,
      scheduledDate: '2025-09-30',
      compensation: 85000, // $850 in cents
      requirements: ['Part 107 Certified', 'High-voltage experience preferred'],
      type: 'electrical'
    },
    {
      id: '3',
      title: 'Commercial Solar Array - Maintenance Check',
      description: 'Routine thermal inspection for commercial solar array. Previous anomalies detected, need follow-up analysis.',
      location: 'San Diego, CA',
      status: 'available',
      fileCount: 120,
      scheduledDate: '2025-10-05',
      compensation: 95000, // $950 in cents
      requirements: ['Part 107 Certified', 'Thermal camera required'],
      type: 'solar'
    }
  ];

  const displayJobs = jobs.length > 0 ? jobs : mockJobs;
  const filteredJobs = filter === 'all' ? displayJobs : displayJobs.filter(job => job.type === filter);

  const getJobTypeIcon = (type: string) => {
    switch (type) {
      case 'solar': return '☀️';
      case 'electrical': return '⚡';
      case 'infrastructure': return '🏗️';
      default: return '📋';
    }
  };

  const getJobTypeColor = (type: string) => {
    switch (type) {
      case 'solar': return 'bg-yellow-500';
      case 'electrical': return 'bg-blue-500';
      case 'infrastructure': return 'bg-gray-500';
      default: return 'bg-orange-500';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-white">Loading available jobs...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Available Jobs</h2>
        <div className="flex space-x-2">
          {(['all', 'solar', 'electrical', 'infrastructure'] as const).map((filterType) => (
            <button
              key={filterType}
              onClick={() => setFilter(filterType)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === filterType
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Jobs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredJobs.map((job) => (
          <div key={job.id} className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-orange-500 transition-colors">
            {/* Job Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`${getJobTypeColor(job.type || 'solar')} p-2 rounded-lg`}>
                  <span className="text-lg">{getJobTypeIcon(job.type || 'solar')}</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">{job.title}</h3>
                  <p className="text-gray-400">{job.location}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-orange-400 font-bold">
                  ${((job.compensation || 0) / 100).toLocaleString()}
                </p>
                <p className="text-gray-400 text-sm">Compensation</p>
              </div>
            </div>

            {/* Job Description */}
            <p className="text-gray-300 mb-4 line-clamp-3">{job.description}</p>

            {/* Job Details */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-gray-400 text-sm">Images Expected</p>
                <p className="text-white font-medium">{job.fileCount} files</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Scheduled Date</p>
                <p className="text-white font-medium">
                  {new Date(job.scheduledDate).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Requirements */}
            {job.requirements && (
              <div className="mb-4">
                <p className="text-gray-400 text-sm mb-2">Requirements</p>
                <div className="flex flex-wrap gap-2">
                  {job.requirements.map((req, index) => (
                    <span
                      key={index}
                      className="bg-gray-700 text-gray-300 px-2 py-1 rounded text-xs"
                    >
                      {req}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Apply Button */}
            <button
              onClick={() => applyForJob(job.id)}
              disabled={appliedJobs.has(job.id)}
              className={`w-full py-3 rounded-lg font-medium transition-colors ${
                appliedJobs.has(job.id)
                  ? 'bg-green-600 text-white cursor-not-allowed'
                  : 'bg-orange-500 hover:bg-orange-600 text-white'
              }`}
            >
              {appliedJobs.has(job.id) ? '✓ Applied' : 'Apply for Job'}
            </button>
          </div>
        ))}
      </div>

      {filteredJobs.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400">No jobs available for the selected filter.</p>
        </div>
      )}
    </div>
  );
};

export default JobBoard;