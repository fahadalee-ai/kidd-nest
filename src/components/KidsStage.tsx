import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Dark canvas for splash and auth. No decorative artwork. */
export function KidsStage({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("kids-stage relative h-full overflow-hidden", className)}>{children}</div>;
}
