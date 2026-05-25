export type Category = 'Lifestyle' | 'Fashion' | 'Affiliate' | 'Wellness' | 'GRWM' | 'Tutorial' | 'Other';
export type VaultType = 'Hook Idea' | 'Trend Observation' | 'Viral Reference' | 'Competitor Inspiration' | 'Brand Concept';
export type PostStatus = 'draft' | 'scheduled' | 'posted' | 'skipped';
export type Priority = 'low' | 'normal' | 'high';
export type Performance = 'viral' | 'good' | 'average' | 'low';

export interface Folder {
  id: string;
  user_id: string;
  name: string;
  parent_id: string | null;
  created_at: string;
}

export interface Clip {
  id: string;
  user_id: string;
  folder_id: string | null;
  clip_name: string;
  category: Category;
  emotional_tags: string[];
  aesthetic_tags: string[];
  platform: string;
  post_date: string | null;
  caption: string | null;
  hook: string | null;
  sound_used: string | null;
  hook_style: string | null;
  visual_style: string | null;
  pacing: string | null;
  lighting: string | null;
  emotional_tone: string | null;
  saves: number;
  shares: number;
  watch_time_pct: number;
  profile_visits: number;
  affiliate_clicks: number;
  comments: number;
  reposts: number;
  affiliate_notes: string | null;
  views: number;
  followers_gained: number;
  thumbnail_url: string | null;
  is_repost: boolean;
  original_clip_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface ScheduledPost {
  id: string;
  user_id: string;
  clip_id: string | null;
  title: string;
  category: Category;
  scheduled_for: string;
  platform: string;
  caption: string | null;
  hook: string | null;
  status: PostStatus;
  is_repost: boolean;
  notes: string | null;
  created_at: string;
}

export interface VaultItem {
  id: string;
  user_id: string;
  type: VaultType;
  content: string;
  tags: string[];
  category: string | null;
  priority: Priority;
  source_url: string | null;
  is_used: boolean;
  created_at: string;
}

export interface GenerationLog {
  id: string;
  user_id: string;
  clip_id: string | null;
  category: string | null;
  description: string | null;
  hooks: string[] | null;
  captions: string[] | null;
  ctas: string[] | null;
  selected_hook: string | null;
  selected_caption: string | null;
  created_at: string;
}

export interface GeneratedContent {
  hooks: string[];
  captions: string[];
  ctas: string[];
  emotional_angles: string[];
}
