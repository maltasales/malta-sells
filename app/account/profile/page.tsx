'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, User, Camera, Upload } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { profile, user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '');
  const [bannerUrl, setBannerUrl] = useState(profile?.banner_url || '');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: profile?.full_name || '',
      email: profile?.email || '',
      phone: profile?.phone || '',
    },
  });

  const uploadImage = async (file: File, bucket: string, folder: string) => {
    if (!user?.id) throw new Error('User not authenticated');

    const fileExt = file.name.split('.').pop();
    const fileName = `${folder}/${user.id}/${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;

    setUploadingAvatar(true);
    try {
      const url = await uploadImage(file, 'profile-images', user.id);
      setAvatarUrl(url);

      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: url })
        .eq('id', user.id);

      if (error) throw error;
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      alert('Failed to upload avatar: ' + error.message);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleBannerChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;

    setUploadingBanner(true);
    try {
      const url = await uploadImage(file, 'banner-images', user.id);
      setBannerUrl(url);

      const { error } = await supabase
        .from('profiles')
        .update({ banner_url: url })
        .eq('id', user.id);

      if (error) throw error;
    } catch (error: any) {
      console.error('Error uploading banner:', error);
      alert('Failed to upload banner: ' + error.message);
    } finally {
      setUploadingBanner(false);
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: data.name,
          email: data.email,
          phone: data.phone,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      alert('Profile updated successfully!');
      router.push('/account');
    } catch (error: any) {
      setError('root', {
        message: error.message || 'An error occurred while updating your profile',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D12C1D]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="flex items-center p-4">
          <Link href="/account" className="p-2 hover:bg-gray-100 rounded-full mr-2">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-lg font-semibold">Edit Profile</h1>
        </div>
      </div>

      <div className="p-6 max-w-md mx-auto">
        {/* Banner Image */}
        <div className="mb-8 -mx-6 -mt-6">
          <div className="relative h-40 bg-gradient-to-r from-[#D12C1D] to-[#B8241A]">
            {bannerUrl && (
              <Image src={bannerUrl} alt="Banner" fill className="object-cover" />
            )}
            <button
              type="button"
              onClick={() => bannerInputRef.current?.click()}
              disabled={uploadingBanner}
              className="absolute bottom-2 right-2 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 disabled:opacity-50"
            >
              {uploadingBanner ? (
                <div className="w-5 h-5 border-2 border-[#D12C1D] border-t-transparent rounded-full animate-spin" />
              ) : (
                <Camera className="w-5 h-5 text-gray-700" />
              )}
            </button>
            <input
              ref={bannerInputRef}
              type="file"
              accept="image/*"
              onChange={handleBannerChange}
              className="hidden"
            />
          </div>
        </div>

        {/* Profile Picture */}
        <div className="mb-8 text-center -mt-12">
          <div className="relative w-24 h-24 mx-auto">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt="Profile"
                fill
                className="rounded-full border-4 border-white object-cover"
              />
            ) : (
              <div className="w-24 h-24 bg-[#D12C1D] rounded-full border-4 border-white flex items-center justify-center">
                <User className="w-12 h-12 text-white" />
              </div>
            )}
            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              disabled={uploadingAvatar}
              className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 disabled:opacity-50"
            >
              {uploadingAvatar ? (
                <div className="w-4 h-4 border-2 border-[#D12C1D] border-t-transparent rounded-full animate-spin" />
              ) : (
                <Camera className="w-4 h-4 text-gray-700" />
              )}
            </button>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2 mt-4">
            Update Your Profile
          </h2>
          <p className="text-gray-600">
            Keep your information up to date
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <input
              {...register('name')}
              type="text"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D12C1D] focus:border-transparent"
              placeholder="Enter your full name"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              {...register('email')}
              type="email"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D12C1D] focus:border-transparent"
              placeholder="Enter your email"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <input
              {...register('phone')}
              type="tel"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D12C1D] focus:border-transparent"
              placeholder="Enter your phone number"
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
            )}
          </div>

          {/* Role (Read-only) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Account Type
            </label>
            <div className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-600 capitalize">
              {profile.role}
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Contact support to change your account type
            </p>
          </div>

          {/* Error Message */}
          {errors.root && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{errors.root.message}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-[#D12C1D] text-white rounded-lg hover:bg-[#B8241A] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Updating Profile...' : 'Update Profile'}
          </button>
        </form>
      </div>
    </div>
  );
}