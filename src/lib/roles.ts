import type { CharacterRole } from "@/types";

export const CHARACTER_ROLE_LABELS: Record<CharacterRole, string> = {
  coupable: "Coupable",
  innocent: "Innocent",
  complice: "Complice",
};

export const CHARACTER_ROLES = Object.keys(CHARACTER_ROLE_LABELS) as CharacterRole[];

export function isCharacterRole(value: unknown): value is CharacterRole {
  return typeof value === "string" && value in CHARACTER_ROLE_LABELS;
}
