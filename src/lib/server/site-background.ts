import type { NextRequest } from "next/server";
import { ApiError } from "./http";

export function backgroundFields(request: NextRequest) {
  const target = request.nextUrl.searchParams.get("target") ?? "home";
  if (target === "home") {
    return { source: "background_source", path: "background_path", blob: "background_blob_url" } as const;
  }
  if (target === "biography") {
    return { source: "biography_background_source", path: "biography_background_path", blob: "biography_background_blob_url" } as const;
  }
  throw new ApiError(400, "Fond inconnu");
}
