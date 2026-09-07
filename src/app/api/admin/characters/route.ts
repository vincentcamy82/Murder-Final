import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/auth";
import { createGuest, listCharacters, serializeCharacter } from "@/lib/server/data";
import { ApiError, handler } from "@/lib/server/http";

export const GET = handler(async (request) => {
  await requireAdmin(request);
  const characters = await listCharacters();
  return NextResponse.json(characters.map((c) => serializeCharacter(c, true)));
});

export const POST = handler(async (request) => {
  await requireAdmin(request);
  const body = await request.json();
  if (typeof body?.name !== "string" || !body.name.trim()) {
    throw new ApiError(400, "Le nom de l’invité est obligatoire");
  }
  const guest = await createGuest(body.name.trim());
  return NextResponse.json(serializeCharacter(guest, true), { status: 201 });
});
