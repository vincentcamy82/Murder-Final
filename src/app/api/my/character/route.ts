import { NextResponse } from "next/server";
import { getIdentity } from "@/lib/server/auth";
import { findCharacterById, serializeCharacter } from "@/lib/server/data";
import { ApiError, handler } from "@/lib/server/http";

export const GET = handler(async (request) => {
  const identity = await getIdentity(request);
  if (identity.role !== "player") throw new ApiError(403, "Accès joueur requis");
  const character = await findCharacterById(identity.character_id ?? "");
  if (!character) throw new ApiError(404, "Personnage introuvable");
  return NextResponse.json(serializeCharacter(character));
});
