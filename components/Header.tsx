'use client';

import { useAuth } from '@/hooks/useAuth';
import { signOut } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { Search, Shield } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function Header() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleSignIn = () => {
    router.push('/auth/signin');
  };

  const handleDashboard = () => {
    const dashboardRoute = user?.role === 'buyer' 
      ? '/dashboard/buyer' 
      : '/dashboard/seller';
    router.push(dashboardRoute);
  };

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="flex items-center justify-between px-4 py-3 max-w-7xl mx-auto">
        <div className="flex items-center">
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/logo copy.png"
              alt="Malta Sells Logo"
              width={40}
              height={40}
              className="rounded-lg"
            />
          </Link>
        </div>
        
        <div className="flex items-center space-x-3">
          <Link
            href="/search"
            className="flex items-center space-x-1 text-[#d8171e] hover:text-[#B8241A] transition-colors text-sm font-medium"
          >
            <Search className="w-4 h-4" />
            <span className="hidden sm:inline">Search</span>
          </Link>
          {isAuthenticated && user?.role === 'admin' && (
            <Link
              href="/admin"
              className="flex items-center space-x-1 text-purple-600 hover:text-purple-700 transition-colors text-sm font-medium"
            >
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">Admin</span>
            </Link>
          )}
          {isAuthenticated && user ? (
            <>
              <span className="text-sm text-gray-600 hidden sm:block">
                Welcome, {user.name}
              </span>
              <button
                onClick={handleDashboard}
                data-testid="dashboard-button"
                className="bg-[#D12C1D] text-white px-4 py-2 rounded-lg hover:bg-[#B8241A] transition-colors text-xs font-medium whitespace-nowrap"
              >
                Dashboard
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleSignIn}
                data-testid="sign-in-button"
                className="text-[#D12C1D] hover:text-[#B8241A] hover:scale-105 transition-all duration-200 ease-in-out text-sm font-medium"
              >
                Sign In
              </button>
              <Link
                href="/auth/signup"
                data-testid="sign-up-button"
                className="bg-[#D12C1D] text-white px-4 py-2 rounded-lg hover:bg-[#B8241A] transition-colors text-sm font-medium"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}