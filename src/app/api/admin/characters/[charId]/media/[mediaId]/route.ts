import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/auth";
import { findCharacterById, removeMedia, serializeCharacter, setMediaVisibility } from "@/lib/server/data";
import { ApiError, handler } from "@/lib/server/http";
import { deleteObject } from "@/lib/server/storage";
import { parsePhotoVisibility } from "@/lib/server/visibility";

export const PATCH = handler(
  async (request, { params }: { params: Promise<{ charId: string; mediaId: string }> }) => {
    await requireAdmin(request);
    const { charId, mediaId } = await params;
    const body = (await request.json()) as { visibility?: unknown };
    const visibility = parsePhotoVisibility(body.visibility);
    const existing = await findCharacterById(charId);
    const item = existing?.media.find((media) => media.id === mediaId);
    if (!existing || !item) throw new ApiError(404, "Média introuvable");
    if (item.kind !== "photo") throw new ApiError(400, "Seules les photos ont une visibilité");
    const updated = await setMediaVisibility(charId, mediaId, visibility);
    if (!updated) throw new ApiError(404, "Média introuvable");
    return NextResponse.json(serializeCharacter(updated, true));
  },
);

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
