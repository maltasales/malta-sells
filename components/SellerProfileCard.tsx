'use client';

import { User, ExternalLink, BadgeCheck } from 'lucide-react';
import Link from 'next/link';
import { useRef, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface SellerProfileCardProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: 'buyer' | 'seller';
    createdAt: string;
    avatar_url?: string;
    banner_url?: string;
  };
}

export default function SellerProfileCard({ user }: SellerProfileCardProps) {
  const { updateUserProfile } = useAuth();
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [currentBannerUrl, setCurrentBannerUrl] = useState(user.banner_url);
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState(user.avatar_url);

  const handleBannerClick = () => {
    bannerInputRef.current?.click();
  };

  const handleAvatarClick = () => {
    avatarInputRef.current?.click();
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be less than 5MB');
      return;
    }
    setIsUploadingBanner(true);
    try {
      // Create a URL for the uploaded file
      const imageUrl = URL.createObjectURL(file);
      
      // Update the banner URL in state immediately for UI feedback
      setCurrentBannerUrl(imageUrl);
      
      // Update the user profile
      if (updateUserProfile) {
        await updateUserProfile({ banner_url: imageUrl });
      }
      
    } catch (error) {
      console.error('Error uploading banner:', error);
      alert('Failed to upload banner image');
      // Revert on error
      setCurrentBannerUrl(user.banner_url);
    } finally {
      setIsUploadingBanner(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be less than 5MB');
      return;
    }
    setIsUploadingAvatar(true);
    try {
      // Create a URL for the uploaded file
      const imageUrl = URL.createObjectURL(file);
      
      // Update the avatar URL in state immediately for UI feedback
      setCurrentAvatarUrl(imageUrl);
      
      // Update the user profile
      if (updateUserProfile) {
        await updateUserProfile({ avatar_url: imageUrl });
      }
      
    } catch (error) {
      console.error('Error uploading avatar:', error);
      alert('Failed to upload avatar image');
      // Revert on error
      setCurrentAvatarUrl(user.avatar_url);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      {/* Banner */}
      <div className="relative h-32 group">
        <div 
          onClick={handleBannerClick}
          className="w-full h-full cursor-pointer relative overflow-hidden"
        >
          {currentBannerUrl ? (
            <img
              src={currentBannerUrl}
              alt="Profile banner"
              className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105 group-hover:brightness-75"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-[#D12C1D] to-[#B8241A] transition-all duration-300 group-hover:brightness-90" />
          )}
          
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white text-sm font-medium bg-black/50 px-3 py-1 rounded-full">
              {isUploadingBanner ? 'Uploading...' : 'Change Banner'}
            </div>
          </div>
        </div>
        
        {/* Hidden file input for banner */}
        <input
          ref={bannerInputRef}
          type="file"
          accept="image/*"
          onChange={handleBannerUpload}
          className="hidden"
        />
      </div>

      {/* Profile Info */}
      <div className="relative px-6 pb-6">
        {/* Avatar */}
        <div className="relative -mt-12 mb-4">
          <div 
            onClick={handleAvatarClick}
            className="w-24 h-24 rounded-full border-4 border-white bg-white shadow-lg overflow-hidden cursor-pointer group relative"
          >
            {currentAvatarUrl ? (
              <img
                src={currentAvatarUrl}
                alt={user.name}
                className="w-full h-full object-cover transition-all duration-300 group-hover:scale-110 group-hover:brightness-75"
              />
            ) : (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center transition-all duration-300 group-hover:bg-gray-200">
                <User className="w-10 h-10 text-gray-400 transition-all duration-300 group-hover:scale-110" />
              </div>
            )}
            
            {/* Hover overlay for avatar */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center rounded-full">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white text-xs font-medium">
                {isUploadingAvatar ? 'Uploading...' : 'Change'}
              </div>
            </div>
          </div>
          
          {/* Hidden file input for avatar */}
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarUpload}
            className="hidden"
          />
        </div>

        {/* User Details */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
            <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-500 rounded-full">
              <BadgeCheck className="w-4 h-4 text-white" />
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-1 bg-[#D12C1D] text-white text-xs font-medium rounded-full capitalize">
              {user.role}
            </span>
            <span className="text-sm text-gray-500">
              Member since {new Date(user.createdAt).getFullYear()}
            </span>
          </div>
        </div>

        {/* Public Profile Link */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <Link
            href={`/seller/${user.id}`}
            className="inline-flex items-center space-x-2 text-[#D12C1D] hover:text-[#B8241A] transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            <span className="text-sm font-medium">View Public Profile</span>
          </Link>
        </div>
      </div>
    </div>
  );
}