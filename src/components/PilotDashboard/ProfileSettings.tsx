"use client";

import { useState } from 'react';
import { User, PilotProfile } from '../../../shared/schema';

interface ProfileSettingsProps {
  user: User;
  pilotProfile: PilotProfile;
}

const ProfileSettings = ({ user, pilotProfile }: ProfileSettingsProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    email: user.email || '',
    companyName: pilotProfile.companyName || '',
    phoneNumber: pilotProfile.phoneNumber || '',
    address: pilotProfile.address || '',
    city: pilotProfile.city || '',
    state: pilotProfile.state || '',
    zipCode: pilotProfile.zipCode || '',
    part107Number: pilotProfile.part107Number || '',
    thermalExperienceYears: pilotProfile.thermalExperienceYears || 0,
    totalFlightHours: pilotProfile.totalFlightHours || 0,
    insuranceProvider: pilotProfile.insuranceProvider || '',
    insurancePolicyNumber: pilotProfile.insurancePolicyNumber || '',
    droneModels: (pilotProfile.droneModels as string[] || []).join(', '),
    thermalCameraModels: (pilotProfile.thermalCameraModels as string[] || []).join(', '),
    serviceStates: (pilotProfile.serviceStates as string[] || []).join(', '),
    maxTravelDistance: pilotProfile.maxTravelDistance || 0,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/profile/update', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user: {
            firstName: formData.firstName,
            lastName: formData.lastName,
          },
          pilotProfile: {
            companyName: formData.companyName,
            phoneNumber: formData.phoneNumber,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            zipCode: formData.zipCode,
            part107Number: formData.part107Number,
            thermalExperienceYears: Number(formData.thermalExperienceYears),
            totalFlightHours: Number(formData.totalFlightHours),
            insuranceProvider: formData.insuranceProvider,
            insurancePolicyNumber: formData.insurancePolicyNumber,
            droneModels: formData.droneModels.split(',').map(s => s.trim()).filter(s => s),
            thermalCameraModels: formData.thermalCameraModels.split(',').map(s => s.trim()).filter(s => s),
            serviceStates: formData.serviceStates.split(',').map(s => s.trim()).filter(s => s),
            maxTravelDistance: Number(formData.maxTravelDistance),
          }
        })
      });

      if (response.ok) {
        setIsEditing(false);
        // Could show success toast here
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const formSections = [
    {
      title: 'Personal Information',
      fields: [
        { name: 'firstName', label: 'First Name', type: 'text', required: true },
        { name: 'lastName', label: 'Last Name', type: 'text', required: true },
        { name: 'email', label: 'Email', type: 'email', disabled: true },
        { name: 'phoneNumber', label: 'Phone Number', type: 'tel' },
      ]
    },
    {
      title: 'Company Information',
      fields: [
        { name: 'companyName', label: 'Company Name', type: 'text' },
        { name: 'address', label: 'Address', type: 'text' },
        { name: 'city', label: 'City', type: 'text' },
        { name: 'state', label: 'State', type: 'text' },
        { name: 'zipCode', label: 'ZIP Code', type: 'text' },
      ]
    },
    {
      title: 'Pilot Qualifications',
      fields: [
        { name: 'part107Number', label: 'Part 107 License Number', type: 'text' },
        { name: 'thermalExperienceYears', label: 'Thermal Experience (Years)', type: 'number' },
        { name: 'totalFlightHours', label: 'Total Flight Hours', type: 'number' },
      ]
    },
    {
      title: 'Equipment',
      fields: [
        { name: 'droneModels', label: 'Drone Models (comma separated)', type: 'text' },
        { name: 'thermalCameraModels', label: 'Thermal Camera Models (comma separated)', type: 'text' },
      ]
    },
    {
      title: 'Service Area',
      fields: [
        { name: 'serviceStates', label: 'Service States (comma separated)', type: 'text' },
        { name: 'maxTravelDistance', label: 'Max Travel Distance (miles)', type: 'number' },
      ]
    },
    {
      title: 'Insurance',
      fields: [
        { name: 'insuranceProvider', label: 'Insurance Provider', type: 'text' },
        { name: 'insurancePolicyNumber', label: 'Policy Number', type: 'text' },
      ]
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Profile Settings</h2>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            isEditing
              ? 'bg-gray-600 hover:bg-gray-500 text-white'
              : 'bg-orange-500 hover:bg-orange-600 text-white'
          }`}
        >
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </button>
      </div>

      {/* Account Status */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">Account Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-gray-400 text-sm">Status</p>
            <div className={`inline-flex px-2 py-1 rounded text-sm font-medium ${
              pilotProfile.status === 'approved' ? 'bg-green-500 text-white' :
              pilotProfile.status === 'active' ? 'bg-blue-500 text-white' :
              pilotProfile.status === 'pending' ? 'bg-yellow-500 text-black' :
              'bg-red-500 text-white'
            }`}>
              {pilotProfile.status ? pilotProfile.status.charAt(0).toUpperCase() + pilotProfile.status.slice(1) : 'Unknown'}
            </div>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Member Since</p>
            <p className="text-white font-medium">
              {pilotProfile.createdAt ? new Date(pilotProfile.createdAt).toLocaleDateString() : 'Unknown'}
            </p>
          </div>
          {pilotProfile.approvedAt && (
            <div>
              <p className="text-gray-400 text-sm">Approved Date</p>
              <p className="text-white font-medium">
                {new Date(pilotProfile.approvedAt).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {formSections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">{section.title}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {section.fields.map((field) => (
                <div key={field.name}>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {field.label}
                    {field.required && <span className="text-red-400 ml-1">*</span>}
                  </label>
                  <input
                    type={field.type}
                    name={field.name}
                    value={formData[field.name as keyof typeof formData]}
                    onChange={handleInputChange}
                    disabled={!isEditing || field.disabled}
                    required={field.required}
                    className={`w-full px-3 py-2 rounded-lg border text-white transition-colors ${
                      !isEditing || field.disabled
                        ? 'bg-gray-700 border-gray-600 cursor-not-allowed'
                        : 'bg-gray-700 border-gray-600 focus:border-orange-500 focus:outline-none'
                    }`}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Save Button */}
        {isEditing && (
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-6 py-3 bg-gray-600 hover:bg-gray-500 text-white rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors"
            >
              Save Changes
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default ProfileSettings;