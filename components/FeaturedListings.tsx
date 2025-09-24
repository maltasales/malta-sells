'use client';

import { useEffect, useState } from 'react';
import ListingCard from './ListingCard';
import { supabase } from '@/lib/supabase';

// Mock data as fallback
const mockListings = [
  {
    id: 1,
    title: 'Modern Apartment in Sliema',
    location: 'Sliema',
    price: 350000,
    currency: '€',
    period: '',
    beds: 2,
    baths: 1,
    image: 'https://images.pexels.com/photos/1918291/pexels-photo-1918291.jpeg?w=800&h=600&fit=crop',
    availableFrom: 'Available Now',
    type: 'Apartment',
    videoUrl: 'https://vjs.zencdn.net/v/oceans.mp4'
  },
  {
    id: 2,
    title: 'Luxury Penthouse in Valletta',
    location: 'Valletta',
    price: 750000,
    currency: '€',
    period: '',
    beds: 3,
    baths: 2,
    image: 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?w=800&h=600&fit=crop',
    availableFrom: 'Available Now',
    type: 'Penthouse',
    videoUrl: 'https://media.w3.org/2010/05/sintel/trailer_hd.mp4'
  },
  {
    id: 3,
    title: 'Cozy Studio in St. Julians',
    location: 'St. Julians',
    price: 280000,
    currency: '€',
    period: '',
    beds: 1,
    baths: 1,
    image: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?w=800&h=600&fit=crop',
    availableFrom: 'Available Now',
    type: 'Studio',
    videoUrl: 'https://media.w3.org/2010/05/bunny/trailer.mp4'
  },
  {
    id: 4,
    title: 'Seaside Villa in Marsaxlokk',
    location: 'Marsaxlokk',
    price: 650000,
    currency: '€',
    period: '',
    beds: 3,
    baths: 2,
    image: 'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?w=800&h=600&fit=crop',
    availableFrom: 'Available Now',
    type: 'Villa',
    videoUrl: 'https://media.w3.org/2010/05/video/movie_300.mp4'
  },
  {
    id: 5,
    title: 'Historic Townhouse in Mdina',
    location: 'Mdina',
    price: 480000,
    currency: '€',
    period: '',
    beds: 2,
    baths: 2,
    image: 'https://images.pexels.com/photos/1029599/pexels-photo-1029599.jpeg?w=800&h=600&fit=crop',
    availableFrom: 'Available Now',
    type: 'Townhouse',
    videoUrl: 'https://vjs.zencdn.net/v/oceans.mp4'
  },
  {
    id: 6,
    title: 'Modern Loft in Gzira',
    location: 'Gzira',
    price: 320000,
    currency: '€',
    period: '',
    beds: 1,
    baths: 1,
    image: 'https://images.pexels.com/photos/2724749/pexels-photo-2724749.jpeg?w=800&h=600&fit=crop',
    availableFrom: 'Available Now',
    type: 'Loft',
    videoUrl: 'https://media.w3.org/2010/05/sintel/trailer_hd.mp4'
  },
  {
    id: 7,
    title: 'Waterfront Apartment in Birgu',
    location: 'Birgu',
    price: 420000,
    currency: '€',
    period: '',
    beds: 2,
    baths: 1,
    image: 'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?w=800&h=600&fit=crop',
    availableFrom: 'Available Now',
    type: 'Apartment',
    videoUrl: 'https://media.w3.org/2010/05/bunny/trailer.mp4'
  },
  {
    id: 8,
    title: 'Garden Maisonette in Attard',
    location: 'Attard',
    price: 520000,
    currency: '€',
    period: '',
    beds: 3,
    baths: 2,
    image: 'https://images.pexels.com/photos/1396132/pexels-photo-1396132.jpeg?w=800&h=600&fit=crop',
    availableFrom: 'Available Now',
    type: 'Maisonette',
    videoUrl: 'https://media.w3.org/2010/05/video/movie_300.mp4'
  }
];

export default function FeaturedListings() {
  const [listings, setListings] = useState(mockListings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedListings();
  }, []);

  const fetchFeaturedListings = async () => {
    try {
      console.log('Fetching featured listings from Supabase...');
      
      const { data: properties, error } = await supabase
        .from('properties')
        .select(`
          id,
          title,
          location,
          price,
          currency,
          beds,
          baths,
          property_type,
          images,
          video_url,
          available_from,
          created_at
        `)
        .order('created_at', { ascending: false })
        .limit(8);

      if (error) {
        console.error('Error fetching featured listings:', error);
        setLoading(false);
        return;
      }

      console.log('Fetched featured listings:', properties);

      // Transform the data to match the expected format
      const transformedListings = properties.map((property: any) => ({
        id: property.id,
        title: property.title,
        location: property.location,
        price: property.price,
        currency: property.currency,
        period: '',
        beds: property.beds,
        baths: property.baths,
        image: property.images?.[0] || 'https://images.pexels.com/photos/1918291/pexels-photo-1918291.jpeg?w=800&h=600&fit=crop',
        availableFrom: property.available_from || 'Available Now',
        type: property.property_type,
        videoUrl: property.video_url,
      }));

      if (transformedListings.length > 0) {
        setListings(transformedListings);
      }
    } catch (error) {
      console.error('Error in fetchFeaturedListings:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div data-testid="featured-properties-section">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Featured Properties</h2>
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D12C1D]"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
        {listings.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>
      )}
    </div>
  );
}