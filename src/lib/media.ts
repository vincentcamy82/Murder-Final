import type { MediaItem, MediaVisibility } from "@/types";

const YOUTUBE_PATTERNS = [
  /(?:youtube\.com\/watch\?v=)([\w-]+)/,
  /(?:youtu\.be\/)([\w-]+)/,
  /(?:youtube\.com\/embed\/)([\w-]+)/,
  /(?:youtube\.com\/shorts\/)([\w-]+)/,
];

const VIMEO_PATTERN = /vimeo\.com\/(\d+)/;

export function youtubeEmbed(url: string | null | undefined): string | null {
  if (!url) return null;
  for (const p of YOUTUBE_PATTERNS) {
    const m = url.match(p);
    if (m) return `https://www.youtube.com/embed/${m[1]}`;
  }
  return null;
}

export function vimeoEmbed(url: string | null | undefined): string | null {
  const m = url && url.match(VIMEO_PATTERN);
  return m ? `https://player.vimeo.com/video/${m[1]}` : null;
}

// Avant le choix de visibilité, la première photo servait de portrait public : elle le reste tant qu'elle n'a pas été classée et qu'aucune photo n'est publique.
function legacyPortrait(media: MediaItem[]): MediaItem | undefined {
  const photos = media.filter((m) => m.kind === "photo");
  if (photos.some((m) => m.visibility === "public")) return undefined;
  return photos[0]?.visibility == null ? photos[0] : undefined;
}

export function photoVisibility(item: MediaItem, media: MediaItem[]): MediaVisibility {
  if (item.visibility) return item.visibility;
  return item.id === legacyPortrait(media)?.id ? "public" : "private";
}

export function publicPhotos(media: MediaItem[]): MediaItem[] {
  return media.filter((m) => m.kind === "photo" && photoVisibility(m, media) === "public");
}

export function privatePhotos(media: MediaItem[]): MediaItem[] {
  return media.filter((m) => m.kind === "photo" && photoVisibility(m, media) === "private");
}
