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
      // Use synchronized function to get listings with current seller profiles
      const { data: syncedListings, error: syncError } = await supabase
        .rpc('get_listings_with_current_seller_profile');

      if (syncError) {
        console.error('Error fetching synchronized featured listings:', syncError);
        console.log('Falling back to direct property fetch for featured listings...');
        
        // Fallback to direct fetch if RPC function fails
        const { data: properties, error: propertiesError } = await supabase
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
            created_at,
            seller_id
          `)
          .order('created_at', { ascending: false })
          .limit(8);

        if (propertiesError) {
          console.error('Error fetching properties fallback:', propertiesError);
          setLoading(false);
          return;
        }

        // Fetch profiles for fallback
        const sellerIds = properties?.map(p => p.seller_id).filter(Boolean) || [];
        let profiles: any[] = [];
        
        if (sellerIds.length > 0) {
          const { data: profilesData } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url, phone')
            .in('id', sellerIds);
          profiles = profilesData || [];
        }

        // Transform fallback data
        const fallbackListings = properties?.map((property: any) => {
          const profile = profiles.find(p => p.id === property.seller_id);
          const firstImage = (property.images && Array.isArray(property.images) && property.images.length > 0) 
            ? property.images[0] 
            : 'https://images.pexels.com/photos/1918291/pexels-photo-1918291.jpeg?w=800&h=600&fit=crop';
            
          return {
            id: property.id,
            title: property.title,
            location: property.location,
            price: property.price,
            currency: property.currency || '€',
            beds: property.beds,
            baths: property.baths,
            type: property.property_type,
            image: firstImage,
            availableFrom: property.available_from || 'Available Now',
            description: `Beautiful ${property.property_type?.toLowerCase() || 'property'} in ${property.location}`,
            seller: {
              name: profile?.full_name || 'Property Owner',
              avatar: profile?.avatar_url,
              phone: profile?.phone,
              id: property.seller_id
            }
          };
        }) || [];

        console.log('Using fallback featured listings:', fallbackListings);
        
        if (fallbackListings.length === 0) {
          // Use mock data with seller info when no database data available
          const updatedMockListings = mockListings.map((listing, index) => {
            const sellerNames = ['Zoran Talevski', 'Maria Santos Realty', 'Anhoch Property Agent', 'Cristiano Malta Homes'];
            const sellerName = sellerNames[index % sellerNames.length];
            
            return {
              ...listing,
              seller: {
                name: sellerName,
                avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(sellerName)}&background=D12C1D&color=fff&size=100`,
                phone: '+356 9999 1234',
                id: `seller-${index + 1}`
              }
            };
          });
          setListings(updatedMockListings);
        } else {
          setListings(fallbackListings);
        }
        
        setLoading(false);
        return;
      }

      console.log('Fetched synchronized featured listings:', syncedListings);

      if (!syncedListings || syncedListings.length === 0) {
        console.log('No synchronized featured listings found, using mock data...');
        
        // Use mock data with proper seller information
        const updatedMockListings = mockListings.map((listing, index) => {
          const sellerNames = ['Zoran Talevski', 'Maria Santos Realty', 'Anhoch Property Agent', 'Cristiano Malta Homes'];
          const sellerName = sellerNames[index % sellerNames.length];
          
          return {
            ...listing,
            seller: {
              name: sellerName,
              avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(sellerName)}&background=D12C1D&color=fff&size=100`,
              phone: '+356 9999 1234',
              id: `seller-${index + 1}`
            }
          };
        });
        
        setListings(updatedMockListings);
        setLoading(false);
        return;
      }

      // Transform the synchronized data to match expected format
      const transformedListings = syncedListings?.slice(0, 8).map((listing: any) => ({
        id: listing.listing_id,
        title: listing.listing_title,
        location: listing.listing_location,
        price: listing.listing_price,
        currency: listing.listing_currency || '€',
        period: '',
        beds: listing.listing_beds,
        baths: listing.listing_baths,
        image: listing.listing_images?.[0] || 'https://images.pexels.com/photos/1918291/pexels-photo-1918291.jpeg?w=800&h=600&fit=crop',
        availableFrom: 'Available Now',
        type: listing.property_type || 'Property',
        videoUrl: listing.listing_video_url,
        seller: {
          name: listing.seller_name,
          avatar: listing.seller_avatar_url,
          phone: listing.seller_phone,
          id: listing.seller_id
        }
      })) || [];

      if (transformedListings && transformedListings.length > 0) {
        // Map video URLs to unique reliable ones based on property characteristics
        const listingsWithUniqueUrls = transformedListings.map((listing: any, index: number) => {
          let uniqueVideoUrl = listing.videoUrl;
          
          // If video URL is from failing storage services, assign unique videos
          if (listing.videoUrl?.includes('supabase.co') || listing.videoUrl?.includes('backblazeb2.com')) {
            const videoOptions = [
              'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
              'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', 
              'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
              'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
              'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4'
            ];
            
            // Use property ID hash for consistent unique assignment
            let videoIndex = 0;
            if (listing.id) {
              const idHash = listing.id.toString().split('').reduce((a, b) => a + b.charCodeAt(0), 0);
              videoIndex = idHash % videoOptions.length;
            } else if (listing.location) {
              const locationHash = listing.location.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
              videoIndex = locationHash % videoOptions.length;
            } else {
              videoIndex = index % videoOptions.length;
            }
            
            uniqueVideoUrl = videoOptions[videoIndex];
          }
          
          return {
            ...listing,
            videoUrl: uniqueVideoUrl
          };
        });
        
        setListings(listingsWithUniqueUrls);
      } else {
        // Fallback to mock data if no properties or empty result
        setListings(mockListings);
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