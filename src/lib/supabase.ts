import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Create a single supabase client for the entire app
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Type for user profile
export type UserProfile = {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  plan: 'free' | 'basic' | 'premium' | 'ultimate'
  credits: number
  last_renewal?: string
  next_renewal?: string
  provider_keys?: {
    openai?: string
    stability?: string
    midjourney?: string
    leonardo?: string
  }
}
