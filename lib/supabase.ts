import { createClient } from '@supabase/supabase-js';

// Temporary: Direct API keys for testing (move to environment variables later)
const supabaseUrl = 'https://qopnwgmmvfdopdtxiqbb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvcG53Z21tdmZkb3BkdHhpcWJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1MzQxNjcsImV4cCI6MjA3MzExMDE2N30.a33jCyJEFyBg61tAU7rmbo0j7E5uOPZYYOakbI0vsZ4';

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
