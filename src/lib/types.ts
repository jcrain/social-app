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
  parent_id: string | null;
  user_id: string;
  post_id: string;
  profiles: Profile;
  likes: { user_id: string }[];
}

export interface Post {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  image_url?: string;
  profiles: Profile;
  comments: Comment[];
  likes: { user_id: string }[];
}

export interface Session {
  user: User;
}

export interface DatabasePost extends Omit<Post, 'isLiked'> {
  user_id: string;
}
  