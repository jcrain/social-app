import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      posts: {
        Row: {
          id: string
          content: string
          created_at: string
          user_id: string
          likes: number
        }
        Insert: {
          content: string
          user_id: string
          likes?: number
        }
      }
      profiles: {
        Row: {
          id: string
          username: string
          full_name: string
          avatar_url: string
          banner_url: string
          updated_at: string
        }
        Insert: {
          username: string
          full_name: string
          avatar_url?: string
          banner_url?: string
        }
      }
      comments: {
        Row: {
          id: string
          content: string
          post_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          content: string
          post_id: string
          user_id: string
        }
      }
      likes: {
        Row: {
          id: string;
          user_id: string;
          post_id: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          post_id: string;
        };
      };
    }
  }
} 