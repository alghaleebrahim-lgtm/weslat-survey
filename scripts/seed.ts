/**
 * One-off seed script: inserts the curated starter hero images into the
 * real database. Requires POSTGRES_URL / DATABASE_URL to be set in the
 * environment it's run in (e.g. `vercel env pull` locally, or run from
 * a context that already has the project's env vars).
 *
 * Usage: npm run db:seed
 *
 * Equivalent to clicking "Load starter images" in /admin/hero — both
 * call lib/db.ts's createHeroImage() against the same seed list.
 */
import { createHeroImage, hasDatabase, listHeroImages } from "../lib/db";
import { SEED_HERO_IMAGES_DATA } from "../lib/seed-hero-images-data";

async function main() {
  if (!hasDatabase) {
    console.error(
      "No database configured — set POSTGRES_URL or DATABASE_URL before running this script."
    );
    process.exit(1);
  }

  const existing = await listHeroImages();
  if (existing.length > 0) {
    console.log(
      `hero_images already has ${existing.length} row(s) — skipping seed. Delete them first if you want to reseed.`
    );
    return;
  }

  for (const seed of SEED_HERO_IMAGES_DATA) {
    const row = await createHeroImage({
      src: seed.src,
      storageKey: `external/${seed.slug}`,
      title: seed.title,
      description: seed.description,
      alt: seed.alt,
      isActive: true,
    });
    console.log(`Inserted: ${row.title}`);
  }

  console.log(`Done — ${SEED_HERO_IMAGES_DATA.length} images seeded.`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
