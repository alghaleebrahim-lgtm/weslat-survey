import Image from "next/image";

import { cn } from "@/lib/utils";

/**
 * Official Creatvo lockup, extracted as outlined vector paths from the
 * supplied artwork — original artboard 138.403 × 37.1263. Do not
 * redraw, recolor, or distort; render at this aspect ratio only.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <Image
      src="/brand/creatvo-logo.svg"
      alt="Creatvo"
      width={138.403}
      height={37.1263}
      priority
      className={cn("h-8 w-auto", className)}
    />
  );
}
