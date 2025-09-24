// app/property/[id]/page.tsx
import { createClient } from '@supabase/supabase-js';
import { propertyData } from '@/lib/propertyData';
import PropertyDetailClient from '@/components/PropertyDetailClient';
import type { Metadata } from 'next';

// Supabase client for server-side operations
const supabaseUrl = 'https://qopnwgmmvfdopdtxiqbb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvcG53Z21tdmZkb3BkdHhpcWJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1MzQxNjcsImV4cCI6MjA3MzExMDE2N30.a33jCyJEFyBg61tAU7rmbo0j7E5uOPZYYOakbI0vsZ4';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side function to fetch property data
async function getProperty(id: string) {
  try {
    console.log('Fetching property:', id);
    
    // First, try to get synchronized listing with profile data
    const { data: listingsWithProfiles } = await supabase
      .rpc('get_listings_with_current_seller_profile');

    // Find the specific property in synchronized results
    const syncedProperty = listingsWithProfiles?.find((listing: any) => listing.listing_id === id);

    if (syncedProperty) {
      // Use synchronized data with current seller profile
      return {
        id: syncedProperty.listing_id,
        title: syncedProperty.listing_title,
        location: syncedProperty.listing_location,
        price: syncedProperty.listing_price,
        currency: syncedProperty.listing_currency,
        beds: syncedProperty.listing_beds,
        baths: syncedProperty.listing_baths,
        area: syncedProperty.listing_area,
        type: syncedProperty.property_type || 'Apartment',
        description: syncedProperty.listing_description,
        images: syncedProperty.listing_images || [],
        videoUrl: syncedProperty.listing_video_url,
        availableFrom: 'Available Now',
        amenities: ['WiFi', 'Air Conditioning', 'Parking', 'Modern Appliances'],
        owner: {
          name: syncedProperty.seller_name || 'Property Owner',
          avatar: syncedProperty.seller_avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(syncedProperty.seller_name || 'Property Owner')}&background=D12C1D&color=fff&size=100`,
          phone: syncedProperty.seller_phone || '+356 9999 0000',
          email: 'owner@maltasells.com'
        }
      };
    }

    // Fallback: try direct property fetch
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .select(`
        id,
        title,
        location,
        price,
        currency,
        beds,
        baths,
        area,
        property_type,
        description,
        images,
        video_url,
        available_from,
        seller_id
      `)
      .eq('id', id)
      .single();

    if (propertyError) {
      console.error('Supabase error:', propertyError);
      // Fallback to mock data if Supabase fails
      return propertyData[id as keyof typeof propertyData] || null;
    }

    if (property) {
      // Fetch seller profile separately
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, phone')
        .eq('id', property.seller_id)
        .single();

      // Transform to match expected format
      return {
        id: property.id,
        title: property.title,
        location: property.location,
        price: property.price,
        currency: property.currency,
        beds: property.beds,
        baths: property.baths,
        area: property.area,
        type: property.property_type,
        description: property.description,
        images: property.images || [],
        videoUrl: property.video_url,
        availableFrom: property.available_from || 'Available Now',
        amenities: ['WiFi', 'Air Conditioning', 'Parking', 'Modern Appliances'], // Default amenities
        owner: {
          name: profile?.full_name || 'Property Owner',
          avatar: profile?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.full_name || 'Property Owner')}&background=D12C1D&color=fff&size=100`,
          phone: profile?.phone || '+356 9999 0000',
          email: 'owner@maltasells.com'
        }
      };
    }

    // Final fallback to mock data
    return propertyData[id as keyof typeof propertyData] || null;
    
  } catch (error) {
    console.error('Error fetching property:', error);
    // Fallback to mock data on any error
    return propertyData[id as keyof typeof propertyData] || null;
  }
}

// Force dynamic rendering for all property pages
export const dynamic = 'force-dynamic';

// Generate static params for properties (empty array for fully dynamic)
export async function generateStaticParams() {
  // Return empty array to make all routes dynamic
  return [];
}

// Generate metadata for SEO
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const property = await getProperty(params.id);

  if (!property) {
    return {
      title: 'Property Not Found - Malta Sells',
      description: 'The property you are looking for could not be found.',
    };
  }

  return {
    title: `${property.title} - ${property.location} | Malta Sells`,
    description: property.description || `${property.title} in ${property.location} for ${property.currency}${property.price?.toLocaleString()}`,
    openGraph: {
      title: property.title,
      description: property.description,
      images: property.images?.slice(0, 1) || [],
      type: 'website',
    },
  };
}

export default async function PropertyDetailPage({ params }: { params: { id: string } }) {
  try {
    const property = await getProperty(params.id);

    if (!property) {
      return (
        <div className="min-h-screen bg-white">
          <div className="p-6 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Property not found</h1>
            <p className="text-gray-600 mb-6">The property you're looking for doesn't exist or has been removed.</p>
            <a 
              href="/"
              className="inline-block bg-[#D12C1D] text-white px-6 py-3 rounded-lg hover:bg-[#B8241A] transition-colors"
            >
              Back to Home
            </a>
          </div>
        </div>
      );
    }

    // Delegate to a client component for UI interactions
    return (
      <PropertyDetailClient property={property} />
    );
  } catch (error) {
    console.error('Error in PropertyDetailPage:', error);
    
    // Error fallback
    return (
      <div className="min-h-screen bg-white">
        <div className="p-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong</h1>
          <p className="text-gray-600 mb-6">We're having trouble loading this property. Please try again later.</p>
          <a 
            href="/"
            className="inline-block bg-[#D12C1D] text-white px-6 py-3 rounded-lg hover:bg-[#B8241A] transition-colors"
          >
            Back to Home
          </a>
        </div>
      </div>
    );
  }
}
