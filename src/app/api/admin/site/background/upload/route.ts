import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/auth";
import { APP_NAME, serializeSite, updateSiteRecord } from "@/lib/server/data";
import { ApiError, handler } from "@/lib/server/http";
import { MIME_TYPES, fileExtension, saveObject } from "@/lib/server/storage";

export const POST = handler(async (request) => {
  await requireAdmin(request);
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) throw new ApiError(400, "Fichier manquant");
  const ext = fileExtension(file.name, "jpg");
  const pathname = `${APP_NAME}/site/background-${randomUUID()}.${ext}`;
  const contentType = file.type || MIME_TYPES[ext] || "image/jpeg";
  const stored = await saveObject(pathname, await file.arrayBuffer(), contentType);
  const site = await updateSiteRecord({
    background_source: "upload",
    background_path: stored.path,
    background_blob_url: stored.blobUrl,
  });
  return NextResponse.json(serializeSite(site));
});
