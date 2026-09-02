import { Wrench } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface BrandProps {
  className?: string;
  href?: string;
  inverse?: boolean;
  subtitle?: string;
}

export function Brand({
  className,
  href = "/",
  inverse = false,
  subtitle,
}: BrandProps) {
  return (
    <Link
      aria-label="ServisFlow ana sayfa"
      className={cn(
        "group/brand inline-flex w-fit items-center gap-2.5 outline-none",
        className,
      )}
      href={href}
    >
      <BrandSymbol />
      <span className="grid leading-none">
        <span
          className={cn(
            "font-heading text-[1.05rem] font-bold tracking-[-0.045em]",
            inverse ? "text-sidebar-foreground" : "text-foreground",
          )}
        >
          ServisFlow
        </span>
        {subtitle !== undefined ? (
          <span
            className={cn(
              "mt-1 text-[0.56rem] font-semibold tracking-[0.14em] uppercase",
              inverse
                ? "text-sidebar-foreground/45"
                : "text-muted-foreground",
            )}
          >
            {subtitle}
          </span>
        ) : null}
      </span>
    </Link>
  );
}

export function BrandSymbol({
  className,
}: {
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "relative grid size-10 shrink-0 place-items-center overflow-hidden bg-primary text-primary-foreground transition-transform duration-300 group-hover/brand:-rotate-3",
        className,
      )}
      style={{
        clipPath:
          "polygon(50% 0, 91% 24%, 91% 76%, 50% 100%, 9% 76%, 9% 24%)",
      }}
    >
      <Wrench className="relative size-[1.05rem]" strokeWidth={2.5} />
    </span>
  );
}
