export const MAX_PHOTO_BYTES = 4_000_000;
export const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export async function preparePhoto(file: File): Promise<File> {
  if (file.size > 40_000_000) throw new Error("Cette photo dépasse 40 Mo. Choisissez une version plus légère.");
  let image: ImageBitmap;
  try {
    image = await createImageBitmap(file);
  } catch {
    throw new Error("Photo illisible. Choisissez une image JPEG, PNG, WebP ou GIF ; exportez les photos HEIC en JPEG.");
  }
  try {
    if (file.size <= MAX_PHOTO_BYTES && PHOTO_TYPES.includes(file.type)) return file;
    const canvas = document.createElement("canvas");
    const scale = Math.min(1, 2400 / Math.max(image.width, image.height));
    canvas.width = Math.max(1, Math.round(image.width * scale));
    canvas.height = Math.max(1, Math.round(image.height * scale));
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Impossible de préparer la photo dans ce navigateur.");
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    for (const quality of [0.85, 0.7, 0.5]) {
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
      if (blob && blob.size <= MAX_PHOTO_BYTES) {
        return new File([blob], `${file.name.replace(/\.[^.]+$/, "")}.jpg`, { type: "image/jpeg" });
      }
    }
    throw new Error("Cette photo reste trop volumineuse. Choisissez une version plus légère.");
  } finally {
    image.close();
  }
}
