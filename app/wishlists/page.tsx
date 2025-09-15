'use client';

import { ArrowLeft, Heart } from 'lucide-react';
import Link from 'next/link';
import ListingCard from '@/components/ListingCard';

// Mock wishlist data
const wishlistProperties = [
  {
    id: '2',
    title: 'Luxury Penthouse in Valletta',
    location: 'Valletta',
    price: 750000,
    currency: '€',
    period: '',
    beds: 3,
    baths: 2,
    image: 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?w=800&h=600&fit=crop',
    availableFrom: 'For Sale',
    type: 'Penthouse'
  },
  {
    id: '4',
    title: 'Seaside Villa in Marsaxlokk',
    location: 'Marsaxlokk',
    price: 650000,
    currency: '€',
    period: '',
    beds: 3,
    baths: 2,
    image: 'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?w=800&h=600&fit=crop',
    availableFrom: 'For Sale',
    type: 'Villa'
  },
];

export default function WishlistsPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="flex items-center p-4">
          <Link href="/" className="p-2 hover:bg-gray-100 rounded-full mr-2">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-lg font-semibold">Wishlists</h1>
        </div>
      </div>

      <div className="p-4">
        {wishlistProperties.length > 0 ? (
          <>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Your Saved Properties
              </h2>
              <p className="text-gray-600">
                {wishlistProperties.length} properties saved
              </p>
            </div>

            <div className="space-y-4">
              {wishlistProperties.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Heart className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              No saved properties yet
            </h2>
            <p className="text-gray-600 text-center mb-6">
              Start exploring and save properties you're interested in
            </p>
            <Link
              href="/"
              className="px-6 py-3 bg-[#D12C1D] text-white rounded-lg hover:bg-[#B8241A] transition-colors"
            >
              Explore Properties
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}