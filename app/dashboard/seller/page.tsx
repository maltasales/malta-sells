'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, Home, Edit, Eye, ArrowLeft, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import SellerProfileCard from '@/components/SellerProfileCard';
import VerificationModal from '@/components/VerificationModal';
import { supabase } from '@/lib/supabase';

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
      // Check if user has phone number in profile (indicates verification)
      const { data, error } = await supabase
        .from('profiles')
        .select('phone, full_name')
        .eq('id', user.id)
        .single();

      if (error) {
        console.log('Error checking verification:', error);
        setIsVerified(false);
        return;
      }

      // Consider verified if phone number exists
      setIsVerified(!!data?.phone);
    } catch (error) {
      console.error('Error checking verification status:', error);
      setIsVerified(false);
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

  const handleAddPropertyClick = () => {
    if (isVerified) {
      // If verified, go directly to create property page
      router.push('/dashboard/seller/create');
    } else {
      // If not verified, show verification modal
      setShowVerificationModal(true);
    }
  };

  const handleVerificationComplete = () => {
    setShowVerificationModal(false);
    setIsVerified(true);
    setShowSuccessMessage(true);
    
    // Hide success message after 3 seconds
    setTimeout(() => {
      setShowSuccessMessage(false);
    }, 3000);
    
    // Update verification status
    checkVerificationStatus();
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
                      >
                        <Eye className="w-4 h-4" />
                        <span>View</span>
                      </Link>
                      <button className="flex items-center justify-center space-x-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm">
                        <Edit className="w-4 h-4" />
                        <span>Edit</span>
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
      />
    </div>
  );
}