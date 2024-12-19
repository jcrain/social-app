import { User } from "@supabase/auth-helpers-nextjs";

export interface Profile {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string;
  banner_url?: string;
  updated_at: string;
}

export interface Comment {
  id: string;
  content: string;
  created_at: string;
  profiles: Profile;
}

export interface Post {
  id: string;
  content: string;
  created_at: string;
  profiles: Profile;
  comments: Comment[];
  likes: { user_id: string }[];
  isLiked?: boolean;
}

export interface Session {
  user: User;
}

export interface DatabasePost extends Omit<Post, 'isLiked'> {
  user_id: string;
} 