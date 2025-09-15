'use client';

import { useEffect, useState } from 'react';
import { getCurrentUser, onAuthStateChange } from '@/lib/auth';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin' | 'buyer' | 'seller';
  createdAt: string;
  avatar_url?: string;
  banner_url?: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial user
    const currentUser = getCurrentUser();
    setUser(currentUser);
    setLoading(false);

    // Listen for auth changes
    const unsubscribe = onAuthStateChange((user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const updateUserProfile = async (updates: Partial<User>) => {
    if (!user) return;
    
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    
    // Update localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    }
  };
  return {
    user,
    profile: user, // For compatibility with existing code
    loading,
    isAuthenticated: !!user,
    updateUserProfile,
  };
};