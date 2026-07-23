import { NextResponse } from "next/server";
import { listCharacters } from "@/lib/server/data";
import { handler } from "@/lib/server/http";
import { pickPortrait } from "@/lib/server/portrait";

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
