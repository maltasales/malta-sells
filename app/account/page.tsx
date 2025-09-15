'use client';

import { ArrowLeft, User, Heart, LogOut, Edit, Home, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { signOut } from '@/lib/auth';
import { useRouter } from 'next/navigation';

export default function AccountPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  // Define account options based on user authentication and role
  const accountOptions = isAuthenticated && user ? [
    { 
      name: 'Dashboard', 
      icon: Home, 
      href: user.role === 'seller' ? '/dashboard/seller' : '/dashboard/buyer' 
    },
    ...(user.role === 'seller' ? [
      { name: 'Upgrade Your Plan', icon: Sparkles, href: '/account/upgrade-plan' }
    ] : []),
    { name: 'Personal Information', icon: User, href: '/account/profile' },
    { name: 'Saved Properties', icon: Heart, href: '/wishlists' },
  ] : [];

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="flex items-center p-4 max-w-md mx-auto">
          <Link href="/" className="p-2 hover:bg-gray-100 rounded-full mr-2">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-lg font-semibold">Account</h1>
        </div>
      </div>

      <div className="p-4 max-w-md mx-auto">
        {/* Profile Section */}
        {isAuthenticated && user ? (
          <div className="flex items-center space-x-4 p-4 bg-white rounded-lg mb-6 shadow-sm">
            <div className="w-16 h-16 bg-[#D12C1D] rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900">{user.name}</h2>
              <p className="text-gray-600">{user.email}</p>
              <p className="text-sm text-[#D12C1D] capitalize font-medium">{user.role}</p>
            </div>
            <Link
              href="/account/profile"
              className="p-2 hover:bg-gray-200 rounded-full transition-colors"
            >
              <Edit className="w-5 h-5 text-gray-600" />
            </Link>
          </div>
        ) : (
          <div className="flex items-center space-x-4 p-4 bg-white rounded-lg mb-6 shadow-sm">
            <div className="w-16 h-16 bg-[#D12C1D] rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Welcome!</h2>
              <p className="text-gray-600">Sign in to access your account</p>
              <Link
                href="/auth/signin"
                className="mt-2 inline-block px-4 py-2 bg-[#D12C1D] text-white rounded-lg text-sm hover:bg-[#B8241A] transition-colors"
              >
                Sign In
              </Link>
            </div>
          </div>
        )}

        {/* Account Options */}
        <div className="space-y-2">
          {accountOptions.map((option, index) => (
            <Link
              key={index}
              href={option.href}
              className="flex items-center space-x-4 p-4 bg-white border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
            >
              <option.icon className="w-5 h-5 text-gray-600" />
              <span className="text-gray-900 font-medium">{option.name}</span>
            </Link>
          ))}
          
          {isAuthenticated && (
            <button
              onClick={handleSignOut}
              className="flex items-center space-x-4 p-4 bg-white border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors w-full text-left shadow-sm"
            >
              <LogOut className="w-5 h-5 text-red-600" />
              <span className="text-red-600 font-medium">Sign Out</span>
            </button>
          )}
        </div>

        {/* App Info */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="text-center text-gray-500 space-y-2">
            <p className="text-sm">Malta Sells v1.0</p>
            <p className="text-xs">Made with ❤️ for Malta</p>
          </div>
        </div>
      </div>
    </div>
  );
}