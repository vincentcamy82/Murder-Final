import type { MediaKind, MediaVisibility } from "@/types";
import { ApiError } from "./http";

export function parsePhotoVisibility(value: unknown): MediaVisibility {
  if (value !== "public" && value !== "private") throw new ApiError(400, "Visibilité invalide : choisissez publique ou privée");
  return value;
}

export function visibilityForKind(kind: MediaKind, value: unknown): MediaVisibility | undefined {
  return kind === "photo" ? parsePhotoVisibility(value) : undefined;
}
