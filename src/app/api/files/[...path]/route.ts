import { NextResponse } from "next/server";
import { decodeToken } from "@/lib/server/auth";
import { findCharacterByStoragePath } from "@/lib/server/data";
import { ApiError, handler } from "@/lib/server/http";
import { readLocalObject } from "@/lib/server/storage";

export const GET = handler(
  async (request, { params }: { params: Promise<{ path: string[] }> }) => {
    const { path: segments } = await params;
    const storagePath = segments.map(decodeURIComponent).join("/");

    const owner = await findCharacterByStoragePath(storagePath);
    if (!owner) throw new ApiError(404, "Fichier introuvable");

    const token = request.nextUrl.searchParams.get("token");
    if (token) {
      const identity = await decodeToken(token);
      if (identity.role === "player" && identity.character_id !== owner.id) {
        throw new ApiError(403, "Accès refusé");
      }
    }

    const item = owner.media.find((m) => m.storage_path === storagePath)!;
    if (item.blob_url) return NextResponse.redirect(item.blob_url);
    const object = await readLocalObject(storagePath);
    if (!object) throw new ApiError(404, "Fichier introuvable");
    return new Response(object.data, {
      headers: { "Content-Type": item.content_type ?? object.contentType },
    });
  },
);
