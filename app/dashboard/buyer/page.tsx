'use client';

import { useState, useEffect } from 'react';
import { Heart, User, Home, ArrowLeft, Settings, Bookmark, Wand2 } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

export default function BuyerDashboard() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth/signin');
    } else if (!loading && user && user.role !== 'buyer') {
      router.push('/dashboard/seller');
    }
  }, [user, isAuthenticated, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D12C1D]"></div>
      </div>
    );
  }

  if (!user || user.role !== 'buyer') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="flex items-center justify-between p-4 max-w-7xl mx-auto">
          <Link href="/" className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-semibold">Buyer Dashboard</h1>
          <div></div>
        </div>
      </div>

      <div className="p-4 max-w-4xl mx-auto space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome, {user.name}!
          </h1>
          <p className="text-gray-600">
            Find your dream property in Malta
          </p>
        </div>

        {/* Profile Card */}
        <div className="bg-gradient-to-r from-[#D12C1D] to-[#B8241A] rounded-lg p-6 text-white">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <User className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">{user.name}</h2>
              <p className="text-white/80">{user.email}</p>
              <p className="text-white/80 capitalize">{user.role}</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link href="/search" className="bg-white rounded-lg p-6 text-center hover:shadow-md transition-shadow">
            <Home className="w-8 h-8 text-[#D12C1D] mx-auto mb-2" />
            <h3 className="font-semibold text-gray-900">Browse Properties</h3>
            <p className="text-sm text-gray-600 mt-1">Find your dream property</p>
          </Link>
          
          <Link href="/services" className="bg-white rounded-lg p-6 text-center hover:shadow-md transition-shadow">
            <Settings className="w-8 h-8 text-[#D12C1D] mx-auto mb-2" />
            <h3 className="font-semibold text-gray-900">Browse Services</h3>
            <p className="text-sm text-gray-600 mt-1">Find services for your new home</p>
          </Link>
          
          <Link href="/wishlists" className="bg-white rounded-lg p-6 text-center hover:shadow-md transition-shadow">
            <Heart className="w-8 h-8 text-[#D12C1D] mx-auto mb-2" />
            <h3 className="font-semibold text-gray-900">Saved Properties</h3>
            <p className="text-sm text-gray-600 mt-1">View your favorites</p>
          </Link>
          
          <Link href="/services" className="bg-white rounded-lg p-6 text-center hover:shadow-md transition-shadow">
            <Bookmark className="w-8 h-8 text-[#D12C1D] mx-auto mb-2" />
            <h3 className="font-semibold text-gray-900">Saved Services</h3>
            <p className="text-sm text-gray-600 mt-1">View your saved service providers</p>
          </Link>
        </div>

        {/* Decorate your property */}
        <div className="bg-white rounded-lg shadow-sm p-6 relative overflow-hidden">
          <div className="absolute top-3 right-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-2 py-1 rounded-full text-xs font-medium">
            With AI
          </div>
          <div className="text-center">
            <Wand2 className="w-12 h-12 text-[#D12C1D] mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Decorate your property</h3>
            <p className="text-gray-600 mb-4">Transform your space with AI-powered interior design</p>
            <div className="inline-block px-4 py-2 bg-gray-100 text-gray-500 rounded-lg text-sm font-medium cursor-not-allowed">
              Coming Soon
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}