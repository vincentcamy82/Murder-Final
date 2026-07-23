import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/auth";
import { serializeSite, updateSiteRecord } from "@/lib/server/data";
import { handler } from "@/lib/server/http";

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
] as const;

export const PUT = handler(async (request) => {
  await requireAdmin(request);
  const body = (await request.json()) as Record<string, unknown>;
  const updates: Record<string, unknown> = {};
  for (const field of EDITABLE_FIELDS) {
    if (body[field] !== null && body[field] !== undefined) updates[field] = body[field];
  }
  const site = await updateSiteRecord(updates);
  return NextResponse.json(serializeSite(site));
});
