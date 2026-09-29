import { NextResponse } from "next/server";
import { findCharacterById } from "@/lib/server/data";
import { ApiError, handler } from "@/lib/server/http";
import { pickPortrait } from "@/lib/server/portrait";
import type { PublicBiography } from "@/types";

export const GET = handler(async (_request, { params }: { params: Promise<{ charId: string }> }) => {
  const { charId } = await params;
  const character = await findCharacterById(charId);
  if (!character) throw new ApiError(404, "Personnage introuvable");
  const portrait = await pickPortrait(character.media ?? []);
  const biography: PublicBiography = {
    id: character.id,
    name: character.name,
    title: character.title ?? "",
    public_story: character.public_story ?? "",
    portrait_storage_path: portrait?.storage_path ?? null,
    portrait_url: portrait?.url ?? null,
    portrait_source: portrait?.source ?? null,
  };
  return NextResponse.json(biography);
});
