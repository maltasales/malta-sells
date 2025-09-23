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
    
    // First, try to fetch from Supabase
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
          avatar: profile?.avatar_url || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?w=100&h=100&fit=crop&crop=face',
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
}
