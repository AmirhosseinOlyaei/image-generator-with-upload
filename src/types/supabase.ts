export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          user_id: string
          credits: number
          plan: string
          custom_api_keys: {
            openai?: string
            stability?: string
            midjourney?: string
            leonardo?: string
          } | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id: string
          credits?: number
          plan?: string
          custom_api_keys?: {
            openai?: string
            stability?: string
            midjourney?: string
            leonardo?: string
          } | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id?: string
          credits?: number
          plan?: string
          custom_api_keys?: {
            openai?: string
            stability?: string
            midjourney?: string
            leonardo?: string
          } | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
  }
}
