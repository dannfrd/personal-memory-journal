import { Loader2 } from "lucide-react";
import { cn } from "@/src/lib/utils";

export function LoadingState({ className }: { className?: string }) {
  return (
    <div className={cn("flex min-h-[300px] flex-col items-center justify-center space-y-4 text-foreground/40", className)}>
      <Loader2 className="h-8 w-8 animate-spin" strokeWidth={1.5} />
      <p className="text-sm font-medium animate-pulse">Loading gallery...</p>
    </div>
  );
}
