import { Bell, User } from "lucide-react";
import { Link } from "react-router-dom";

interface DesktopHeaderProps {
  title: string;
}

export function DesktopHeader({ title }: DesktopHeaderProps) {
  return (
    <header className="hidden lg:flex items-center justify-between h-16 px-8 bg-card border-b border-border/50 w-full">
      <h1 className="text-lg font-semibold text-foreground">{title}</h1>
      
      <div className="flex items-center gap-4">
        <Link 
          to="/notificacoes"
          className="p-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <Bell className="w-5 h-5" />
        </Link>
        
        <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center">
          <span className="text-xs font-bold text-primary-foreground">AS</span>
        </div>
      </div>
    </header>
  );
}
