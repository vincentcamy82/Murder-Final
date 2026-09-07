import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/auth";
import { APP_NAME, getSiteRecord, serializeSite, updateSiteRecord } from "@/lib/server/data";
import { ApiError, handler } from "@/lib/server/http";
import { MIME_TYPES, deleteObject, fileExtension, saveObject } from "@/lib/server/storage";
import { MAX_PHOTO_BYTES, PHOTO_TYPES } from "@/lib/photo";

export const POST = handler(async (request) => {
  await requireAdmin(request);
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) throw new ApiError(400, "Fichier manquant");
  const ext = fileExtension(file.name, "jpg");
  const pathname = `${APP_NAME}/site/background-${randomUUID()}.${ext}`;
  const contentType = file.type || MIME_TYPES[ext] || "image/jpeg";
  if (!PHOTO_TYPES.includes(contentType)) throw new ApiError(400, "Choisissez une photo JPEG, PNG, WebP ou GIF");
  if (!file.size) throw new ApiError(400, "Le fichier est vide");
  if (file.size > MAX_PHOTO_BYTES) throw new ApiError(413, "La photo dépasse 1 Mo. Réduisez sa taille avant de réessayer.");
  const previous = await getSiteRecord();
  const stored = await saveObject(pathname, await file.arrayBuffer(), contentType);
  const site = await updateSiteRecord({
    background_source: "upload",
    background_path: stored.path,
    background_blob_url: stored.blobUrl,
  });
  if (previous.background_path && !previous.background_blob_url) {
    await deleteObject(previous.background_path);
  }
  return NextResponse.json(serializeSite(site));
});
