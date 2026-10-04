import { cn } from "@/lib/utils";

/**
 * TEMP wordmark. The approved vector logo (/public/brand/creatvo-logo.svg)
 * was not supplied to this session — this renders the brand name in the
 * heading face as a stand-in so the header isn't dead space. Swap for
 * <Image src="/brand/creatvo-logo.svg" .../> once the real asset lands;
 * see the implementation notes for details.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "font-heading text-lg font-semibold tracking-tight text-foreground",
        className
      )}
    >
      Creatvo
    </span>
  );
}
