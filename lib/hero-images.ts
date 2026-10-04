import "server-only";

/**
 * Persistent hero-image record shape. This mirrors the model the CMS
 * (Phase 2 — database + storage backed) will read and write; the static
 * seed below is a stand-in for that query until the data layer exists.
 */
export type HeroImageRecord = {
  id: string;
  src: string;
  /** Storage provider key, needed to delete the underlying file. Not yet wired to real storage. */
  storageKey: string;
  alt: string | null;
  title: string | null;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

/**
 * Temporary local-dev fallback only (see image-stream-hero integration
 * notes). Once the database + storage are wired up, this file becomes a
 * thin wrapper around that query and this array is deleted.
 */
const SEED_HERO_IMAGES: HeroImageRecord[] = [
  {
    id: "seed-01",
    src: "https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=2000&q=80",
    storageKey: "seed/relief-distribution-01.jpg",
    alt: "Aid workers unloading supply boxes from a relief truck",
    title: "Relief distribution",
    description: "Documenting emergency aid delivery in the field.",
    sortOrder: 0,
    isActive: true,
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
  },
  {
    id: "seed-02",
    src: "https://images.unsplash.com/photo-1536064479547-7ee40b74b807?auto=format&fit=crop&w=2000&q=80",
    storageKey: "seed/healthcare-outreach-01.jpg",
    alt: "A healthcare worker consulting with a young patient",
    title: "Healthcare outreach",
    description: "Community health programs captured on assignment.",
    sortOrder: 1,
    isActive: true,
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
  },
  {
    id: "seed-03",
    src: "https://images.unsplash.com/photo-1536337005238-94b997371b40?auto=format&fit=crop&w=2000&q=80",
    storageKey: "seed/education-01.jpg",
    alt: "A student writing at his desk in a classroom",
    title: "Education access",
    description: "Classroom documentary work for development partners.",
    sortOrder: 2,
    isActive: true,
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
  },
  {
    id: "seed-04",
    src: "https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=2000&q=80",
    storageKey: "seed/classroom-01.jpg",
    alt: "A teacher leading a classroom discussion",
    title: "Community learning",
    description: "Field production for education-focused NGOs.",
    sortOrder: 3,
    isActive: true,
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
  },
  {
    id: "seed-05",
    src: "https://images.unsplash.com/photo-1509099836639-18ba1795216d?auto=format&fit=crop&w=2000&q=80",
    storageKey: "seed/community-children-01.jpg",
    alt: "A group of children smiling together",
    title: "Community resilience",
    description: "Human-centered storytelling from the field.",
    sortOrder: 4,
    isActive: true,
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
  },
  {
    id: "seed-06",
    src: "https://images.unsplash.com/photo-1497486751825-1233686d5d80?auto=format&fit=crop&w=2000&q=80",
    storageKey: "seed/community-children-02.jpg",
    alt: "Children from a local community posing together",
    title: "Local impact",
    description: "Portraits from community-support programs.",
    sortOrder: 5,
    isActive: true,
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
  },
  {
    id: "seed-07",
    src: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=2000&q=80",
    storageKey: "seed/field-children-01.jpg",
    alt: "Children in a village greeting the camera",
    title: "Field interviews",
    description: "On-location documentary coverage.",
    sortOrder: 6,
    isActive: true,
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
  },
  {
    id: "seed-08",
    src: "https://images.unsplash.com/photo-1524069290683-0457abfe42c3?auto=format&fit=crop&w=2000&q=80",
    storageKey: "seed/school-uniforms-01.jpg",
    alt: "A group of schoolchildren in uniform",
    title: "Development projects",
    description: "Program documentation for institutional partners.",
    sortOrder: 7,
    isActive: true,
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
  },
  {
    id: "seed-09",
    src: "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?auto=format&fit=crop&w=2000&q=80",
    storageKey: "seed/giving-01.jpg",
    alt: "Hands holding coins and a note reading make a change",
    title: "Giving & impact",
    description: "Donor and fundraising campaign imagery.",
    sortOrder: 8,
    isActive: true,
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
  },
  {
    id: "seed-10",
    src: "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&w=2000&q=80",
    storageKey: "seed/teamwork-01.jpg",
    alt: "A group of people stacking their hands together",
    title: "NGO teams",
    description: "Behind-the-scenes coverage of partner organizations.",
    sortOrder: 9,
    isActive: true,
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
  },
  {
    id: "seed-11",
    src: "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&w=2000&q=80",
    storageKey: "seed/solidarity-01.jpg",
    alt: "A circle of hands forming a heart shape",
    title: "Institutional events",
    description: "Conference and campaign coverage for foundations.",
    sortOrder: 10,
    isActive: true,
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
  },
  {
    id: "seed-12",
    src: "https://images.unsplash.com/photo-1593113630400-ea4288922497?auto=format&fit=crop&w=2000&q=80",
    storageKey: "seed/relief-distribution-02.jpg",
    alt: "Volunteers carrying supply boxes from a relief truck",
    title: "Professional field production",
    description: "Crews embedded with aid organizations on assignment.",
    sortOrder: 11,
    isActive: true,
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
  },
];

/**
 * Returns active hero images ordered for display. Shaped as an async call
 * so swapping this body for a real database query (Phase 2) requires no
 * change at the call site.
 */
export async function getActiveHeroImages(): Promise<HeroImageRecord[]> {
  return [...SEED_HERO_IMAGES]
    .filter((image) => image.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}
