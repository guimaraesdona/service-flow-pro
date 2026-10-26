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
        "sticky top-0 z-40 bg-card border-b border-border",
        className
      )}
    >
      <div className="max-w-lg mx-auto flex items-center justify-between h-14 px-4">
        <div className="w-11">
          {showBack && (
            <button
              onClick={() => navigate(-1)}
              aria-label="Voltar"
              className="w-11 h-11 -ml-3 flex items-center justify-center rounded-md text-foreground hover:bg-secondary transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
        </div>

        <h1 className="text-base font-semibold text-foreground truncate">{title}</h1>

        <div className="min-w-11 flex justify-end">
          {rightAction}
        </div>
      </div>
    </header>
  );
}
