'use client';

import { useEffect, useState } from 'react';
import { getCurrentUser, onAuthStateChange } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin' | 'buyer' | 'seller';
  createdAt: string;
  avatar_url?: string;
  banner_url?: string;
  plan_id?: string;
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
    
    try {
      // Update in Supabase
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) {
        console.error('Error updating profile in database:', error);
        throw error;
      }

      // Update local state
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      
      // Update localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error('Failed to update user profile:', error);
      throw error;
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