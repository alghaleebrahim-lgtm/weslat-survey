import "server-only";

import { hasDatabase, listActiveHeroImages } from "@/lib/db";
import { SEED_HERO_IMAGES_DATA } from "@/lib/seed-hero-images-data";

/**
 * Persistent hero-image record shape, shared with the database layer
 * (lib/db.ts) and the admin CMS.
 */
export type HeroImageRecord = {
  id: string;
  src: string;
  /** Storage provider key, needed to delete the underlying file. */
  storageKey: string;
  alt: string | null;
  title: string | null;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

/** Local-dev fallback only, used when no database is configured — see getActiveHeroImages below. */
const SEED_HERO_IMAGES: HeroImageRecord[] = SEED_HERO_IMAGES_DATA.map((seed, index) => ({
  id: `seed-${seed.slug}`,
  src: seed.src,
  storageKey: `external/${seed.slug}`,
  alt: seed.alt,
  title: seed.title,
  description: seed.description,
  sortOrder: index,
  isActive: true,
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-01-01"),
}));

/**
 * Returns active hero images ordered for display. Reads from the real
 * database when one is configured; falls back to the static seed only
 * for local development without POSTGRES_URL/DATABASE_URL set.
 */
export async function getActiveHeroImages(): Promise<HeroImageRecord[]> {
  if (hasDatabase) {
    return listActiveHeroImages();
  }

  return [...SEED_HERO_IMAGES]
    .filter((image) => image.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}
