import { randomInt, randomUUID } from "crypto";
import type { Collection } from "mongodb";
import type { Character, MediaItem, SiteContent } from "@/types";
import { getDb } from "./db";

export const APP_NAME = "murder1900";

export interface CharacterRecord {
  id: string;
  name: string;
  title: string;
  access_code: string;
  story: string;
  media: MediaItem[];
  order: number;
  created_at: string;
}

export interface SiteRecord extends Partial<Omit<SiteContent, "has_background_upload">> {
  background_path?: string | null;
  background_blob_url?: string | null;
}

const SEED_CHARACTERS: Array<[string, string]> = [
  ["Le Comte Dieubanes", "Maître de maison"],
  ["Vince", "Époux d'Emma"],
  ["Emma", "Épouse de Vince"],
  ["Romain", "Invité"],
  ["Amélie", "Invitée"],
  ["Mika", "Invité"],
  ["Dany", "Invité"],
  ["Kiki", "Invité"],
  ["Maeva", "Invitée"],
  ["Emilie", "Invitée"],
  ["Quentin", "Invité"],
  ["Marion", "Invitée"],
  ["Vincent", "Invité"],
  ["Oliv", "Invité"],
  ["Kass", "Invité"],
];

const SITE_DEFAULTS: Omit<SiteContent, "has_background_upload" | "updated_at"> = {
  eyebrow: "Anno Domini · MCMIII",
  title: "Qui a tué",
  title_highlight: "la Comtesse ?",
  story:
    "Le Comte Dieubanes invite tous ses amis les plus proches pour les obsèques de sa défunte épouse, la Comtesse Dieubanes, récemment retrouvée morte dans la chapelle du domaine.",
  story_highlight: "Qui l'a tuée ? Et pourquoi ?",
  countdown_label: "Le crime sera commis le 7 novembre 1900… dans",
  event_date: "2026-11-07T20:00:00",
  code_label: "Votre code personnel",
  guests_label: "Liste des convives",
  font_heading: "Cormorant Garamond",
  font_body: "Manrope",
  background_source: "url",
  background_url:
    "https://images.unsplash.com/photo-1481018085669-2bc6e4f00eed?auto=format&fit=crop&w=1920&q=80",
};

const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

export function genCode(n = 6): string {
  return Array.from({ length: n }, () => CODE_ALPHABET[randomInt(CODE_ALPHABET.length)]).join("");
}

async function charactersCollection(): Promise<Collection<CharacterRecord>> {
  return (await getDb()).collection<CharacterRecord>("characters");
}

async function settingsCollection() {
  return (await getDb()).collection("settings");
}

let seeded = false;

async function ensureSeed(): Promise<void> {
  if (seeded) return;
  const characters = await charactersCollection();
  if ((await characters.countDocuments()) === 0) {
    const docs: CharacterRecord[] = [];
    for (const [i, [name, title]] of SEED_CHARACTERS.entries()) {
      let code = genCode();
      while (docs.some((d) => d.access_code === code)) code = genCode();
      docs.push({
        id: randomUUID(),
        name,
        title,
        access_code: code,
        story: "",
        media: [],
        order: i,
        created_at: new Date().toISOString(),
      });
    }
    await characters.insertMany(docs);
  }
  seeded = true;
}

export async function listCharacters(): Promise<CharacterRecord[]> {
  await ensureSeed();
  return (await charactersCollection()).find().sort({ order: 1 }).toArray();
}

export async function findCharacterById(id: string): Promise<CharacterRecord | null> {
  return (await charactersCollection()).findOne({ id });
}

export async function findCharacterByCode(code: string): Promise<CharacterRecord | null> {
  await ensureSeed();
  return (await charactersCollection()).findOne({ access_code: code });
}

export async function findCharacterByStoragePath(storagePath: string): Promise<CharacterRecord | null> {
  return (await charactersCollection()).findOne({ "media.storage_path": storagePath });
}

export async function codeInUse(code: string, excludeId: string): Promise<boolean> {
  const clash = await (await charactersCollection()).findOne({ access_code: code, id: { $ne: excludeId } });
  return Boolean(clash);
}

export async function uniqueCodeInDb(): Promise<string> {
  const characters = await charactersCollection();
  let code = genCode();
  while (await characters.findOne({ access_code: code })) code = genCode();
  return code;
}

export async function updateCharacter(
  id: string,
  fields: Partial<CharacterRecord>,
): Promise<CharacterRecord | null> {
  return (await charactersCollection()).findOneAndUpdate(
    { id },
    { $set: fields },
    { returnDocument: "after" },
  );
}

export async function addMedia(id: string, item: MediaItem): Promise<CharacterRecord | null> {
  return (await charactersCollection()).findOneAndUpdate(
    { id },
    { $push: { media: item } },
    { returnDocument: "after" },
  );
}

export async function removeMedia(id: string, mediaId: string): Promise<CharacterRecord | null> {
  return (await charactersCollection()).findOneAndUpdate(
    { id },
    { $pull: { media: { id: mediaId } } },
    { returnDocument: "after" },
  );
}

export async function getSiteRecord(): Promise<SiteRecord> {
  const settings = await settingsCollection();
  return ((await settings.findOne({ key: "site" })) ?? {}) as SiteRecord;
}

export async function updateSiteRecord(fields: Record<string, unknown>): Promise<SiteRecord> {
  const settings = await settingsCollection();
  const doc = await settings.findOneAndUpdate(
    { key: "site" },
    { $set: { ...fields, updated_at: new Date().toISOString() } },
    { upsert: true, returnDocument: "after" },
  );
  return (doc ?? {}) as SiteRecord;
}

export function serializeSite(site: SiteRecord): SiteContent {
  const out = { ...SITE_DEFAULTS };
  for (const key of Object.keys(SITE_DEFAULTS) as Array<keyof typeof SITE_DEFAULTS>) {
    const value = site[key];
    if (value !== null && value !== undefined) {
      (out as Record<string, unknown>)[key] = value;
    }
  }
  return {
    ...out,
    has_background_upload: Boolean(site.background_path),
    updated_at: site.updated_at ?? "",
  };
}

export function serializeCharacter(record: CharacterRecord, includeCode = false): Character {
  const out: Character = {
    id: record.id,
    name: record.name,
    title: record.title ?? "",
    story: record.story ?? "",
    order: record.order ?? 0,
    media: (record.media ?? []).map(({ id, kind, source, url, storage_path, blob_url, filename, content_type }) => ({
      id,
      kind,
      source,
      url: url ?? null,
      storage_path: storage_path ?? null,
      blob_url: blob_url ?? null,
      filename: filename ?? null,
      content_type: content_type ?? null,
    })),
  };
  if (includeCode) out.access_code = record.access_code ?? "";
  return out;
}
