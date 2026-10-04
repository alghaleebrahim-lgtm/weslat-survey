"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

/** A single decorative image travelling the corridor. */
export type HeroStreamImage = {
  id: string;
  src: string;
  alt?: string | null;
};

export type HeroCta = {
  label: string;
  href: string;
};

export interface ImageStreamHeroProps {
  /** Ordered, active images. Supplied by the page — never hardcoded here. */
  images: HeroStreamImage[];
  eyebrow?: string;
  headline: React.ReactNode;
  description?: React.ReactNode;
  primaryCta?: HeroCta;
  secondaryCta?: HeroCta;
  /** Seconds for one card to travel the full corridor. */
  duration?: number;
  /** Cards rendered per rail on desktop. */
  cardsPerRail?: number;
  className?: string;
}

/**
 * Corridor geometry is expressed in `cqw` (container query units) so the whole
 * composition scales with the hero's own width rather than the viewport.
 */
const CORRIDOR_CSS = `
.creatvo-corridor {
  container-type: inline-size;
  --corridor-depth: 160cqw;
  --corridor-near: 46cqw;
  --card-w: 26cqw;
  --rail-x: 33cqw;
  --rail-ry: 26deg;
  --perspective: 62cqw;
}

@container (max-width: 900px) {
  .creatvo-corridor { --card-w: 34cqw; --rail-x: 38cqw; --rail-ry: 30deg; }
}

@container (max-width: 620px) {
  .creatvo-corridor {
    --card-w: 42cqw;
    --rail-x: 44cqw;
    --rail-ry: 34deg;
    --perspective: 76cqw;
    --corridor-depth: 130cqw;
    --corridor-near: 34cqw;
  }
  /* Thin the rails so the centre column stays legible on small screens. */
  .creatvo-corridor-card[data-slot="2"],
  .creatvo-corridor-card[data-slot="3"] { display: none; }
}

.creatvo-corridor-stage {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  perspective: var(--perspective);
  perspective-origin: 50% 50%;
  overflow: hidden;
}

.creatvo-corridor-scene {
  position: absolute;
  inset: 0;
  transform-style: preserve-3d;
}

.creatvo-corridor-card {
  position: absolute;
  top: 50%;
  left: 50%;
  width: var(--card-w);
  transform-style: preserve-3d;
  animation: creatvo-corridor-fly var(--corridor-duration) linear infinite;
  will-change: transform, opacity;
}

.creatvo-corridor-plate {
  transform: rotateY(var(--plate-ry));
  transform-origin: 50% 50%;
  overflow: hidden;
  border-radius: 2px;
  box-shadow: 0 24px 60px -24px rgb(14 9 32 / 0.55);
  backface-visibility: hidden;
}

.creatvo-corridor-plate img {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 3 / 2;
  object-fit: cover;
}

@keyframes creatvo-corridor-fly {
  0% {
    transform: translate3d(var(--cx), var(--cy), calc(var(--corridor-depth) * -1));
    opacity: 0;
  }
  14% { opacity: 1; }
  76% { opacity: 1; }
  100% {
    transform: translate3d(var(--cx), var(--cy), var(--corridor-near));
    opacity: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .creatvo-corridor-card {
    animation: none;
    transform: translate3d(var(--cx), var(--cy), var(--cz-static));
    opacity: var(--op-static);
  }
}
`;

/** Injected once per document; the rules are identical for every instance. */
function CorridorStyles() {
  return (
    <style href="creatvo-corridor" precedence="default">
      {CORRIDOR_CSS}
    </style>
  );
}

type CardSpec = {
  key: string;
  slot: number;
  image: HeroStreamImage;
  style: React.CSSProperties;
};

function buildCards(
  images: HeroStreamImage[],
  cardsPerRail: number,
  duration: number
): CardSpec[] {
  const cards: CardSpec[] = [];
  const interval = duration / cardsPerRail;

  // -1 = left rail, 1 = right rail. Mirrored placement and mirrored inward tilt.
  for (const side of [-1, 1] as const) {
    for (let i = 0; i < cardsPerRail; i += 1) {
      const image = images[(side === -1 ? i : i + cardsPerRail) % images.length];

      // Negative delays start every card mid-flight, so the corridor is already
      // populated on first paint instead of filling in over one full cycle.
      const delay = -(interval * i) - (side === 1 ? interval / 2 : 0);

      // Static fallback depths for reduced motion: evenly spaced down the corridor.
      const t = (i + (side === 1 ? 0.5 : 0)) / cardsPerRail;
      const staticDepth = -160 + t * 190;

      cards.push({
        key: `${side === -1 ? "l" : "r"}-${i}`,
        slot: i,
        image,
        style: {
          "--cx": `calc(${side} * var(--rail-x))`,
          "--cy": `${(i % 2 === 0 ? -1 : 1) * 5}cqw`,
          "--plate-ry": `calc(${-side} * var(--rail-ry))`,
          "--cz-static": `${staticDepth.toFixed(1)}cqw`,
          "--op-static": t < 0.12 ? 0.35 : 1,
          animationDelay: `${delay.toFixed(2)}s`,
        } as React.CSSProperties,
      });
    }
  }

  return cards;
}

export function ImageStreamHero({
  images,
  eyebrow,
  headline,
  description,
  primaryCta,
  secondaryCta,
  duration = 18,
  cardsPerRail = 4,
  className,
}: ImageStreamHeroProps) {
  const cards = React.useMemo(() => {
    if (images.length === 0) return [];
    return buildCards(images, cardsPerRail, duration);
  }, [images, cardsPerRail, duration]);

  return (
    <section
      className={cn(
        "creatvo-corridor relative isolate overflow-hidden bg-(--hero-bg)",
        className
      )}
      style={
        {
          "--corridor-duration": `${duration}s`,
        } as React.CSSProperties
      }
    >
      <CorridorStyles />

      {cards.length > 0 && (
        <div className="creatvo-corridor-stage" aria-hidden="true">
          <div className="creatvo-corridor-scene">
            {cards.map((card) => (
              <div
                key={card.key}
                data-slot={card.slot}
                className="creatvo-corridor-card"
                style={card.style}
              >
                <div className="creatvo-corridor-plate">
                  {/* eslint-disable-next-line @next/next/no-img-element -- decorative, aria-hidden corridor card; next/image's intrinsic sizing doesn't fit this cqw-driven layout */}
                  <img src={card.image.src} alt="" loading="eager" decoding="async" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Keeps the centre column legible over the moving corridor. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_55%_at_50%_50%,var(--hero-scrim)_0%,transparent_78%)]"
      />

      <div className="relative mx-auto flex min-h-[clamp(34rem,84vh,52rem)] w-full max-w-3xl flex-col items-center justify-center px-6 py-28 text-center">
        {eyebrow && (
          <p className="mb-6 text-sm font-medium tracking-tight text-(--hero-muted)">{eyebrow}</p>
        )}

        <h1 className="text-balance font-heading text-[clamp(2.25rem,5.2vw,4rem)] font-medium leading-[1.06] tracking-tight text-(--hero-fg)">
          {headline}
        </h1>

        {description && (
          <p className="mt-7 max-w-[54ch] text-pretty text-base leading-relaxed text-(--hero-muted) sm:text-lg">
            {description}
          </p>
        )}

        {(primaryCta || secondaryCta) && (
          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:gap-4">
            {primaryCta && (
              <a
                href={primaryCta.href}
                className="inline-flex h-12 items-center justify-center rounded-sm bg-(--hero-accent) px-7 text-sm font-medium text-white transition-colors hover:bg-(--hero-accent-hover) focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-(--hero-accent)"
              >
                {primaryCta.label}
              </a>
            )}
            {secondaryCta && (
              <a
                href={secondaryCta.href}
                className="inline-flex h-12 items-center justify-center rounded-sm border border-(--hero-border) px-7 text-sm font-medium text-(--hero-fg) transition-colors hover:bg-(--hero-border)/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-(--hero-accent)"
              >
                {secondaryCta.label}
              </a>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

export default ImageStreamHero;
