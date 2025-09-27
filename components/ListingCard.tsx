'use client';

import { Heart, Bed, Bath, MapPin, Calendar, ArrowUpRight } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import { formatPrice } from '@/utils/priceUtils';

interface Listing {
  id: number;
  title: string;
  location: string;
  price: number;
  currency: string;
  period: string;
  beds: number;
  baths: number;
  image: string;
  availableFrom: string;
  type: string;
  videoUrl?: string;
}

interface ListingCardProps {
  listing: Listing;
}

export default function ListingCard({ listing }: ListingCardProps) {
  const [isFavorited, setIsFavorited] = useState(false);

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation when clicking share
    
    const shareData = {
      title: listing.title,
      text: `Check out this ${listing.title} in ${listing.location} for ${formatPrice(listing.price, listing.currency)}`,
      url: `${window.location.origin}/property/${listing.id}`
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(`${shareData.title} - ${shareData.url}`);
        alert('Property link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative">
        <Link href={`/property/${listing.id}`}>
          <div className="aspect-[16/9] overflow-hidden">
            <img
              src={listing.image}
              alt={listing.title}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>
        </Link>
        
        <button
          onClick={() => setIsFavorited(!isFavorited)}
          className="absolute top-3 right-3 p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-colors"
        >
          <Heart
            className={`w-4 h-4 ${
              isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-600'
            }`}
          />
        </button>
        
        <button
          onClick={handleShare}
          className="absolute top-3 right-14 p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-colors"
        >
          <ArrowUpRight className="w-4 h-4 text-gray-600" />
        </button>
        
        <div className="absolute top-3 left-3 px-2 py-1 bg-white/90 backdrop-blur-sm rounded text-xs font-medium">
          {listing.type}
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <Link href={`/property/${listing.id}`}>
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-1 hover:text-[#D12C1D] transition-colors cursor-pointer">
              {listing.title}
            </h3>
          </Link>
          <div className="text-right">
            <p className="text-lg font-bold text-gray-900">
              {formatPrice(listing.price, listing.currency)}
            </p>
          </div>
        </div>
        
        <div className="flex items-center text-gray-600 mb-3">
          <MapPin className="w-4 h-4 mr-1" />
          <span className="text-sm">{listing.location}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-gray-600">
            <div className="flex items-center">
              <Bed className="w-4 h-4 mr-1" />
              <span className="text-sm">{listing.beds} beds</span>
            </div>
            <div className="flex items-center">
              <Bath className="w-4 h-4 mr-1" />
              <span className="text-sm">{listing.baths} baths</span>
            </div>
          </div>
          
          <div className="flex items-center text-gray-500 text-xs">
            <Calendar className="w-3 h-3 mr-1" />
            <span>{listing.availableFrom}</span>
          </div>
        </div>
      </div>
    </div>
  );
}