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
      loadUserProfile(session.user.id);
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
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !profile) {
      console.error('Failed to load profile from SUPABASE:', error);
      return null;
    }

    const user: User = {
      id: profile.id,
      name: profile.full_name || profile.email || 'User',
      email: profile.email || '',
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
    return null;
  }
}

export async function signUp(data: SignUpData): Promise<{ user: User }> {
  console.log('🔥 Signing up with SUPABASE AUTH...');

  // Sign up with Supabase Auth - this creates a UUID user
  // The database trigger will automatically create the profile
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      emailRedirectTo: undefined,
      data: {
        full_name: data.full_name,
        role: data.role,
      }
    }
  });

  if (authError || !authData.user) {
    console.error('❌ Supabase auth signup failed:', authError);
    throw new Error(authError?.message || 'Failed to create account');
  }

  console.log('✅ SUPABASE AUTH user created with UUID:', authData.user.id);

  // Wait a moment for the trigger to create the profile
  await new Promise(resolve => setTimeout(resolve, 500));

  // Load and return the user profile (created by trigger)
  const user = await loadUserProfile(authData.user.id);
  if (!user) {
    throw new Error('Failed to load user profile');
  }

  console.log('✅ Profile loaded from SUPABASE:', user);
  return { user };
}

export async function signIn(data: SignInData): Promise<{ user: User }> {
  console.log('🔥 Signing in with SUPABASE AUTH...');

  // Sign in with Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.password,
  });

  if (authError || !authData.user) {
    console.error('❌ Supabase auth signin failed:', authError);
    throw new Error(authError?.message || 'Invalid email or password');
  }

  console.log('✅ SUPABASE AUTH signin successful, UUID:', authData.user.id);

  // Load user profile from Supabase
  const user = await loadUserProfile(authData.user.id);
  if (!user) {
    throw new Error('Failed to load user profile');
  }

  return { user };
}

export async function signOut(): Promise<void> {
  console.log('🔥 Signing out from SUPABASE AUTH...');

  // Sign out from Supabase Auth
  await supabase.auth.signOut();

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

  console.log('🔥 Updating profile in SUPABASE...');

  // Update profile in Supabase
  const { error } = await supabase
    .from('profiles')
    .update({
      full_name: updates.name,
      avatar_url: updates.avatar_url,
      banner_url: updates.banner_url,
      plan_id: updates.plan_id,
      verification_prompt_shown: updates.verification_prompt_shown,
      updated_at: new Date().toISOString()
    })
    .eq('id', currentUser.id);

  if (error) {
    console.error('❌ Failed to update profile in SUPABASE:', error);
    throw new Error('Failed to update profile');
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