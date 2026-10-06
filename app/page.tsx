import Link from "next/link";

import { Logo } from "@/components/site/logo";
import { ImageStreamHero } from "@/components/ui/image-stream-hero";
import { getActiveHeroImages } from "@/lib/hero-images";

const CAPABILITIES = [
  {
    title: "Documentary photography",
    description:
      "Field-based photography that documents programs as they actually happen, for reports, campaigns and donor communications.",
  },
  {
    title: "Video & film production",
    description:
      "Short documentary films, program recaps and interview-led pieces produced on location with humanitarian and institutional teams.",
  },
  {
    title: "Institutional storytelling",
    description:
      "Content built for the standards institutional audiences expect: UN agencies, foundations, NGOs and government communications teams.",
  },
];

const WORK_AREAS = [
  "Field work & aid delivery",
  "Healthcare outreach",
  "Education programs",
  "Community resilience",
  "Development projects",
  "Institutional events",
];

export default async function Home() {
  const heroImages = await getActiveHeroImages();

  return (
    <>
      <header className="sticky top-0 z-10 border-b border-border/80 bg-background/90 backdrop-blur supports-backdrop-filter:bg-background/70">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Logo />
          <nav className="flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#work" className="transition-colors hover:text-foreground">
              Work
            </a>
            <a href="#about" className="transition-colors hover:text-foreground">
              About
            </a>
            <Link
              href="#contact"
              className="rounded-sm border border-border px-4 py-2 font-medium text-foreground transition-colors hover:bg-secondary"
            >
              Work with us
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <ImageStreamHero
          images={heroImages.map((image) => ({
            id: image.id,
            src: image.src,
            alt: image.alt,
          }))}
          eyebrow="Media production for organizations"
          headline="Stories that move people. Impact that moves forward."
          description="We create documentary, photography and video content that helps humanitarian organizations and institutions communicate their work, amplify impact and connect people to the stories that matter."
          primaryCta={{ label: "Explore our work", href: "#work" }}
          secondaryCta={{ label: "Work with us", href: "#contact" }}
        />

        <section id="about" className="border-t border-border bg-background py-24">
          <div className="mx-auto max-w-6xl px-6">
            <div className="max-w-2xl">
              <p className="text-sm font-medium text-muted-foreground">What we do</p>
              <h2 className="mt-3 font-heading text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
                Media production built for institutional work.
              </h2>
              <p className="mt-4 max-w-[60ch] text-base leading-relaxed text-muted-foreground">
                Creatvo partners with NGOs, UN agencies, development organizations and
                foundations to document programs in the field and turn that work into
                content their teams can use — for reporting, fundraising and public
                communications.
              </p>
            </div>

            <div className="mt-14 grid gap-10 sm:grid-cols-3">
              {CAPABILITIES.map((item) => (
                <div key={item.title}>
                  <h3 className="font-heading text-lg font-medium text-foreground">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="work" className="border-t border-border bg-secondary/40 py-24">
          <div className="mx-auto max-w-6xl px-6">
            <p className="text-sm font-medium text-muted-foreground">Where we work</p>
            <h2 className="mt-3 font-heading text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
              Documentary coverage across the programs that matter.
            </h2>
            <ul className="mt-10 grid grid-cols-2 gap-x-8 gap-y-4 text-sm text-foreground sm:grid-cols-3">
              {WORK_AREAS.map((area) => (
                <li key={area} className="flex items-center gap-2">
                  <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-accent" />
                  {area}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="contact" className="border-t border-border bg-background py-24">
          <div className="mx-auto max-w-2xl px-6 text-center">
            <h2 className="font-heading text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
              Let&apos;s document your work.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              Tell us about your organization and the story you need told. We&apos;ll
              get back to you to discuss scope, timeline and production needs.
            </p>
            <a
              href="mailto:hello@creatvo.example"
              className="mt-8 inline-flex h-12 items-center justify-center rounded-sm bg-accent px-7 text-sm font-medium text-white transition-colors hover:bg-accent/90"
            >
              hello@creatvo.example
            </a>
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-background py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 text-sm text-muted-foreground sm:flex-row">
          <Logo className="h-6" />
          <p>&copy; {new Date().getFullYear()} Creatvo. Media production for organizations.</p>
        </div>
      </footer>
    </>
  );
}
