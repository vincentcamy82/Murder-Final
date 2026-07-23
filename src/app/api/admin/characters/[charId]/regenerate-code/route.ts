import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/auth";
import { serializeCharacter, uniqueCodeInDb, updateCharacter } from "@/lib/server/data";
import { ApiError, handler } from "@/lib/server/http";

export const POST = handler(
  async (request, { params }: { params: Promise<{ charId: string }> }) => {
    await requireAdmin(request);
    const { charId } = await params;
    const updated = await updateCharacter(charId, { access_code: await uniqueCodeInDb() });
    if (!updated) throw new ApiError(404, "Personnage introuvable");
    return NextResponse.json(serializeCharacter(updated, true));
  },
);
