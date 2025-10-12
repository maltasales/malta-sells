// Profile synchronization utilities
import { supabase } from './supabase';

/**
 * Syncs user profile updates to ensure consistency across Property Videos and Listings
 */
export async function syncProfileToProperties(userId: string, profileData: {
  full_name?: string;
  avatar_url?: string;
  phone?: string;
  role?: string;
  plan_id?: string;
  verified?: boolean;
}) {
  try {
    console.log('Syncing profile updates for user:', userId, profileData);

    // Note: Since properties store seller_id but display info comes from profiles table,
    // the sync happens automatically through database relationships.
    // This function can be extended if we need to store denormalized data for performance.

    // For now, just ensure the profile is updated in the profiles table
    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...profileData,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error syncing profile:', error);
      return { success: false, error };
    }

    console.log('Profile synced successfully:', data);
    return { success: true, data };

  } catch (error) {
    console.error('Error in syncProfileToProperties:', error);
    return { success: false, error };
  }
}

/**
 * Gets a user's complete profile for display purposes
 */
export async function getUserDisplayInfo(userId: string) {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url, phone, role, plan_id, verified')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user display info:', error);
      return null;
    }

    // Generate consistent display information
    const displayName = profile.full_name || 'Property Seller';
    const displayRole = profile.role === 'seller' ? 'Property Seller' : 'User';
    const avatarUrl = profile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=D12C1D&color=fff&size=100`;

    return {
      id: profile.id,
      name: displayName,
      avatar: avatarUrl,
      phone: profile.phone || '+356 9999 1234',
      role: displayRole,
      plan_id: profile.plan_id || 'free',
      verified: profile.verified || false
    };

  } catch (error) {
    console.error('Error in getUserDisplayInfo:', error);
    return null;
  }
}

/**
 * Ensures profile exists for a user (creates if missing)
 */
export async function ensureProfileExists(userId: string, userData: {
  full_name: string;
  email: string;
  role: string;
  plan_id?: string;
}) {
  try {
    // Check if profile exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();

    if (existingProfile) {
      console.log('Profile already exists for user:', userId);
      return { success: true, existed: true };
    }

    // Create profile if it doesn't exist
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        full_name: userData.full_name,
        role: userData.role,
        plan_id: userData.plan_id || 'free',
        verified: false,
        verification_prompt_shown: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating profile:', error);
      return { success: false, error };
    }

    console.log('Profile created successfully:', data);
    return { success: true, existed: false, data };

  } catch (error) {
    console.error('Error in ensureProfileExists:', error);
    return { success: false, error };
  }
}