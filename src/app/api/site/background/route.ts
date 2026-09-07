import { NextResponse } from "next/server";
import { getSiteRecord } from "@/lib/server/data";
import { ApiError, handler } from "@/lib/server/http";
import { readObject } from "@/lib/server/storage";

export const GET = handler(async () => {
  const site = await getSiteRecord();
  if (!site.background_path) throw new ApiError(404, "Aucune image de fond");
  if (site.background_blob_url) return NextResponse.redirect(site.background_blob_url);
  const object = await readObject(site.background_path);
  if (!object) throw new ApiError(404, "Aucune image de fond");
  return new Response(object.data, {
    headers: { "Content-Type": object.contentType, "Cache-Control": "public, max-age=60" },
  });
});
