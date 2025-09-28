// Simple in-memory auth system (replace with your preferred solution later)
interface User {
  id: string;
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

// In-memory storage (replace with localStorage or your database)
let currentUser: User | null = null;
let users: User[] = [];

// Load from localStorage if available
if (typeof window !== 'undefined') {
  const savedUser = localStorage.getItem('currentUser');
  const savedUsers = localStorage.getItem('users');
  
  if (savedUser) {
    currentUser = JSON.parse(savedUser);
  }
  
  if (savedUsers) {
    users = JSON.parse(savedUsers);
  }
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

export async function signUp(data: SignUpData): Promise<{ user: User }> {
  // Import Supabase to save profile immediately
  const { supabase } = await import('./supabase');
  
  // Check if user already exists
  const existingUser = users.find(u => u.email === data.email);
  if (existingUser) {
    throw new Error('User with this email already exists');
  }

  // Create new user
  const newUser: User = {
    id: Math.random().toString(36).substr(2, 9),
    name: data.full_name,
    email: data.email,
    role: data.role,
    createdAt: new Date().toISOString(),
    // Assign Free plan to new sellers, no plan for buyers
    plan_id: data.role === 'seller' ? 'free' : undefined,
    verification_prompt_shown: false,
  };

  // CRITICAL: Save profile to Supabase IMMEDIATELY so it shows on listings
  try {
    console.log('Creating profile in Supabase for:', newUser.name, newUser.id);
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: newUser.id,
        full_name: data.full_name,
        role: data.role,
        plan_id: data.role === 'seller' ? 'free' : undefined,
        verified: false,
        verification_prompt_shown: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (profileError) {
      console.error('Failed to create profile:', profileError);
      throw new Error('Failed to create user profile');
    }
    
    console.log('Profile created successfully in Supabase:', profileData);
  } catch (error) {
    console.error('Error creating profile:', error);
    throw new Error('Failed to create user profile');
  }

  // Store user locally
  users.push(newUser);
  currentUser = newUser;

  // Save to localStorage
  if (typeof window !== 'undefined') {
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
  }

  return { user: newUser };
}

export async function signIn(data: SignInData): Promise<{ user: User }> {
  // Find user by email
  const user = users.find(u => u.email === data.email);
  if (!user) {
    throw new Error('Invalid email or password');
  }

  // Set as current user
  currentUser = user;

  // Save to localStorage
  if (typeof window !== 'undefined') {
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
  }

  return { user };
}

export async function signOut(): Promise<void> {
  currentUser = null;
  
  // Remove from localStorage
  if (typeof window !== 'undefined') {
    localStorage.removeItem('currentUser');
  }
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

  // Update current user
  currentUser = { ...currentUser, ...updates };

  // Update in users array
  const userIndex = users.findIndex(u => u.id === currentUser.id);
  if (userIndex !== -1) {
    users[userIndex] = currentUser;
  }

  // Save to localStorage
  if (typeof window !== 'undefined') {
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
  }

  // Notify listeners
  notifyAuthListeners();

  return currentUser;
}