import { cn } from "@/lib/utils";

interface AppLogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function AppLogo({ size = "md", className }: AppLogoProps) {
  const sizeClasses = {
    sm: "w-7 h-7 rounded-md text-xs",
    md: "w-8 h-8 rounded-md text-sm",
    lg: "w-14 h-14 rounded-xl text-xl",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center justify-center bg-primary font-bold tracking-tight text-primary-foreground",
        sizeClasses[size],
        className
      )}
    >
      <span aria-hidden="true">SF</span>
    </div>
  );
}
