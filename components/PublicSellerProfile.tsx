'use client';

import { ArrowLeft, Phone, Mail, MapPin, Bed, Bath, User, BadgeCheck } from 'lucide-react';
import { getPlanById, getDefaultPlan } from '@/lib/plans';
import Link from 'next/link';

interface Property {
  id: number;
  title: string;
  location: string;
  price: number;
  currency: string;
  beds: number;
  baths: number;
  image: string;
  type: string;
}

interface Seller {
  id: string;
  name: string;
  email: string;
  role: 'seller';
  createdAt: string;
  avatar_url?: string;
  banner_url?: string;
  phone?: string;
  bio?: string;
  properties: Property[];
}

interface PublicSellerProfileProps {
  seller: Seller;
}

export default function PublicSellerProfile({ seller }: PublicSellerProfileProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="flex items-center p-4">
          <Link href="/" className="p-2 hover:bg-gray-100 rounded-full mr-2">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-lg font-semibold">Seller Profile</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <div className="bg-white shadow-sm">
          {/* Banner */}
          <div className="relative h-48 bg-gradient-to-r from-[#D12C1D] to-[#B8241A]">
            {seller.banner_url ? (
              <img
                src={seller.banner_url}
                alt="Profile banner"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-[#D12C1D] to-[#B8241A]" />
            )}
          </div>

          {/* Profile Info */}
          <div className="relative px-6 pb-6">
            {/* Avatar */}
            <div className="relative -mt-16 mb-4">
              <div className="w-32 h-32 rounded-full border-4 border-white bg-white shadow-lg overflow-hidden">
                {seller.avatar_url ? (
                  <img
                    src={seller.avatar_url}
                    alt={seller.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <User className="w-16 h-16 text-gray-400" />
                  </div>
                )}
              </div>
            </div>

            {/* Seller Details */}
            <div className="space-y-4">
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-3xl font-bold text-gray-900">{seller.name}</h1>
                  {/* Show verification badge only for paid plans (not Free plan) */}
                  {(() => {
                    const userPlan = seller.plan_id ? getPlanById(seller.plan_id) : getDefaultPlan();
                    const isPaidPlan = userPlan.id !== 'free';
                    return isPaidPlan ? (
                      <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-500 rounded-full">
                        <BadgeCheck className="w-5 h-5 text-white" />
                      </span>
                    ) : null;
                  })()}
                </div>
                <div className="flex items-center space-x-2 mt-2">
                  <span className="px-3 py-1 bg-[#D12C1D] text-white text-sm font-medium rounded-full capitalize">
                    Property Seller
                  </span>
                </div>
              </div>

              {seller.bio && (
                <p className="text-gray-700 max-w-2xl">{seller.bio}</p>
              )}

              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span>Member since {new Date(seller.createdAt).getFullYear()}</span>
                <span>•</span>
                <span>{seller.properties.length} properties listed</span>
              </div>

              {/* Contact Buttons */}
              <div className="flex space-x-3 pt-4">
                {seller.phone && (
                  <a
                    href={`tel:${seller.phone}`}
                    className="flex items-center space-x-2 px-4 py-2 bg-[#D12C1D] text-white rounded-lg hover:bg-[#B8241A] transition-colors"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Call</span>
                  </a>
                )}
                {seller.phone && (
                  <a
                    href={`https://wa.me/${seller.phone.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                    </svg>
                    <span>WhatsApp</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Properties Section */}
        <div className="p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Properties by {seller.name}
            </h2>
            <p className="text-gray-600">
              {seller.properties.length} properties available
            </p>
          </div>

          {seller.properties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {seller.properties.map((property) => (
                <Link
                  key={property.id}
                  href={`/property/${property.id}`}
                  className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="aspect-[16/9] overflow-hidden">
                    <img
                      src={property.image}
                      alt={property.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
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
                    
                    <div className="flex items-center text-gray-600 mb-3">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span className="text-sm">{property.location}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-gray-600">
                        <div className="flex items-center">
                          <Bed className="w-4 h-4 mr-1" />
                          <span className="text-sm">{property.beds} beds</span>
                        </div>
                        <div className="flex items-center">
                          <Bath className="w-4 h-4 mr-1" />
                          <span className="text-sm">{property.baths} baths</span>
                        </div>
                      </div>
                      
                      <div className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded">
                        {property.type}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No properties listed yet
              </h3>
              <p className="text-gray-600">
                This seller hasn't listed any properties yet.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}