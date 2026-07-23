export type MediaKind = "photo" | "video";
export type MediaSource = "link" | "upload";

export interface MediaItem {
  id: string;
  kind: MediaKind;
  source: MediaSource;
  url?: string | null;
  storage_path?: string | null;
  blob_url?: string | null;
  filename?: string | null;
  content_type?: string | null;
}

export interface Character {
  id: string;
  name: string;
  title: string;
  story: string;
  order: number;
  media: MediaItem[];
  access_code?: string;
}

export interface PublicCharacter {
  id: string;
  name: string;
  title: string;
  portrait_storage_path: string | null;
  portrait_url: string | null;
  portrait_source: MediaSource | null;
}

export interface SiteContent {
  eyebrow: string;
  title: string;
  title_highlight: string;
  story: string;
  story_highlight: string;
  countdown_label: string;
  event_date: string;
  code_label: string;
  guests_label: string;
  font_heading: string;
  font_body: string;
  background_source: "url" | "upload";
  background_url: string;
  has_background_upload: boolean;
  updated_at: string;
}

export type Role = "admin" | "player";
