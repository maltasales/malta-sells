'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, Home, Edit, Trash2, Eye, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
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

export default function Dashboard() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loadingProperties, setLoadingProperties] = useState(true);

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
    }
  }, [user, fetchSellerProperties]);

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
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="flex items-center justify-between p-4 max-w-7xl mx-auto">
          <Link href="/" className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-semibold">Dashboard</h1>
          <div></div>
        </div>
      </div>

      <div className="p-4 max-w-4xl mx-auto space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome, {user.name}!
          </h1>
          <p className="text-gray-600">
            Manage your property listings
          </p>
        </div>

        {/* Properties List */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Your Properties ({properties.length})
            </h2>
            <Link
              href="/dashboard/seller/create"
              className="inline-flex items-center space-x-2 px-4 py-2 bg-[#D12C1D] text-white rounded-lg hover:bg-[#B8241A] transition-colors text-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Create Listing</span>
            </Link>
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
                        href={`/listings/${property.id}`}
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
              <p className="text-gray-600 mb-4">
                Create your first property listing to get started
              </p>
              <Link
                href="/dashboard/seller/create"
                className="inline-flex items-center space-x-2 px-6 py-3 bg-[#D12C1D] text-white rounded-lg hover:bg-[#B8241A] transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Create Your First Listing</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}