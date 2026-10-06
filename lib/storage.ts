import "server-only";
import { put, del } from "@vercel/blob";
import sharp from "sharp";
import { randomUUID } from "node:crypto";

const MAX_UPLOAD_BYTES = 8 * 1024 * 1024; // 8MB
const MAX_DIMENSION = 2000;

/** Magic-byte signatures, checked independently of the client-supplied MIME type / filename. */
const SIGNATURES: { mime: string; check: (buf: Buffer) => boolean }[] = [
  {
    mime: "image/jpeg",
    check: (b) => b.length > 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  },
  {
    mime: "image/png",
    check: (b) =>
      b.length > 8 &&
      b[0] === 0x89 &&
      b[1] === 0x50 &&
      b[2] === 0x4e &&
      b[3] === 0x47,
  },
  {
    mime: "image/webp",
    check: (b) =>
      b.length > 12 &&
      b.toString("ascii", 0, 4) === "RIFF" &&
      b.toString("ascii", 8, 12) === "WEBP",
  },
];

export class UploadValidationError extends Error {}

function detectRealMime(buf: Buffer): string | null {
  return SIGNATURES.find((s) => s.check(buf))?.mime ?? null;
}

export type ProcessedUpload = {
  src: string;
  storageKey: string;
};

/**
 * Validates, re-encodes (resize + WebP) and persists an uploaded image to
 * Vercel Blob. Never trusts the client-supplied filename or MIME type.
 */
export async function processAndStoreHeroImage(file: File): Promise<ProcessedUpload> {
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new UploadValidationError("File is larger than the 8MB limit.");
  }

  const inputBuffer = Buffer.from(await file.arrayBuffer());
  const realMime = detectRealMime(inputBuffer);
  if (!realMime) {
    throw new UploadValidationError(
      "File isn't a recognized JPG, PNG or WebP image (checked by content, not extension)."
    );
  }

  let webp: Buffer;
  try {
    webp = await sharp(inputBuffer)
      .rotate() // respect EXIF orientation before stripping it
      .resize({
        width: MAX_DIMENSION,
        height: MAX_DIMENSION,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 82 })
      .toBuffer();
  } catch {
    throw new UploadValidationError("The image file is corrupt or unsupported.");
  }

  const storageKey = `hero/${randomUUID()}.webp`;
  const blob = await put(storageKey, webp, {
    access: "public",
    contentType: "image/webp",
    addRandomSuffix: false,
  });

  return { src: blob.url, storageKey };
}

/**
 * Deletes the underlying Blob object. Seed rows point at hotlinked
 * Unsplash URLs (storageKey prefixed "external/") rather than a real
 * Blob object, so those are skipped instead of erroring.
 */
export async function deleteStoredHeroImage(storageKey: string): Promise<void> {
  if (storageKey.startsWith("external/")) return;
  await del(storageKey);
}
