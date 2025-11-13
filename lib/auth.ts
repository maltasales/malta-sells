// SUPABASE AUTH - Real authentication with UUIDs
import { supabase } from './supabase';

interface User {
  id: string; // UUID from Supabase Auth
  name: string;
  email: string;
  role: 'buyer' | 'seller';
  createdAt: string;
  avatar_url?: string;
  banner_url?: string;
  plan_id?: string;
  verification_prompt_shown?: boolean;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

// Current user state
let currentUser: User | null = null;

// Load current session from Supabase on init
if (typeof window !== 'undefined') {
  supabase.auth.getSession().then(({ data: { session } }) => {
    if (session?.user) {
      loadUserProfile(session.user.id).catch(err => {
        console.error('Failed to load user profile on init:', err);
        supabase.auth.signOut();
      });
    }
  });

  // Listen to auth state changes
  supabase.auth.onAuthStateChange(async (event, session) => {
    console.log('Auth state changed:', event);
    if (event === 'SIGNED_IN' && session?.user) {
      await loadUserProfile(session.user.id);
    } else if (event === 'SIGNED_OUT') {
      currentUser = null;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('currentUser');
      }
      notifyAuthListeners();
    }
  });
}

export interface SignUpData {
  full_name: string;
  email: string;
  password: string;
  role: 'buyer' | 'seller';
}

export interface SignInData {
  email: string;
  password: string;
}

// Helper to load user profile from Supabase
async function loadUserProfile(userId: string): Promise<User | null> {
  try {
    // First, get auth user data for email
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
    if (authError) {
      throw new Error(`Failed to get auth user: ${authError.message}`);
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to load profile: ${error.message}`);
    }

    if (!profile) {
      throw new Error('Profile not found in database');
    }

    const user: User = {
      id: profile.id,
      name: profile.full_name || authUser?.email || 'User',
      email: authUser?.email || profile.email || '',
      role: profile.role || 'buyer',
      createdAt: profile.created_at,
      avatar_url: profile.avatar_url,
      banner_url: profile.banner_url,
      plan_id: profile.plan_id || 'free',
      verification_prompt_shown: profile.verification_prompt_shown || false,
    };

    currentUser = user;
    if (typeof window !== 'undefined') {
      localStorage.setItem('currentUser', JSON.stringify(user));
    }

    notifyAuthListeners();
    return user;
  } catch (error) {
    console.error('Error loading profile:', error);
    throw error;
  }
}

export async function signUp(data: SignUpData): Promise<{ user: User }> {
  console.log('🔥 Signing up with SUPABASE AUTH...');

  // Check if Supabase is available
  if (!supabase) {
    throw new Error('Supabase is not available. Please check your configuration.');
  }

  // Sign up with Supabase Auth - this creates a UUID user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined,
      data: {
        full_name: data.full_name,
        role: data.role,
      }
    }
  });

  if (authError) {
    console.error('❌ Supabase auth signup failed:', authError);
    throw new Error(authError.message || 'Failed to create account.');
  }

  if (!authData.user) {
    throw new Error('Failed to create account. Please try again.');
  }

  console.log('✅ SUPABASE AUTH user created with UUID:', authData.user.id);
  console.log('Session:', authData.session ? 'Active' : 'Pending confirmation');

  // If email confirmation is required, the session will be null
  if (!authData.session) {
    console.log('⏳ Email confirmation required');
    throw new Error('CONFIRMATION_REQUIRED');
  }

  // Wait a moment for the trigger to create the profile
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Load and return the user profile
  const user = await loadUserProfile(authData.user.id);
  if (!user) {
    throw new Error('Failed to load user profile after signup');
  }

  return { user };
}

export async function signIn(data: SignInData): Promise<{ user: User }> {
  console.log('🔥 Signing in with SUPABASE AUTH...');

  // Check if Supabase is available
  if (!supabase) {
    throw new Error('Supabase is not available. Please check your configuration.');
  }

  // Sign in with Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.password,
  });

  if (authError || !authData.user) {
    console.error('❌ Supabase auth signin failed:', authError);
    throw new Error(authError?.message || 'Invalid email or password. Supabase is unreachable.');
  }

  console.log('✅ SUPABASE AUTH signin successful, UUID:', authData.user.id);

  // Load user profile from Supabase
  const user = await loadUserProfile(authData.user.id);
  if (!user) {
    throw new Error('Failed to load user profile from Supabase');
  }

  return { user };
}

export async function signOut(): Promise<void> {
  console.log('🔥 Signing out from SUPABASE AUTH...');

  // Check if Supabase is available
  if (!supabase) {
    throw new Error('Supabase is not available. Please check your configuration.');
  }

  // Sign out from Supabase Auth
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Error signing out:', error);
    throw new Error(`Failed to sign out: ${error.message}`);
  }

  currentUser = null;

  // Remove from localStorage
  if (typeof window !== 'undefined') {
    localStorage.removeItem('currentUser');
  }

  notifyAuthListeners();
}

export function getCurrentUser(): User | null {
  return currentUser;
}

export function isAuthenticated(): boolean {
  return currentUser !== null;
}

// Auth state management
const authListeners: ((user: User | null) => void)[] = [];

export function onAuthStateChange(callback: (user: User | null) => void) {
  authListeners.push(callback);
  
  // Return unsubscribe function
  return () => {
    const index = authListeners.indexOf(callback);
    if (index > -1) {
      authListeners.splice(index, 1);
    }
  };
}

function notifyAuthListeners() {
  authListeners.forEach(callback => callback(currentUser));
}

// Update user profile function
export async function updateUserProfile(updates: Partial<User>): Promise<User> {
  if (!currentUser) {
    throw new Error('No user is currently signed in');
  }

  // Check if Supabase is available
  if (!supabase) {
    throw new Error('Supabase is not available. Please check your configuration.');
  }

  console.log('🔥 Updating profile in SUPABASE...');

  const updateData: any = {
    updated_at: new Date().toISOString()
  };

  if (updates.name !== undefined) updateData.full_name = updates.name;
  if (updates.avatar_url !== undefined) updateData.avatar_url = updates.avatar_url;
  if (updates.banner_url !== undefined) updateData.banner_url = updates.banner_url;
  if (updates.plan_id !== undefined) updateData.plan_id = updates.plan_id;
  if (updates.verification_prompt_shown !== undefined) updateData.verification_prompt_shown = updates.verification_prompt_shown;

  // Update profile in Supabase
  const { error } = await supabase
    .from('profiles')
    .update(updateData)
    .eq('id', currentUser.id);

  if (error) {
    console.error('❌ Failed to update profile in SUPABASE:', error);
    throw new Error(`Failed to update profile: ${error.message}`);
  }

  console.log('✅ Profile updated in SUPABASE');

  // Update local state
  currentUser = { ...currentUser, ...updates };

  // Save to localStorage
  if (typeof window !== 'undefined') {
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
  }

  // Notify listeners
  notifyAuthListeners();

  return currentUser;
}