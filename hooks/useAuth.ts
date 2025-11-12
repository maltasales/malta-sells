'use client';

import { useEffect, useState } from 'react';
import { getCurrentUser, onAuthStateChange, updateUserProfile as updateProfile } from '@/lib/auth';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin' | 'buyer' | 'seller';
  createdAt: string;
  avatar_url?: string;
  banner_url?: string;
  plan_id?: string;
  verification_prompt_shown?: boolean;
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
    if (!user) {
      throw new Error('No user is currently signed in');
    }

    try {
      // Use the centralized update function from lib/auth
      const updatedUser = await updateProfile(updates);
      setUser(updatedUser);
    } catch (error) {
      console.error('Failed to update user profile:', error);
      throw error;
    }
  };

  return {
    user,
    profile: user,
    loading,
    isAuthenticated: !!user,
    updateUserProfile,
  };
};