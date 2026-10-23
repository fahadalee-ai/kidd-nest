import { LOGO } from "@/data/photos";
import { cn } from "@/lib/utils";

const logoClass = "h-16 w-auto max-w-full object-contain object-left";

export function BrandLogo({
  variant = "color",
  className,
}: {
  variant?: "color" | "white";
  className?: string;
}) {
  return <img src={variant === "white" ? LOGO.white : LOGO.color} alt="KiddoNest" className={cn(logoClass, className)} />;
}
