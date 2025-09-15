'use client';

import { useEffect, useState } from 'react';
import PropertyVideoCard from './PropertyVideoCard';
import { supabase } from '@/lib/supabase';

// Mock data as fallback
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
      name: 'Anhoch',
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
      name: 'Cristiano Ronaldo',
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
      name: 'Maria Santos',
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
      
      // Fetch properties with videos and their seller profiles
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
          area,
          video_url,
          images,
          description,
          seller_id,
          profiles!properties_seller_id_fkey (
            id,
            full_name,
            avatar_url
          )
        `)
        .not('video_url', 'is', null)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching properties:', error);
        setLoading(false);
        return;
      }

      console.log('Fetched properties:', properties);

      // Transform the data to match the expected format
      const transformedVideos = properties.map((property: any) => ({
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
          name: property.profiles?.full_name || 'Property Seller',
          avatar: property.profiles?.avatar_url || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?w=100&h=100&fit=crop&crop=face',
          phone: '+356 9999 1234', // Default phone
          id: property.seller_id,
        }
      }));

      console.log('Transformed videos:', transformedVideos);

      if (transformedVideos.length > 0) {
        setPropertyVideos(transformedVideos);
      }
    } catch (error) {
      console.error('Error in fetchPropertyVideos:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
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