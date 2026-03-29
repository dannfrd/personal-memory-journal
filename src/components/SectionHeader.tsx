import { ReactNode } from "react";
import { cn } from "@/src/lib/utils";

interface SectionHeaderProps {
  title: string;
  description?: string;
  className?: string;
  children?: ReactNode;
}

export function SectionHeader({ title, description, className, children }: SectionHeaderProps) {
  return (
    <div className={cn("mb-12 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div className="max-w-2xl">
        <h1 className="text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
          {title}
        </h1>
        {description && (
          <p className="mt-3 text-lg text-foreground/60">
            {description}
          </p>
        )}
      </div>
      {children && (
        <div className="mt-4 sm:mt-0 flex-shrink-0">
          {children}
        </div>
      )}
    </div>
  );
}
