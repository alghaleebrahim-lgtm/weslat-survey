import { hasDatabase, listHeroImages } from "@/lib/db";
import { HeroImageManager } from "@/components/admin/hero-image-manager";
import { SetupRequired } from "@/components/admin/setup-required";

export default async function AdminHeroPage() {
  if (!hasDatabase) {
    return <SetupRequired missing={["a database (POSTGRES_URL / DATABASE_URL)"]} />;
  }
  const images = await listHeroImages();
  return <HeroImageManager initialImages={images} />;
}
