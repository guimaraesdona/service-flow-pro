import { cn } from "@/lib/utils";

interface AppLogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function AppLogo({ size = "md", className }: AppLogoProps) {
  const sizeClasses = {
    sm: "w-8 h-8 rounded-md text-sm",
    md: "w-10 h-10 rounded-lg text-lg",
    lg: "w-16 h-16 rounded-2xl text-2xl",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center justify-center bg-primary font-bold text-primary-foreground shadow-sm",
        sizeClasses[size],
        className
      )}
    >
      <span>OS</span>
    </div>
  );
}
