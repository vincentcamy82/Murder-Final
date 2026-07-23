import type { SiteContent } from "@/types";

export const HEADING_FONTS = [
  "Cormorant Garamond",
  "Playfair Display",
  "Cinzel",
  "EB Garamond",
  "Cardo",
];

export const BODY_FONTS = ["Manrope", "Lora", "EB Garamond", "IBM Plex Mono"];

export const DEFAULT_SITE: SiteContent = {
  eyebrow: "Créated by Alexis & Vince",
  title: "Qui a tué",
  title_highlight: "la Comtesse ?",
  story:
    "Le Comte Dieubanes invite tous ses amis les plus proches pour les obsèques de sa défunte épouse, la Comtesse Dieubanes, récemment retrouvée morte dans la chapelle du domaine.",
  story_highlight: "Qui l'a tuée ? Et pourquoi ?",
  countdown_label: "Les festivitées commence dans",
  event_date: "2026-11-07T20:00:00",
  code_label: "Votre code personnel",
  guests_label: "Liste des convives",
  font_heading: "Cormorant Garamond",
  font_body: "Manrope",
  background_source: "url",
  background_url:
    "https://images.unsplash.com/photo-1481018085669-2bc6e4f00eed?auto=format&fit=crop&w=1920&q=80",
  has_background_upload: false,
  updated_at: "",
};

export function backgroundUrl(site: SiteContent, apiBase: string): string {
  if (site.background_source === "upload" && site.has_background_upload) {
    return `${apiBase}/site/background?v=${encodeURIComponent(site.updated_at || "")}`;
  }
  return site.background_url || DEFAULT_SITE.background_url;
}
