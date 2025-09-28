'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, Home, Edit, Eye, ArrowLeft, CheckCircle, Trash2, Crown } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import SellerProfileCard from '@/components/SellerProfileCard';
import VerificationModal from '@/components/VerificationModal';
import { supabase } from '@/lib/supabase';
import { getPlanById, getDefaultPlan, canAddListing, getListingLimitMessage } from '@/lib/plans';

interface Property {
  id: string;
  title: string;
  location: string;
  price: number;
  currency: string;
  beds: number;
  baths: number;
  property_type: string;
  images: string[];
  video_url: string | null;
  created_at: string;
}

export default function SellerDashboard() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loadingProperties, setLoadingProperties] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [deletingPropertyId, setDeletingPropertyId] = useState<string | null>(null);
  const [verificationPromptShown, setVerificationPromptShown] = useState(false);

  const fetchSellerProperties = useCallback(async () => {
    if (!user) return;

    try {
      console.log('Fetching listings for seller:', user.id);
      
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching seller listings:', error);
        return;
      }

      console.log('Fetched seller listings:', data);
      setProperties(data || []);
    } catch (error) {
      console.error('Error in fetchSellerProperties:', error);
    } finally {
      setLoadingProperties(false);
    }
  }, [user]);

  const checkVerificationStatus = useCallback(async () => {
    if (!user) return;

    try {
      // Check if user has phone number, verified status, and verification prompt status
      const { data, error } = await supabase
        .from('profiles')
        .select('phone, full_name, verified, verification_prompt_shown, plan_id')
        .eq('id', user.id)
        .single();

      if (error) {
        console.log('Error checking verification:', error);
        // If profile doesn't exist, create a basic one with Free plan
        if (error.code === 'PGRST116') {
          const { error: insertError } = await supabase
            .from('profiles')
            .insert([
              {
                id: user.id,
                full_name: user.name || '',
                verified: false,
                verification_prompt_shown: false,
                plan_id: 'free',
                role: user.role,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              }
            ]);
          
          if (insertError) {
            console.error('Error creating profile:', insertError);
          }
        }
        setIsVerified(false);
        setVerificationPromptShown(false);
        return;
      }

      // Consider verified if phone number exists OR verified flag is true
      setIsVerified(!!(data?.phone || data?.verified));
      setVerificationPromptShown(!!data?.verification_prompt_shown);
      
      // Update user object with database plan_id if different
      if (data?.plan_id && user.plan_id !== data.plan_id) {
        // Update localStorage user object
        const updatedUser = { ...user, plan_id: data.plan_id };
        if (typeof window !== 'undefined') {
          localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        }
      }
    } catch (error) {
      console.error('Error checking verification status:', error);
      setIsVerified(false);
      setVerificationPromptShown(false);
    }
  }, [user]);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth/signin');
    } else if (!loading && user && user.role !== 'seller') {
      router.push('/dashboard/buyer');
    }
  }, [user, isAuthenticated, loading, router]);

  useEffect(() => {
    if (user && user.role === 'seller') {
      fetchSellerProperties();
      checkVerificationStatus();
    }
  }, [user, fetchSellerProperties, checkVerificationStatus]);

  const handleAddPropertyClick = async () => {
    // Simple logic: Show verification ONLY the very first time (if never shown before AND not verified)
    if (!verificationPromptShown && !isVerified) {
      // Mark as shown immediately to prevent showing again
      setVerificationPromptShown(true);
      
      // Update database
      try {
        await supabase
          .from('profiles')
          .update({ verification_prompt_shown: true, updated_at: new Date().toISOString() })
          .eq('id', user?.id);
      } catch (error) {
        console.error('Error updating verification prompt:', error);
      }
      
      setShowVerificationModal(true);
      return;
    }

    // Check plan limits - redirect to upgrade if exceeded
    const userPlan = user?.plan_id ? getPlanById(user.plan_id) : getDefaultPlan();
    if (!canAddListing(properties.length, userPlan.id)) {
      router.push('/account/upgrade-plan');
      return;
    }

    // Go directly to create property page
    router.push('/dashboard/seller/create');
  };

  const handleDeleteProperty = async (propertyId: string) => {
    if (!confirm('Are you sure you want to delete this property listing? This action cannot be undone.')) {
      return;
    }

    setDeletingPropertyId(propertyId);
    try {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', propertyId)
        .eq('seller_id', user?.id); // Ensure user can only delete their own properties

      if (error) {
        console.error('Error deleting property:', error);
        alert('Failed to delete property. Please try again.');
        return;
      }

      // Remove from local state
      setProperties(properties.filter(p => p.id !== propertyId));
      
    } catch (error) {
      console.error('Error deleting property:', error);
      alert('Failed to delete property. Please try again.');
    } finally {
      setDeletingPropertyId(null);
    }
  };

  const handleVerificationComplete = async () => {
    setShowVerificationModal(false);
    setIsVerified(true);
    setShowSuccessMessage(true);
    
    // Hide success message after 3 seconds
    setTimeout(() => {
      setShowSuccessMessage(false);
    }, 3000);
    
    // After verification, automatically proceed to add property
    // Check listing limits first
    const userPlan = user?.plan_id ? getPlanById(user.plan_id) : getDefaultPlan();
    if (!canAddListing(properties.length, userPlan.id)) {
      router.push('/account/upgrade-plan');
      return;
    }
    
    // Go to create property page
    router.push('/dashboard/seller/create');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D12C1D]"></div>
      </div>
    );
  }

  if (!user || user.role !== 'seller') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Success Message */}
      {showSuccessMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-40 animate-in slide-in-from-top-5 duration-300">
          <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 flex items-center space-x-3 shadow-lg">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-green-800 font-medium">Profile verified successfully!</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="flex items-center justify-between p-4 max-w-7xl mx-auto">
          <Link href="/" className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-semibold">Seller Dashboard</h1>
          <div></div>
        </div>
      </div>

      <div className="p-4 max-w-4xl mx-auto space-y-6">
        <SellerProfileCard user={user} />

        {/* Plan Status */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Crown className="w-5 h-5 text-[#D12C1D]" />
              <div>
                <h3 className="font-semibold text-gray-900 text-lg" data-testid="current-plan-name">
                  {user?.plan_id ? getPlanById(user.plan_id)?.name : getDefaultPlan().name} Plan
                </h3>
                <p className="text-sm text-gray-600" data-testid="plan-usage-info">
                  {getListingLimitMessage(user?.plan_id || getDefaultPlan().id)} 
                  Currently using {properties.length} listing{properties.length !== 1 ? 's' : ''}.
                </p>
                {/* Plan limit enforcement warning */}
                {(() => {
                  const userPlan = user?.plan_id ? getPlanById(user.plan_id) : getDefaultPlan();
                  const isAtLimit = properties.length >= userPlan.maxListings;
                  if (isAtLimit) {
                    return (
                      <p className="text-sm text-orange-600 font-medium mt-1">
                        ⚠️ You've reached your plan limit. Upgrade to add more listings.
                      </p>
                    );
                  }
                  return null;
                })()}
              </div>
            </div>
            <Link
              href="/account/upgrade-plan"
              className="px-4 py-2 text-[#D12C1D] border border-[#D12C1D] rounded-lg hover:bg-red-50 transition-colors text-sm font-medium"
              data-testid="upgrade-plan-button"
            >
              Upgrade Plan
            </Link>
          </div>
        </div>

        {/* Properties List */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Your Properties ({properties.length})
            </h2>
            {/* Only show top Add Property button if user has properties */}
            {properties.length > 0 && (
              <button
                onClick={handleAddPropertyClick}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-[#D12C1D] text-white rounded-lg hover:bg-[#B8241A] transition-colors text-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add Property</span>
              </button>
            )}
          </div>
          
          {loadingProperties ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D12C1D]"></div>
            </div>
          ) : properties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((property) => (
                <div key={property.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                  <div className="aspect-[16/9] overflow-hidden">
                    {property.images && property.images.length > 0 ? (
                      <img
                        src={property.images[0]}
                        alt={property.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.pexels.com/photos/1918291/pexels-photo-1918291.jpeg?w=400&h=250&fit=crop';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <Home className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                        {property.title}
                      </h3>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">
                          {property.currency}{property.price.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3">{property.location}</p>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4 text-gray-600">
                        <span className="text-sm">{property.beds} beds</span>
                        <span className="text-sm">{property.baths} baths</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        {property.video_url && (
                          <div className="w-2 h-2 bg-red-500 rounded-full" title="Has video"></div>
                        )}
                        <span className="text-xs text-gray-500">{property.property_type}</span>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Link
                        href={`/property/${property.id}`}
                        className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                        data-testid="view-property-button"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View</span>
                      </Link>
                      <button 
                        className="flex items-center justify-center space-x-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                        data-testid="edit-property-button"
                      >
                        <Edit className="w-4 h-4" />
                        <span>Edit</span>
                      </button>
                      <button 
                        onClick={() => handleDeleteProperty(property.id)}
                        disabled={deletingPropertyId === property.id}
                        className="flex items-center justify-center space-x-1 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        data-testid="delete-property-button"
                      >
                        {deletingPropertyId === property.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-700"></div>
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Home className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No properties listed yet
              </h3>
              <p className="text-gray-600 mb-6">
                Create your first property listing to get started
              </p>
              <button
                onClick={handleAddPropertyClick}
                className="inline-flex items-center space-x-2 px-6 py-3 bg-[#D12C1D] text-white rounded-lg hover:bg-[#B8241A] transition-colors"
                data-testid="add-first-property-button"
              >
                <Plus className="w-4 h-4" />
                <span>{isVerified ? 'Add Property' : 'Add Your First Property'}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Verification Modal */}
      <VerificationModal
        isOpen={showVerificationModal}
        onClose={() => setShowVerificationModal(false)}
        onVerificationComplete={handleVerificationComplete}
        userEmail={user?.email || ''}
        userName={user?.name || ''}
        userId={user?.id || ''}
      />
    </div>
  );
}