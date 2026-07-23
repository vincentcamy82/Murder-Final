import { NextResponse } from "next/server";
import type { MediaItem } from "@/types";
import { listCharacters } from "@/lib/server/data";
import { handler } from "@/lib/server/http";
import { localObjectExists } from "@/lib/server/storage";

async function pickPortrait(media: MediaItem[]): Promise<MediaItem | null> {
  for (const item of media.filter((m) => m.kind === "photo")) {
    if (item.source === "upload" && item.storage_path) {
      if (item.blob_url || (await localObjectExists(item.storage_path))) return item;
    } else if (item.source === "link" && item.url) {
      return item;
    }
  }
  return null;
}

export const GET = handler(async () => {
  const characters = await listCharacters();
  const out = await Promise.all(
    characters.map(async (character) => {
      const portrait = await pickPortrait(character.media ?? []);
      return {
        id: character.id,
        name: character.name,
        title: character.title ?? "",
        portrait_storage_path: portrait?.storage_path ?? null,
        portrait_url: portrait?.url ?? null,
        portrait_source: portrait?.source ?? null,
      };
    }),
  );
  return NextResponse.json(out);
});
