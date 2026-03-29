import { Inbox } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { ReactNode } from "react";

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  title,
  description,
  icon = <Inbox className="h-10 w-10 text-foreground/20" strokeWidth={1} />,
  action,
  className
}: EmptyStateProps) {
  return (
    <div className={cn("flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-dashed border-black/10 bg-black/5 px-6 py-12 text-center dark:border-white/10 dark:bg-white/5", className)}>
      <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-background shadow-sm">
        {icon}
      </div>
      <h3 className="mb-2 text-xl font-medium text-foreground">{title}</h3>
      <p className="mb-8 max-w-sm text-center text-foreground/60">
        {description}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
}
