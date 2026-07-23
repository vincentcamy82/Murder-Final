import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/auth";
import { listCharacters, serializeCharacter } from "@/lib/server/data";
import { handler } from "@/lib/server/http";

export const GET = handler(async (request) => {
  await requireAdmin(request);
  const characters = await listCharacters();
  return NextResponse.json(characters.map((c) => serializeCharacter(c, true)));
});
