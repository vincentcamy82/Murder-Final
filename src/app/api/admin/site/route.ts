import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/auth";
import { getSiteRecord, serializeSite, updateSiteRecord } from "@/lib/server/data";
import { ApiError, handler } from "@/lib/server/http";
import { deleteObject } from "@/lib/server/storage";

const EDITABLE_FIELDS = [
  "eyebrow",
  "title",
  "title_highlight",
  "story",
  "story_highlight",
  "countdown_label",
  "event_date",
  "code_label",
  "guests_label",
  "font_heading",
  "font_body",
  "background_source",
  "background_url",
  "biography_background_source",
  "biography_background_url",
] as const;

export const PUT = handler(async (request) => {
  await requireAdmin(request);
  const body = (await request.json()) as Record<string, unknown>;
  const updates: Record<string, unknown> = {};
  for (const field of EDITABLE_FIELDS) {
    if (body[field] !== null && body[field] !== undefined) updates[field] = body[field];
  }
  if (body.teasers !== undefined) {
    if (!Array.isArray(body.teasers) || body.teasers.length > 30) {
      throw new ApiError(400, "Ajoutez au maximum 30 teasers");
    }
    const ids = new Set<string>();
    updates.teasers = body.teasers.map((video: unknown) => {
      if (!video || typeof video !== "object") throw new ApiError(400, "Teaser invalide");
      const { id, title, url } = video as Record<string, unknown>;
      if (typeof id !== "string" || !id || id.length > 100 || ids.has(id)) throw new ApiError(400, "Identifiant de teaser invalide");
      if (typeof title !== "string" || !title.trim() || title.length > 200) throw new ApiError(400, "Titre du teaser requis (200 caractères maximum)");
      if (typeof url !== "string" || url.length > 2048) throw new ApiError(400, "Lien vidéo invalide");
      let parsed: URL;
      try { parsed = new URL(url); } catch { throw new ApiError(400, "Lien vidéo invalide"); }
      if (parsed.protocol !== "https:" || parsed.username || parsed.password) throw new ApiError(400, "Utilisez un lien vidéo HTTPS");
      ids.add(id);
      return { id, title: title.trim(), url: parsed.href };
    });
  }
  const previous = await getSiteRecord();
  const obsoletePaths: string[] = [];
  for (const prefix of ["background", "biography_background"] as const) {
    const source = updates[`${prefix}_source`];
    const url = updates[`${prefix}_url`];
    if (source !== undefined && source !== "url" && source !== "upload") throw new ApiError(400, "Source de fond invalide");
    if (url !== undefined && (typeof url !== "string" || (url !== "" && !URL.canParse(url)))) throw new ApiError(400, "URL de fond invalide");
    if (typeof url === "string" && url && !["https:", "http:"].includes(new URL(url).protocol)) throw new ApiError(400, "Utilisez une URL HTTP ou HTTPS pour le fond");
    if (source === "url") {
      const path = previous[`${prefix}_path`];
      if (path && !previous[`${prefix}_blob_url`]) obsoletePaths.push(path);
      updates[`${prefix}_path`] = null;
      updates[`${prefix}_blob_url`] = null;
    }
  }
  const site = await updateSiteRecord(updates);
  await Promise.all(obsoletePaths.map(deleteObject));
  return NextResponse.json(serializeSite(site));
});
