import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/auth";
import {
  codeInUse,
  findCharacterById,
  serializeCharacter,
  updateCharacter,
  type CharacterRecord,
} from "@/lib/server/data";
import { ApiError, handler } from "@/lib/server/http";

export const PUT = handler(
  async (request, { params }: { params: Promise<{ charId: string }> }) => {
    await requireAdmin(request);
    const { charId } = await params;
    const body = (await request.json()) as {
      name?: string | null;
      title?: string | null;
      access_code?: string | null;
      story?: string | null;
    };
    const existing = await findCharacterById(charId);
    if (!existing) throw new ApiError(404, "Personnage introuvable");

    const fields: Partial<CharacterRecord> = {};
    if (body.access_code !== null && body.access_code !== undefined) {
      const code = body.access_code.trim().toUpperCase();
      if (await codeInUse(code, charId)) {
        throw new ApiError(400, "Ce code est déjà utilisé par un autre personnage");
      }
      fields.access_code = code;
    }
    if (body.name !== null && body.name !== undefined) fields.name = body.name;
    if (body.title !== null && body.title !== undefined) fields.title = body.title;
    if (body.story !== null && body.story !== undefined) fields.story = body.story;

    const updated = Object.keys(fields).length ? await updateCharacter(charId, fields) : existing;
    if (!updated) throw new ApiError(404, "Personnage introuvable");
    return NextResponse.json(serializeCharacter(updated, true));
  },
);
