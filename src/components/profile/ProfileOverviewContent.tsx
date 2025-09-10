/**
 * ProfileOverviewContent Component - Main profile content using existing DashboardProfile
 * 
 * Integration component that uses the existing DashboardProfile component
 * within the new profile system architecture. Provides enhanced features
 * while maintaining compatibility with existing functionality.
 * 
 * Features:
 * - Integration with existing DashboardProfile component
 * - Enhanced profile overview with additional stats
 * - Role-based content customization
 * - Real-time profile data management
 * - Seamless API integration
 * - Profile completion tracking
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { User, Mail, Phone, MapPin, Calendar, Edit2 } from 'lucide-react';

// Import existing dashboard components
import { DashboardProfile } from '@/components/dashboard/components/DashboardProfile';
import type { 
  ProfileData,
  ProfileEditingField,
  ProfileEditingState 
} from '@/components/dashboard/types';

// API integration
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Types
interface ProfileOverviewContentProps {
  userId: string;
  userRole: string;
}

/**
 * ProfileOverviewContent Component
 * 
 * Enhanced profile overview that integrates the existing DashboardProfile
 * component with additional profile-specific features.
 */
export function ProfileOverviewContent({ userId, userRole }: ProfileOverviewContentProps) {
  // Profile state management
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [editingState, setEditingState] = useState<ProfileEditingState>({
    editingField: null,
    tempValue: '',
    isSaving: false,
    validationErrors: {},
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch profile data
  const fetchProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await api.auth.getProfile();
      setProfileData({
        firstName: response.firstName,
        lastName: response.lastName,
        email: response.email,
        phoneNumber: response.phoneNumber || '',
        bio: '', // Will be expanded based on API
        location: '', // Will be expanded based on API
        profilePhoto: '', // Will be expanded based on API
        memberSince: new Date().toISOString(), // Will be from API
        role: response.role,
        isVerified: true, // Will be from API
        isPhoneVerified: false, // Will be from API
        isEmailVerified: true, // Will be from API
      });
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Handle field editing
  const handleEditField = useCallback((field: ProfileEditingField) => {
    setEditingState(prev => ({
      ...prev,
      editingField: field,
      tempValue: '',
      validationErrors: {},
    }));
  }, []);

  // Handle profile save
  const handleSaveProfile = useCallback(async (updates: Partial<ProfileData>) => {
    try {
      setEditingState(prev => ({ ...prev, isSaving: true }));
      
      // Convert to API format
      const apiUpdates: any = {};
      if (updates.firstName) apiUpdates.firstName = updates.firstName;
      if (updates.lastName) apiUpdates.lastName = updates.lastName;
      if (updates.phoneNumber) apiUpdates.phoneNumber = updates.phoneNumber;
      // Add more fields as API expands
      
      const updatedProfile = await api.auth.updateProfile(apiUpdates);
      
      // Update local state
      setProfileData(prev => ({
        ...prev!,
        ...updates,
        firstName: updatedProfile.firstName,
        lastName: updatedProfile.lastName,
        email: updatedProfile.email,
        phoneNumber: updatedProfile.phoneNumber || '',
      }));
      
    } catch (err) {
      throw err;
    } finally {
      setEditingState(prev => ({ ...prev, isSaving: false }));
    }
  }, []);

  // Handle edit cancellation
  const handleCancelEdit = useCallback(() => {
    setEditingState({
      editingField: null,
      tempValue: '',
      isSaving: false,
      validationErrors: {},
    });
  }, []);

  // Enhanced profile summary for overview
  const profileSummary = profileData ? {
    completionPercentage: calculateProfileCompletion(profileData),
    joinDate: formatMemberSince(profileData.memberSince),
    accountType: getRoleLabel(userRole),
    verificationStatus: getVerificationStatus(profileData),
  } : null;

  return (
    <div className="space-y-6">
      {/* Enhanced profile summary */}
      {profileSummary && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-blue-900">Profile Overview</h3>
              <p className="text-blue-700 text-sm">
                Member since {profileSummary.joinDate} • {profileSummary.accountType}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-900">
                {profileSummary.completionPercentage}%
              </div>
              <div className="text-blue-700 text-sm">Complete</div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            {profileSummary.verificationStatus.map((status, index) => (
              <div key={index} className="text-center">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-1",
                  status.verified ? "bg-green-100" : "bg-gray-100"
                )}>
                  <status.icon className={cn(
                    "w-4 h-4",
                    status.verified ? "text-green-600" : "text-gray-400"
                  )} />
                </div>
                <div className="text-xs font-medium text-gray-900">{status.label}</div>
                <div className={cn(
                  "text-xs",
                  status.verified ? "text-green-600" : "text-gray-500"
                )}>
                  {status.verified ? "Verified" : "Pending"}
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex space-x-2">
            <Button size="sm" variant="ghost" className="text-blue-600 hover:text-blue-700">
              Complete Profile
            </Button>
            <Button size="sm" variant="ghost" className="text-blue-600 hover:text-blue-700">
              Verify Account
            </Button>
          </div>
        </div>
      )}

      {/* Role-specific information */}
      {userRole === 'guest' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <User className="w-5 h-5 text-green-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-green-900">Traveler Profile</h4>
              <p className="text-sm text-green-700 mt-1">
                Complete your traveler profile to receive personalized property recommendations
                from our expert team.
              </p>
              <Button size="sm" variant="ghost" className="text-green-600 hover:text-green-700 mt-2 p-0">
                Learn about our matching service →
              </Button>
            </div>
          </div>
        </div>
      )}

      {(userRole === 'owner' || userRole === 'host') && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <User className="w-5 h-5 text-purple-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-purple-900">Host Profile</h4>
              <p className="text-sm text-purple-700 mt-1">
                Your detailed host profile helps our team match you with the right guests
                for your properties.
              </p>
              <Button size="sm" variant="ghost" className="text-purple-600 hover:text-purple-700 mt-2 p-0">
                View host resources →
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main profile content using existing DashboardProfile */}
      <div className="bg-white rounded-lg border border-gray-200">
        <DashboardProfile
          profileData={profileData}
          editingState={editingState}
          onEditField={handleEditField}
          onSaveProfile={handleSaveProfile}
          onCancelEdit={handleCancelEdit}
          isActive={true}
          isLoading={isLoading}
          error={error}
        />
      </div>

      {/* Additional profile actions */}
      <div className="flex justify-between items-center pt-4 border-t border-gray-200">
        <div className="text-sm text-gray-500">
          Profile last updated: {new Date().toLocaleDateString()}
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Edit2 className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
          <Button variant="outline" size="sm">
            View Public Profile
          </Button>
        </div>
      </div>
    </div>
  );
}

/**
 * Helper functions
 */
function calculateProfileCompletion(profile: ProfileData): number {
  const fields = [
    profile.firstName,
    profile.lastName,
    profile.email,
    profile.phoneNumber,
    profile.bio,
    profile.location,
    profile.profilePhoto,
  ];
  
  const completedFields = fields.filter(field => field && field.length > 0).length;
  return Math.round((completedFields / fields.length) * 100);
}

function formatMemberSince(dateString?: string): string {
  if (!dateString) return 'Recently';
  
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long' 
  });
}

function getRoleLabel(role: string): string {
  switch (role) {
    case 'guest': return 'Traveler Account';
    case 'owner': case 'host': return 'Host Account';
    case 'staff': return 'Staff Account';
    case 'admin': return 'Administrator';
    default: return 'Member Account';
  }
}

function getVerificationStatus(profile: ProfileData) {
  return [
    {
      label: 'Email',
      icon: Mail,
      verified: profile.isEmailVerified || false,
    },
    {
      label: 'Phone',
      icon: Phone,
      verified: profile.isPhoneVerified || false,
    },
    {
      label: 'Profile',
      icon: User,
      verified: Boolean(profile.firstName && profile.lastName),
    },
    {
      label: 'Location',
      icon: MapPin,
      verified: Boolean(profile.location),
    },
  ];
}

export default ProfileOverviewContent;