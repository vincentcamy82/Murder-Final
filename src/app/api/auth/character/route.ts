import { NextResponse } from "next/server";
import { createToken } from "@/lib/server/auth";
import { findCharacterByCode, serializeCharacter } from "@/lib/server/data";
import { ApiError, handler } from "@/lib/server/http";

export const POST = handler(async (request) => {
  const body = (await request.json()) as { code?: string };
  const code = String(body.code ?? "").trim().toUpperCase();
  const character = await findCharacterByCode(code);
  if (!character) throw new ApiError(401, "Code invalide");
  const token = await createToken({ role: "player", character_id: character.id });
  return NextResponse.json({ token, role: "player", character: serializeCharacter(character) });
});
