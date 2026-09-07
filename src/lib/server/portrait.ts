import type { MediaItem } from "@/types";
import { objectExists } from "./storage";

export async function pickPortrait(media: MediaItem[]): Promise<MediaItem | null> {
  for (const item of media.filter((m) => m.kind === "photo")) {
    if (item.source === "upload" && item.storage_path) {
      if (item.blob_url || (await objectExists(item.storage_path))) return item;
    } else if (item.source === "link" && item.url) {
      return item;
    }
  }
  return null;
}
