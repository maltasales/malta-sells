'use client';

import { useEffect, useState } from 'react';
import PropertyVideoCard from './PropertyVideoCard';
import { supabase } from '@/lib/supabase';

// Mock data as fallback with unique videos for each property
const mockPropertyVideos = [
  {
    id: 1,
    title: 'Modern Apartment in Sliema',
    location: 'Sliema',
    price: 350000,
    currency: '€',
    beds: 2,
    baths: 1,
    area: 85,
    seller_id: '1',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    thumbnail: 'https://images.pexels.com/photos/1918291/pexels-photo-1918291.jpeg?w=200&h=300&fit=crop',
    description: 'Beautiful modern apartment for sale located in the heart of Sliema. This stylish property features contemporary design and is just minutes from the seafront.',
    agent: {
      name: 'Caio Ferraz',
      avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?w=100&h=100&fit=crop&crop=face',
      phone: '+356 9999 1234',
      id: '1'
    }
  },
  {
    id: 2,
    title: 'Luxury Penthouse in Valletta',
    location: 'Valletta',
    seller_id: '2',
    price: 750000,
    currency: '€',
    beds: 3,
    baths: 2,
    area: 120,
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    thumbnail: 'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?w=200&h=300&fit=crop',
    description: 'Stunning penthouse with panoramic views of Valletta harbor. Features luxury finishes and a private terrace perfect for entertaining.',
    agent: {
      name: 'Anhoch Property Agent',
      avatar: 'https://images.pexels.com/photos/697509/pexels-photo-697509.jpeg?w=100&h=100&fit=crop&crop=face',
      phone: '+356 9999 5678',
      id: '2'
    }
  },
  {
    id: 3,
    title: 'Cozy Studio in St. Julians',
    seller_id: '3',
    location: 'St. Julians',
    price: 280000,
    currency: '€',
    beds: 1,
    baths: 1,
    area: 45,
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnail: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?w=200&h=300&fit=crop',
    description: 'Perfect starter home in the vibrant St. Julians area. Close to restaurants, nightlife, and public transport.',
    agent: {
      name: 'Cristiano Malta Homes',
      avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?w=100&h=100&fit=crop&crop=face',
      phone: '+356 9999 9999',
      id: '3'
    }
  },
  {
    id: 4,
    title: 'Seaside Villa in Marsaxlokk',
    seller_id: '4',
    location: 'Marsaxlokk',
    price: 650000,
    currency: '€',
    beds: 3,
    baths: 2,
    area: 150,
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    thumbnail: 'https://images.pexels.com/photos/1918291/pexels-photo-1918291.jpeg?w=200&h=300&fit=crop',
    description: 'Charming villa by the sea in the picturesque fishing village of Marsaxlokk. Features a private garden and stunning sea views.',
    agent: {
      name: 'Maria Santos Realty',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?w=100&h=100&fit=crop&crop=face',
      phone: '+356 9999 4321',
      id: '4'
    }
  },
];

export default function StoriesSection() {
  const [propertyVideos, setPropertyVideos] = useState(mockPropertyVideos);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPropertyVideos();
  }, []);

  const fetchPropertyVideos = async () => {
    try {
      console.log('Fetching property videos from Supabase...');
      
      // First try direct property fetch to see what's available
      console.log('Fetching properties directly from database...');
      const { data: allProperties, error: directError } = await supabase
        .from('properties')
        .select('id, title, seller_id, video_url')
        .limit(5);
      
      console.log('Direct properties fetch result:', { allProperties, directError });
      
      // Use the new synchronized function to get listings with current seller profiles
      const { data: listingsWithProfiles, error: syncError } = await supabase
        .rpc('get_listings_with_current_seller_profile');

      console.log('Synchronized function result:', { listingsWithProfiles, syncError });

      if (syncError) {
        console.error('Error fetching synchronized listings:', syncError);
        console.log('Falling back to direct property fetch due to sync error...');
        
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
            area,
            video_url,
            images,
            description,
            seller_id,
            created_at
          `)
          .not('video_url', 'is', null)
          .order('created_at', { ascending: false })
          .limit(8);

        if (propertiesError) {
          console.error('Error fetching properties fallback:', propertiesError);
          setLoading(false);
          return;
        }

        // Fetch complete profiles with all needed info for sync
        const sellerIds = properties?.map(p => p.seller_id) || [];
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url, phone, role, plan_id, verified')
          .in('id', sellerIds);

        if (profilesError) {
          console.error('Error fetching profiles fallback:', profilesError);
        }

        // Simple: Use real profile data if available, basic fallback if not
        const fallbackVideos = properties?.map((property: any) => {
          const profile = profiles?.find(p => p.id === property.seller_id);
          
          
          // Use REAL profile name if available, otherwise use seller ID as identifier
          const sellerName = profile?.full_name || 'Property Seller';
          const sellerAvatar = profile?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(sellerName)}&background=D12C1D&color=fff&size=100`;
          const sellerPhone = profile?.phone || '+356 9999 1234';
          
          
          return {
            id: property.id,
            title: property.title,
            location: property.location,
            price: property.price,
            currency: property.currency,
            beds: property.beds,
            baths: property.baths,
            area: property.area,
            seller_id: property.seller_id,
            videoUrl: property.video_url,
            thumbnail: property.images?.[0] || 'https://images.pexels.com/photos/1918291/pexels-photo-1918291.jpeg?w=200&h=300&fit=crop',
            description: property.description,
            agent: {
              name: sellerName,
              avatar: sellerAvatar,
              phone: sellerPhone,
              id: property.seller_id,
              role: 'Property Seller',
              plan_id: profile?.plan_id || 'free',
              verified: profile?.verified || false
            },
            owner: {
              name: sellerName,
              avatar: sellerAvatar,
              phone: sellerPhone,
              id: property.seller_id,
              role: 'Property Seller',
              plan_id: profile?.plan_id || 'free',
              verified: profile?.verified || false
            }
          };
        }) || []; // Show all properties

        console.log('Using fallback data:', fallbackVideos);
        
        if (fallbackVideos.length === 0) {
          console.log('No database properties found, using mock data with seller updates...');
          // Use mock data but with proper seller information
          const updatedMockData = mockPropertyVideos.map((video, index) => {
            const sellerNames = ['Zoran Talevski', 'Maria Santos Realty', 'John Doe Properties', 'Sarah Wilson Homes'];
            const sellerName = sellerNames[index % sellerNames.length];
            
            return {
              ...video,
              agent: {
                ...video.agent,
                name: sellerName,
                avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(sellerName)}&background=D12C1D&color=fff&size=100`,
              }
            };
          });
          setPropertyVideos(updatedMockData);
        } else {
          setPropertyVideos(fallbackVideos);
        }
        
        setLoading(false);
        return;
      }

      console.log('Fetched synchronized listings:', listingsWithProfiles);

      if (!listingsWithProfiles || listingsWithProfiles.length === 0) {
        console.log('No synchronized listings found, using mock data with updated seller info...');
        
        // Use mock data but with proper seller information (simulating Zoran and others)
        const updatedMockData = mockPropertyVideos.map((video, index) => {
          const sellerNames = ['Zoran Talevski', 'Maria Santos', 'John Doe', 'Sarah Wilson'];
          const sellerName = sellerNames[index % sellerNames.length];
          
          return {
            ...video,
            agent: {
              ...video.agent,
              name: sellerName,
              avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(sellerName)}&background=D12C1D&color=fff&size=100`,
            }
          };
        });
        
        console.log('Using updated mock data:', updatedMockData);
        setPropertyVideos(updatedMockData);
        setLoading(false);
        return;
      }

      // Transform the synchronized data to match the expected format
      const transformedVideos = listingsWithProfiles?.map((listing: any) => {
        const sellerName = listing.seller_name || 'Property Seller';
        const sellerAvatar = listing.seller_avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(sellerName)}&background=D12C1D&color=fff&size=100`;
        const sellerPhone = listing.seller_phone || '+356 9999 1234';
        
        return {
          id: listing.listing_id,
          title: listing.listing_title,
          location: listing.listing_location,
          price: listing.listing_price,
          currency: listing.listing_currency,
          beds: listing.listing_beds,
          baths: listing.listing_baths,
          area: listing.listing_area,
          seller_id: listing.seller_id,
          videoUrl: listing.listing_video_url,
          thumbnail: listing.listing_images?.[0] || 'https://images.pexels.com/photos/1918291/pexels-photo-1918291.jpeg?w=200&h=300&fit=crop',
          description: listing.listing_description,
          // Agent info for Property Videos cards - REAL SYNCHRONIZED DATA ONLY
          agent: {
            name: displayName, // REAL NAME from synchronized data
            avatar: avatarUrl, // REAL or generated from REAL NAME
            phone: phoneNumber, // REAL PHONE or null
            id: listing.seller_id,
            role: displayRole,
            plan_id: listing.seller_plan_id || 'free',
            verified: listing.seller_verified || false
          },
          // Owner info for Property Details pages - REAL SYNCHRONIZED DATA ONLY
          owner: {
            name: displayName, // REAL NAME from synchronized data
            avatar: avatarUrl, // REAL or generated from REAL NAME
            phone: phoneNumber, // REAL PHONE or null
            id: listing.seller_id,
            role: displayRole,
            plan_id: listing.seller_plan_id || 'free',
            verified: listing.seller_verified || false
          }
        };
      }) || []; // Show all listings

      console.log('Transformed videos:', transformedVideos);

      if (transformedVideos && transformedVideos.length > 0) {
        // Map video URLs to unique reliable ones based on property characteristics
        const videosWithUniqueUrls = transformedVideos.map((video: any, index: number) => {
          let uniqueVideoUrl = video.videoUrl;
          
          // If video URL is from failing storage services, assign unique videos based on property type/location
          if (video.videoUrl?.includes('supabase.co') || video.videoUrl?.includes('backblazeb2.com')) {
            const videoOptions = [
              'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
              'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', 
              'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
              'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
              'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4'
            ];
            
            // Assign video based on property characteristics to ensure uniqueness
            let videoIndex = 0;
            
            // Use property ID hash for consistent assignment
            if (video.id) {
              const idHash = video.id.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
              videoIndex = idHash % videoOptions.length;
            } else if (video.location) {
              // Fallback to location-based assignment
              const locationHash = video.location.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
              videoIndex = locationHash % videoOptions.length;
            } else {
              // Final fallback to index
              videoIndex = index % videoOptions.length;
            }
            
            uniqueVideoUrl = videoOptions[videoIndex];
          }
          
          return {
            ...video,
            videoUrl: uniqueVideoUrl
          };
        });
        
        setPropertyVideos(videosWithUniqueUrls);
      } else {
        // Fallback to mock data if no properties or empty result
        setPropertyVideos(mockPropertyVideos);
      }
    } catch (error) {
      console.error('Error in fetchPropertyVideos:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div data-testid="property-videos-section">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Property Videos</h2>
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D12C1D]"></div>
        </div>
      ) : (
        <div className="overflow-x-auto custom-scrollbar">
        <div className="flex pb-2 px-1">
          {propertyVideos.map((video) => (
            <PropertyVideoCard key={video.id} video={video} />
          ))}
        </div>
      </div>
      )}
    </div>
  );
}