import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import type { MediaItem, MediaKind } from "@/types";
import { requireAdmin } from "@/lib/server/auth";
import { APP_NAME, addMedia, findCharacterById, serializeCharacter } from "@/lib/server/data";
import { ApiError, handler } from "@/lib/server/http";
import { MIME_TYPES, fileExtension, saveObject } from "@/lib/server/storage";
import { MAX_PHOTO_BYTES, PHOTO_TYPES } from "@/lib/photo";

export const POST = handler(
  async (request, { params }: { params: Promise<{ charId: string }> }) => {
    await requireAdmin(request);
    const { charId } = await params;
    const form = await request.formData();
    const kind = form.get("kind");
    const file = form.get("file");
    if (kind !== "photo" && kind !== "video") throw new ApiError(400, "Type de média invalide");
    if (!(file instanceof File)) throw new ApiError(400, "Fichier manquant");

    const existing = await findCharacterById(charId);
    if (!existing) throw new ApiError(404, "Personnage introuvable");

    const ext = fileExtension(file.name, "bin");
    const pathname = `${APP_NAME}/${charId}/${randomUUID()}.${ext}`;
    const contentType = file.type || MIME_TYPES[ext] || "application/octet-stream";
    if (kind === "photo") {
      if (!PHOTO_TYPES.includes(contentType)) throw new ApiError(400, "Choisissez une photo JPEG, PNG, WebP ou GIF");
      if (!file.size) throw new ApiError(400, "Le fichier est vide");
      if (file.size > MAX_PHOTO_BYTES) throw new ApiError(413, "La photo dépasse 4 Mo. Réduisez sa taille avant de réessayer.");
    }
    const stored = await saveObject(pathname, await file.arrayBuffer(), contentType);

    const item: MediaItem = {
      id: randomUUID(),
      kind: kind as MediaKind,
      source: "upload",
      storage_path: stored.path,
      blob_url: stored.blobUrl,
      filename: file.name,
      content_type: contentType,
    };
    const updated = await addMedia(charId, item);
    if (!updated) throw new ApiError(404, "Personnage introuvable");
    return NextResponse.json(serializeCharacter(updated, true));
  },
);
