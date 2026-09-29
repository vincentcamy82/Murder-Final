import { NextResponse } from "next/server";
import { getSiteRecord } from "@/lib/server/data";
import { ApiError, handler } from "@/lib/server/http";
import { readObject } from "@/lib/server/storage";
import { backgroundFields } from "@/lib/server/site-background";

export const GET = handler(async (request) => {
  const fields = backgroundFields(request);
  const site = await getSiteRecord();
  const path = site[fields.path];
  const blob = site[fields.blob];
  if (!path) throw new ApiError(404, "Aucune image de fond");
  if (blob) return NextResponse.redirect(blob);
  const object = await readObject(path);
  if (!object) throw new ApiError(404, "Aucune image de fond");
  return new Response(object.data, {
    headers: { "Content-Type": object.contentType, "Cache-Control": "public, max-age=60" },
  });
});
