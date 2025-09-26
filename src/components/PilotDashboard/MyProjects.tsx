"use client";

import { useState, useEffect } from 'react';
import { PilotProfile } from '../../../shared/schema';

interface Project {
  id: string;
  title: string;
  description: string;
  location: string;
  status: 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  fileCount: number;
  processedCount: number;
  scheduledDate: string;
  completedAt?: string;
  compensation: number;
  rating?: number;
  feedback?: string;
}

interface MyProjectsProps {
  pilotProfile: PilotProfile;
}

const MyProjects = ({ pilotProfile }: MyProjectsProps) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'assigned' | 'in_progress' | 'completed'>('all');

  useEffect(() => {
    fetchMyProjects();
  }, []);

  const fetchMyProjects = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/jobs/my-projects');
      if (response.ok) {
        const data = await response.json();
        setProjects(data);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProjectStatus = async (projectId: string, status: string) => {
    try {
      const response = await fetch(`/api/jobs/${projectId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        fetchMyProjects(); // Refresh the list
      }
    } catch (error) {
      console.error('Error updating project status:', error);
    }
  };

  // Mock data for demonstration
  const mockProjects: Project[] = [
    {
      id: '1',
      title: 'Solar Farm Inspection - Phoenix',
      description: 'Large scale thermal inspection of solar panels and electrical infrastructure.',
      location: 'Phoenix, AZ',
      status: 'completed',
      fileCount: 245,
      processedCount: 245,
      scheduledDate: '2025-09-15',
      completedAt: '2025-09-15',
      compensation: 125000,
      rating: 5,
      feedback: 'Excellent work! Very thorough inspection and detailed report.'
    },
    {
      id: '2',
      title: 'Electrical Substation Check',
      description: 'Thermal inspection of high-voltage electrical equipment.',
      location: 'Austin, TX',
      status: 'in_progress',
      fileCount: 75,
      processedCount: 45,
      scheduledDate: '2025-09-18',
      compensation: 85000
    },
    {
      id: '3',
      title: 'Commercial Solar Array',
      description: 'Routine maintenance inspection for commercial installation.',
      location: 'San Diego, CA',
      status: 'assigned',
      fileCount: 120,
      processedCount: 0,
      scheduledDate: '2025-09-22',
      compensation: 95000
    }
  ];

  const displayProjects = projects.length > 0 ? projects : mockProjects;
  const filteredProjects = filter === 'all' ? displayProjects : displayProjects.filter(project => project.status === filter);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'assigned': return 'bg-blue-500';
      case 'in_progress': return 'bg-yellow-500';
      case 'completed': return 'bg-green-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'assigned': return '📋';
      case 'in_progress': return '🔄';
      case 'completed': return '✅';
      case 'cancelled': return '❌';
      default: return '📄';
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < rating ? 'text-yellow-400' : 'text-gray-600'}>
        ⭐
      </span>
    ));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-white">Loading your projects...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">My Projects</h2>
        <div className="flex space-x-2">
          {(['all', 'assigned', 'in_progress', 'completed'] as const).map((filterType) => (
            <button
              key={filterType}
              onClick={() => setFilter(filterType)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === filterType
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {filterType.charAt(0).toUpperCase() + filterType.slice(1).replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Projects List */}
      <div className="space-y-4">
        {filteredProjects.map((project) => (
          <div key={project.id} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            {/* Project Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`${getStatusColor(project.status)} p-2 rounded-lg`}>
                  <span className="text-lg">{getStatusIcon(project.status)}</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">{project.title}</h3>
                  <p className="text-gray-400">{project.location}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-orange-400 font-bold">
                  ${(project.compensation / 100).toLocaleString()}
                </p>
                <div className={`${getStatusColor(project.status)} text-white px-2 py-1 rounded text-xs font-medium`}>
                  {project.status.charAt(0).toUpperCase() + project.status.slice(1).replace('_', ' ')}
                </div>
              </div>
            </div>

            {/* Project Description */}
            <p className="text-gray-300 mb-4">{project.description}</p>

            {/* Project Progress */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <p className="text-gray-400 text-sm">Progress</p>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-orange-500 h-2 rounded-full transition-all"
                      style={{ width: `${(project.processedCount / project.fileCount) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-white text-sm">
                    {project.processedCount}/{project.fileCount}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Scheduled Date</p>
                <p className="text-white font-medium">
                  {new Date(project.scheduledDate).toLocaleDateString()}
                </p>
              </div>
              {project.completedAt && (
                <div>
                  <p className="text-gray-400 text-sm">Completed Date</p>
                  <p className="text-white font-medium">
                    {new Date(project.completedAt).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>

            {/* Rating and Feedback for completed projects */}
            {project.status === 'completed' && project.rating && (
              <div className="bg-gray-700 rounded-lg p-4 mb-4">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-gray-400 text-sm">Client Rating:</span>
                  <div className="flex">{renderStars(project.rating)}</div>
                </div>
                {project.feedback && (
                  <p className="text-gray-300 text-sm italic">
                    &ldquo;{project.feedback}&rdquo;
                  </p>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-3">
              {project.status === 'assigned' && (
                <button
                  onClick={() => updateProjectStatus(project.id, 'in_progress')}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Start Project
                </button>
              )}
              {project.status === 'in_progress' && (
                <button
                  onClick={() => updateProjectStatus(project.id, 'completed')}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Mark Complete
                </button>
              )}
              <button className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400">
            {filter === 'all' ? 'No projects yet. Check the Job Board for available opportunities!' : `No ${filter.replace('_', ' ')} projects.`}
          </p>
        </div>
      )}
    </div>
  );
};

export default MyProjects;