/**
 * Shared seed source for the hero image collection: the local-dev fallback
 * in lib/hero-images.ts, the "Load starter images" admin action, and
 * scripts/seed.ts all read from this one list.
 *
 * These are hotlinked Unsplash URLs, not files in our own Blob store —
 * storageKey is prefixed "external/" so lib/storage.ts knows to skip
 * deleting a non-existent Blob object if one of these rows is ever removed.
 */
export type SeedHeroImage = {
  slug: string;
  src: string;
  alt: string;
  title: string;
  description: string;
};

export const SEED_HERO_IMAGES_DATA: SeedHeroImage[] = [
  {
    slug: "relief-distribution-01",
    src: "https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=2000&q=80",
    alt: "Aid workers unloading supply boxes from a relief truck",
    title: "Relief distribution",
    description: "Documenting emergency aid delivery in the field.",
  },
  {
    slug: "healthcare-outreach-01",
    src: "https://images.unsplash.com/photo-1536064479547-7ee40b74b807?auto=format&fit=crop&w=2000&q=80",
    alt: "A healthcare worker consulting with a young patient",
    title: "Healthcare outreach",
    description: "Community health programs captured on assignment.",
  },
  {
    slug: "education-01",
    src: "https://images.unsplash.com/photo-1536337005238-94b997371b40?auto=format&fit=crop&w=2000&q=80",
    alt: "A student writing at his desk in a classroom",
    title: "Education access",
    description: "Classroom documentary work for development partners.",
  },
  {
    slug: "classroom-01",
    src: "https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=2000&q=80",
    alt: "A teacher leading a classroom discussion",
    title: "Community learning",
    description: "Field production for education-focused NGOs.",
  },
  {
    slug: "community-children-01",
    src: "https://images.unsplash.com/photo-1509099836639-18ba1795216d?auto=format&fit=crop&w=2000&q=80",
    alt: "A group of children smiling together",
    title: "Community resilience",
    description: "Human-centered storytelling from the field.",
  },
  {
    slug: "community-children-02",
    src: "https://images.unsplash.com/photo-1497486751825-1233686d5d80?auto=format&fit=crop&w=2000&q=80",
    alt: "Children from a local community posing together",
    title: "Local impact",
    description: "Portraits from community-support programs.",
  },
  {
    slug: "field-children-01",
    src: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=2000&q=80",
    alt: "Children in a village greeting the camera",
    title: "Field interviews",
    description: "On-location documentary coverage.",
  },
  {
    slug: "school-uniforms-01",
    src: "https://images.unsplash.com/photo-1524069290683-0457abfe42c3?auto=format&fit=crop&w=2000&q=80",
    alt: "A group of schoolchildren in uniform",
    title: "Development projects",
    description: "Program documentation for institutional partners.",
  },
  {
    slug: "giving-01",
    src: "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?auto=format&fit=crop&w=2000&q=80",
    alt: "Hands holding coins and a note reading make a change",
    title: "Giving & impact",
    description: "Donor and fundraising campaign imagery.",
  },
  {
    slug: "teamwork-01",
    src: "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&w=2000&q=80",
    alt: "A group of people stacking their hands together",
    title: "NGO teams",
    description: "Behind-the-scenes coverage of partner organizations.",
  },
  {
    slug: "solidarity-01",
    src: "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&w=2000&q=80",
    alt: "A circle of hands forming a heart shape",
    title: "Institutional events",
    description: "Conference and campaign coverage for foundations.",
  },
  {
    slug: "relief-distribution-02",
    src: "https://images.unsplash.com/photo-1593113630400-ea4288922497?auto=format&fit=crop&w=2000&q=80",
    alt: "Volunteers carrying supply boxes from a relief truck",
    title: "Professional field production",
    description: "Crews embedded with aid organizations on assignment.",
  },
];
