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
