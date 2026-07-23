import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import type { MediaItem, MediaKind } from "@/types";
import { requireAdmin } from "@/lib/server/auth";
import { addMedia, serializeCharacter } from "@/lib/server/data";
import { ApiError, handler } from "@/lib/server/http";

export const POST = handler(
  async (request, { params }: { params: Promise<{ charId: string }> }) => {
    await requireAdmin(request);
    const { charId } = await params;
    const body = (await request.json()) as { kind?: string; url?: string };
    if (body.kind !== "photo" && body.kind !== "video") {
      throw new ApiError(400, "Type de média invalide");
    }
    const item: MediaItem = {
      id: randomUUID(),
      kind: body.kind as MediaKind,
      source: "link",
      url: body.url ?? "",
    };
    const updated = await addMedia(charId, item);
    if (!updated) throw new ApiError(404, "Personnage introuvable");
    return NextResponse.json(serializeCharacter(updated, true));
  },
);
