export interface Memory {
  id: string; // UUID from supabase
  title?: string | null;
  cover_image_url: string;
  description: string;
  memory_date: string; // ISO Date String
  location?: string | null;
  mood?: string | null;
  created_at: string;
  updated_at: string;
  likes?: { count: number }[];
  comments?: { count: number }[];
}

export interface PostImage {
  id: string;
  post_id: string;
  image_url: string;
  sort_order: number;
  created_at: string;
}

export interface Like {
  id: string;
  post_id: string;
  session_identifier: string;
  created_at: string;
}

export interface Comment {
  id: string;
  post_id: string;
  username: string;
  content: string;
  created_at: string;
}
