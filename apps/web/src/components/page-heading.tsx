import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageHeadingProps {
  actions?: ReactNode;
  className?: string;
  description: string;
  eyebrow: string;
  title: string;
}

export function PageHeading({
  actions,
  className,
  description,
  eyebrow,
  title,
}: PageHeadingProps) {
  return (
    <header
      className={cn(
        "flex flex-col gap-6 border-b border-foreground/20 pb-7 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className="max-w-3xl space-y-3">
        <p className="sf-kicker text-primary">{eyebrow}</p>
        <div className="space-y-2">
          <h1 className="sf-display text-3xl leading-[1.05] text-balance sm:text-[2.55rem]">
            {title}
          </h1>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-[0.9375rem]">
            {description}
          </p>
        </div>
      </div>
      {actions !== undefined ? (
        <div className="shrink-0 sm:self-center">{actions}</div>
      ) : null}
    </header>
  );
}
