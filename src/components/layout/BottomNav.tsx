import { useLocation, Link } from "react-router-dom";
import { Users, Wrench, Home, ClipboardList, Bell } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { path: "/clientes", label: "Clientes", icon: Users },
  { path: "/servicos", label: "Serviços", icon: Wrench },
  { path: "/dashboard", label: "Home", icon: Home },
  { path: "/ordens", label: "Ordens", icon: ClipboardList },
  { path: "/notificacoes", label: "Alertas", icon: Bell },
];

export function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border/50 shadow-elevated lg:hidden">
      <div className="max-w-lg mx-auto flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "nav-item relative flex-1",
                isActive && "nav-item-active"
              )}
            >
              {isActive && (
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-10 h-1 bg-primary rounded-full animate-scale-in" />
              )}
              <Icon
                className={cn(
                  "w-5 h-5 transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              />
              <span
                className={cn(
                  "text-[10px] font-medium transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
