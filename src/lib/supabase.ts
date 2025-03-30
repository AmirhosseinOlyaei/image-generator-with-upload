import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create a single supabase client for the entire app
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Type for user profile
export type UserProfile = {
  id: string;
  email: string;
  display_name?: string;
  avatar_url?: string;
  free_generations_used: number;
  subscription_tier: 'free' | 'basic' | 'premium' | 'ultimate';
  provider_keys?: {
    openai?: string;
    stability?: string;
    midjourney?: string;
    leonardo?: string;
  };
};
