import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface TopNavProps {
  title: string;
  showBack?: boolean;
  rightAction?: React.ReactNode;
  className?: string;
}

export function TopNav({ title, showBack = false, rightAction, className }: TopNavProps) {
  const navigate = useNavigate();

  return (
    <header
      className={cn(
        "sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/30 animate-fade-in",
        className
      )}
    >
      <div className="max-w-lg mx-auto flex items-center justify-between h-14 px-4">
        <div className="w-10">
          {showBack && (
            <button
              onClick={() => navigate(-1)}
              className="p-2 -ml-2 text-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
        </div>

        <h1 className="text-lg font-semibold text-foreground">{title}</h1>

        <div className="w-10 flex justify-end">
          {rightAction}
        </div>
      </div>
    </header>
  );
}
