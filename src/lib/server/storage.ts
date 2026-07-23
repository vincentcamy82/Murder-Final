import { promises as fs } from "fs";
import path from "path";
import { put } from "@vercel/blob";

const LOCAL_ROOT = path.join(process.cwd(), ".data", "storage");

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
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(pathname, data, {
      access: "public",
      contentType,
      addRandomSuffix: false,
    });
    return { path: pathname, blobUrl: blob.url };
  }
  const target = path.join(LOCAL_ROOT, pathname);
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, Buffer.from(data));
  return { path: pathname, blobUrl: null };
}

export async function readLocalObject(
  pathname: string,
): Promise<{ data: ArrayBuffer; contentType: string } | null> {
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

export async function localObjectExists(pathname: string): Promise<boolean> {
  try {
    await fs.access(path.join(LOCAL_ROOT, pathname));
    return true;
  } catch {
    return false;
  }
}
