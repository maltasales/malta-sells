// components/PropertyDetailClient.tsx
"use client";

import { MapPin, Bed, Bath, Phone, Mail, Wifi, ArrowLeft, Calculator, Sofa, BadgeCheck } from "lucide-react";
import { getPlanById, getDefaultPlan } from '@/lib/plans';
import Link from "next/link";
import ImageCarousel from "@/components/ImageCarousel";
import FavoriteButton from "@/components/FavoriteButton";

interface Listing {
  id: string;
  title: string;
  location: string;
  price: number;
  currency: string;
  beds: number;
  baths: number;
  area: number;
  description: string;
  images: string[];
  video_url: string | null;
  cover_image_url: string | null;
  profiles: {
    id: string;
    full_name: string;
    avatar_url: string | null;
    email: string;
  };
}

interface ListingDetailClientProps {
  listing: Listing;
}

export default function ListingDetailClient({ listing }: ListingDetailClientProps) {
  const handleShare = async () => {
    const shareData = {
      title: listing.title,
      text: `Check out this ${listing.title} in ${listing.location} for ${listing.currency}${listing.price.toLocaleString()}`,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between p-4">
          <Link href="/listings" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleShare}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
            </button>
            
            <FavoriteButton listingId={listing.id} />
          </div>
        </div>
      </div>

      {/* Video or Image Display */}
      {listing.video_url ? (
        <div className="relative">
          <div className="aspect-video">
            <video
              src={listing.video_url}
              controls
              className="w-full h-full object-cover"
              poster={listing.cover_image_url || listing.images?.[0]}
            >
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      ) : listing.images && listing.images.length > 0 ? (
        <ImageCarousel images={listing.images} title={listing.title} />
      ) : (
        <div className="aspect-video bg-gray-200 flex items-center justify-center">
          <p className="text-gray-500">No images available</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex space-x-3">
          <button className="flex-1 flex items-center justify-center space-x-2 p-3 bg-[#D12C1D] text-white rounded-lg hover:bg-[#B8241A] transition-colors">
            <Calculator className="w-4 h-4" />
            <span className="font-medium">Calculate Mortgage</span>
          </button>
          
          <button className="flex items-center justify-center space-x-2 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Sofa className="w-4 h-4" />
            <span className="font-medium">Virtual Tour</span>
          </button>
        </div>
      </div>

      {/* Property Details */}
      <div className="p-4 space-y-6">
        {/* Basic Info */}
        <div>
          <div className="flex items-start justify-between mb-2">
            <h1 className="text-2xl font-bold text-gray-900">{listing.title}</h1>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">
                {listing.currency}{listing.price.toLocaleString()}
              </p>
            </div>
          </div>
          
          <div className="flex items-center text-gray-600 mb-4">
            <MapPin className="w-4 h-4 mr-1" />
            <span className="text-sm">{listing.location}</span>
          </div>
          
          <div className="flex items-center space-x-6 text-gray-600">
            <div className="flex items-center">
              <Bed className="w-4 h-4 mr-1" />
              <span className="text-sm">{listing.beds} beds</span>
            </div>
            <div className="flex items-center">
              <Bath className="w-4 h-4 mr-1" />
              <span className="text-sm">{listing.baths} baths</span>
            </div>
            <div className="flex items-center">
              <span className="text-sm">{listing.area}m²</span>
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <h2 className="text-lg font-semibold mb-3">About this place</h2>
          <p className="text-gray-700 leading-relaxed">{listing.description}</p>
        </div>

        {/* Seller Contact */}
        <div className="border-t pt-6">
          <h2 className="text-lg font-semibold mb-4">Contact Seller</h2>
          <Link href={`/seller/${listing.profiles.id}`} className="block">
            <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
              {listing.profiles.avatar_url ? (
                <img
                  src={listing.profiles.avatar_url}
                  alt={listing.profiles.full_name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-gray-600 font-medium">
                    {listing.profiles.full_name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-center space-x-1">
                  <p className="font-medium text-gray-900 hover:text-[#D12C1D] transition-colors">{listing.profiles.full_name}</p>
                  <span className="inline-flex items-center justify-center w-4 h-4 bg-blue-500 rounded-full flex-shrink-0">
                    <BadgeCheck className="w-3 h-3 text-white" />
                  </span>
                </div>
                <p className="text-sm text-gray-500">Verified Seller</p>
              </div>
            </div>
          </Link>
          
          <div className="grid grid-cols-2 gap-3 mt-4">
            <a
              href={`mailto:${listing.profiles.email}`}
              className="flex items-center justify-center space-x-2 p-3 bg-[#D12C1D] text-white rounded-lg hover:bg-[#B8241A] transition-colors"
            >
              <Mail className="w-4 h-4" />
              <span className="text-sm font-medium">Email</span>
            </a>
            
            <a
              href={`mailto:${listing.profiles.email}?subject=Inquiry about ${listing.title}`}
              className="flex items-center justify-center space-x-2 p-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              <Mail className="w-4 h-4" />
              <span className="text-sm font-medium">Inquire</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}