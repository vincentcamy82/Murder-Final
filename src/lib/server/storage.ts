import { promises as fs } from "fs";
import path from "path";
import { Binary, MongoServerError } from "mongodb";
import { getDb } from "./db";
import { ApiError } from "./http";

const LOCAL_ROOT = path.join(process.cwd(), ".data", "storage");
const MAX_MEDIA_BYTES = 4_000_000;

interface MediaFile {
  _id: string;
  data: Binary;
  contentType: string;
}

async function mediaFiles() {
  return (await getDb()).collection<MediaFile>("media_files");
}

export const MIME_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  webp: "image/webp",
  mp4: "video/mp4",
  mov: "video/quicktime",
  webm: "video/webm",
  avi: "video/x-msvideo",
  mkv: "video/x-matroska",
};

export function fileExtension(filename: string, fallback: string): string {
  return filename.includes(".") ? filename.split(".").pop()!.toLowerCase() : fallback;
}

export interface StoredObject {
  path: string;
  blobUrl: string | null;
}

export async function saveObject(
  pathname: string,
  data: ArrayBuffer,
  contentType: string,
): Promise<StoredObject> {
  if (!data.byteLength) throw new ApiError(400, "Le fichier est vide");
  if (data.byteLength > MAX_MEDIA_BYTES) {
    throw new ApiError(413, "Le fichier dépasse 4 Mo. Pour une vidéo, utilisez un lien YouTube ou Vimeo.");
  }
  try {
    await (await mediaFiles()).replaceOne(
      { _id: pathname },
      { data: new Binary(new Uint8Array(data)), contentType },
      { upsert: true },
    );
  } catch (error) {
    if (error instanceof MongoServerError && /space quota|storage limit/i.test(error.message)) {
      throw new ApiError(507, "Le stockage gratuit est plein. Supprimez des images inutilisées avant de réessayer.");
    }
    throw error;
  }
  return { path: pathname, blobUrl: null };
}

export async function readObject(
  pathname: string,
): Promise<{ data: ArrayBuffer; contentType: string } | null> {
  const stored = await (await mediaFiles()).findOne({ _id: pathname });
  if (stored) {
    return {
      data: new Uint8Array(stored.data.value()).buffer,
      contentType: stored.contentType,
    };
  }
  try {
    const bytes = await fs.readFile(path.join(LOCAL_ROOT, pathname));
    const ext = path.extname(pathname).slice(1).toLowerCase();
    return {
      data: new Uint8Array(bytes).buffer as ArrayBuffer,
      contentType: MIME_TYPES[ext] ?? "application/octet-stream",
    };
  } catch {
    return null;
  }
}

export async function objectExists(pathname: string): Promise<boolean> {
  const stored = await (await mediaFiles()).findOne({ _id: pathname }, { projection: { _id: 1 } });
  if (stored) return true;
  try {
    await fs.access(path.join(LOCAL_ROOT, pathname));
    return true;
  } catch {
    return false;
  }
}

export async function deleteObject(pathname: string): Promise<void> {
  await (await mediaFiles()).deleteOne({ _id: pathname });
}
