import { createClient } from '@supabase/supabase-js';

// Use environment variables for security
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          role: 'user' | 'admin' | 'buyer' | 'seller' | null;
          avatar_url: string | null;
          banner_url: string | null;
          phone: string | null;
          plan_id: string | null;
          plan_expires_at: string | null;
          verified: boolean | null;
          verification_prompt_shown: boolean | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          role?: 'user' | 'admin' | 'buyer' | 'seller' | null;
          avatar_url?: string | null;
          banner_url?: string | null;
          phone?: string | null;
          plan_id?: string | null;
          plan_expires_at?: string | null;
          verified?: boolean | null;
          verification_prompt_shown?: boolean | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          role?: 'user' | 'admin' | 'buyer' | 'seller' | null;
          avatar_url?: string | null;
          banner_url?: string | null;
          phone?: string | null;
          plan_id?: string | null;
          plan_expires_at?: string | null;
          verified?: boolean | null;
          verification_prompt_shown?: boolean | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      properties: {
        Row: {
          id: string;
          seller_id: string;
          title: string;
          property_type: string;
          location: string;
          price: number;
          currency: string;
          beds: number | null;
          baths: number | null;
          area: number | null;
          description: string | null;
          tags: string[] | null;
          images: string[] | null;
          video_url: string | null;
          available_from: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          seller_id: string;
          title: string;
          property_type: string;
          location: string;
          price: number;
          currency?: string;
          beds?: number | null;
          baths?: number | null;
          area?: number | null;
          description?: string | null;
          tags?: string[] | null;
          images?: string[] | null;
          video_url?: string | null;
          available_from?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          seller_id?: string;
          title?: string;
          property_type?: string;
          location?: string;
          price?: number;
          currency?: string;
          beds?: number | null;
          baths?: number | null;
          area?: number | null;
          description?: string | null;
          tags?: string[] | null;
          images?: string[] | null;
          video_url?: string | null;
          available_from?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      favorites: {
        Row: {
          id: string;
          user_id: string;
          property_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          property_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          property_id?: string;
          created_at?: string;
        };
      };
    };
  };
};