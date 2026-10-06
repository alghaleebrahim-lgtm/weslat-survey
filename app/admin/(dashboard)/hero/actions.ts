"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth";
import {
  createHeroImage,
  deleteHeroImage,
  listHeroImages,
  reorderHeroImages,
  updateHeroImage,
  type HeroImageRow,
} from "@/lib/db";
import {
  deleteStoredHeroImage,
  processAndStoreHeroImage,
  UploadValidationError,
} from "@/lib/storage";
import { SEED_HERO_IMAGES_DATA } from "@/lib/seed-hero-images-data";

export type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string };

function revalidateHero() {
  revalidatePath("/");
  revalidatePath("/admin/hero");
}

export async function fetchHeroImages(): Promise<ActionResult<HeroImageRow[]>> {
  try {
    await requireAdmin();
    const rows = await listHeroImages();
    return { ok: true, data: rows };
  } catch (error) {
    return { ok: false, error: toMessage(error) };
  }
}

export async function uploadHeroImageAction(
  formData: FormData
): Promise<ActionResult<HeroImageRow>> {
  try {
    await requireAdmin();

    const file = formData.get("file");
    if (!(file instanceof File) || file.size === 0) {
      return { ok: false, error: "Choose an image file to upload." };
    }

    const { src, storageKey } = await processAndStoreHeroImage(file);

    const row = await createHeroImage({
      src,
      storageKey,
      title: emptyToNull(formData.get("title")),
      description: emptyToNull(formData.get("description")),
      alt: emptyToNull(formData.get("alt")),
      isActive: formData.get("isActive") === "true",
    });

    revalidateHero();
    return { ok: true, data: row };
  } catch (error) {
    return { ok: false, error: toMessage(error) };
  }
}

export async function updateHeroImageAction(
  id: string,
  formData: FormData
): Promise<ActionResult<HeroImageRow>> {
  try {
    await requireAdmin();

    const file = formData.get("file");
    const replacement =
      file instanceof File && file.size > 0
        ? await processAndStoreHeroImage(file)
        : null;

    const existing = (await listHeroImages()).find((image) => image.id === id);
    if (!existing) {
      return { ok: false, error: "This image no longer exists." };
    }

    const row = await updateHeroImage(id, {
      src: replacement?.src,
      storageKey: replacement?.storageKey,
      title: emptyToNull(formData.get("title")),
      description: emptyToNull(formData.get("description")),
      alt: emptyToNull(formData.get("alt")),
      isActive: formData.get("isActive") === "true",
    });

    if (!row) {
      return { ok: false, error: "This image no longer exists." };
    }

    if (replacement) {
      await deleteStoredHeroImage(existing.storageKey);
    }

    revalidateHero();
    return { ok: true, data: row };
  } catch (error) {
    return { ok: false, error: toMessage(error) };
  }
}

export async function setHeroImageActiveAction(
  id: string,
  isActive: boolean
): Promise<ActionResult<HeroImageRow>> {
  try {
    await requireAdmin();
    const existing = (await listHeroImages()).find((image) => image.id === id);
    if (!existing) {
      return { ok: false, error: "This image no longer exists." };
    }
    const row = await updateHeroImage(id, {
      title: existing.title,
      description: existing.description,
      alt: existing.alt,
      isActive,
    });
    if (!row) {
      return { ok: false, error: "This image no longer exists." };
    }
    revalidateHero();
    return { ok: true, data: row };
  } catch (error) {
    return { ok: false, error: toMessage(error) };
  }
}

export async function deleteHeroImageAction(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    const row = await deleteHeroImage(id);
    if (row) {
      await deleteStoredHeroImage(row.storageKey);
    }
    revalidateHero();
    return { ok: true, data: undefined };
  } catch (error) {
    return { ok: false, error: toMessage(error) };
  }
}

export async function reorderHeroImagesAction(
  orderedIds: string[]
): Promise<ActionResult> {
  try {
    await requireAdmin();
    await reorderHeroImages(orderedIds);
    revalidateHero();
    return { ok: true, data: undefined };
  } catch (error) {
    return { ok: false, error: toMessage(error) };
  }
}

/** Inserts the 12 curated documentary/humanitarian images as a starting point. Safe to call only when the table is empty — callers gate on that in the UI. */
export async function seedStarterHeroImagesAction(): Promise<ActionResult<HeroImageRow[]>> {
  try {
    await requireAdmin();
    const created: HeroImageRow[] = [];
    for (const seed of SEED_HERO_IMAGES_DATA) {
      const row = await createHeroImage({
        src: seed.src,
        storageKey: `external/${seed.slug}`,
        title: seed.title,
        description: seed.description,
        alt: seed.alt,
        isActive: true,
      });
      created.push(row);
    }
    revalidateHero();
    return { ok: true, data: created };
  } catch (error) {
    return { ok: false, error: toMessage(error) };
  }
}

function emptyToNull(value: FormDataEntryValue | null): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function toMessage(error: unknown): string {
  if (error instanceof UploadValidationError) return error.message;
  if (error instanceof Error) {
    if (error.message === "Not authenticated.") return "Your session expired — sign in again.";
    return error.message;
  }
  return "Something went wrong.";
}
