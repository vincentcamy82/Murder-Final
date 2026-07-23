import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/auth";
import { removeMedia, serializeCharacter } from "@/lib/server/data";
import { ApiError, handler } from "@/lib/server/http";

export const DELETE = handler(
  async (request, { params }: { params: Promise<{ charId: string; mediaId: string }> }) => {
    await requireAdmin(request);
    const { charId, mediaId } = await params;
    const updated = await removeMedia(charId, mediaId);
    if (!updated) throw new ApiError(404, "Personnage introuvable");
    return NextResponse.json(serializeCharacter(updated, true));
  },
);
