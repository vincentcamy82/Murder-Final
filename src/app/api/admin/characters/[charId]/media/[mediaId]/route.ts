import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/auth";
import { findCharacterById, removeMedia, serializeCharacter } from "@/lib/server/data";
import { ApiError, handler } from "@/lib/server/http";
import { deleteObject } from "@/lib/server/storage";

export const DELETE = handler(
  async (request, { params }: { params: Promise<{ charId: string; mediaId: string }> }) => {
    await requireAdmin(request);
    const { charId, mediaId } = await params;
    const existing = await findCharacterById(charId);
    if (!existing) throw new ApiError(404, "Personnage introuvable");
    const item = existing.media.find((media) => media.id === mediaId);
    const updated = await removeMedia(charId, mediaId);
    if (!updated) throw new ApiError(404, "Personnage introuvable");
    if (item?.storage_path && !item.blob_url) await deleteObject(item.storage_path);
    return NextResponse.json(serializeCharacter(updated, true));
  },
);
