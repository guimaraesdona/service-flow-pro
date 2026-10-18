import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { Home, ClipboardList, Users, DollarSign, Menu, Wrench, FileText, Settings, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

const navItems = [
  { path: "/dashboard", label: "Início", icon: Home },
  { path: "/ordens", label: "Ordens", icon: ClipboardList },
  { path: "/clientes", label: "Clientes", icon: Users },
  { path: "/financeiro", label: "Financeiro", icon: DollarSign },
];

// O que não cabe na barra fica na aba "Mais", para que toda seção do
// Sidebar do desktop também seja alcançável no celular.
const moreItems = [
  { path: "/servicos", label: "Serviços", icon: Wrench },
  { path: "/relatorios", label: "Relatórios", icon: FileText },
  { path: "/configuracoes", label: "Configurações", icon: Settings },
];

const isCurrent = (pathname: string, path: string) => pathname === path || pathname.startsWith(path + "/");

function NavLabel({ active, children }: { active: boolean; children: React.ReactNode }) {
  return (
    <span className={cn("text-xs font-medium transition-colors", active ? "text-primary" : "text-muted-foreground")}>
      {children}
    </span>
  );
}

function ActiveIndicator() {
  return <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full" />;
}

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [moreOpen, setMoreOpen] = useState(false);

  const moreActive = moreItems.some((item) => isCurrent(location.pathname, item.path));

  const handleLogout = async () => {
    setMoreOpen(false);
    await signOut();
    navigate("/");
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border pb-[env(safe-area-inset-bottom)] lg:hidden print:hidden">
      <div className="max-w-lg mx-auto flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = isCurrent(location.pathname, item.path);
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              aria-current={isActive ? "page" : undefined}
              className={cn("nav-item relative flex-1", isActive && "nav-item-active")}
            >
              {isActive && <ActiveIndicator />}
              <Icon className={cn("w-5 h-5 transition-colors", isActive ? "text-primary" : "text-muted-foreground")} />
              <NavLabel active={isActive}>{item.label}</NavLabel>
            </Link>
          );
        })}

        <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
          <button
            type="button"
            onClick={() => setMoreOpen(true)}
            aria-haspopup="dialog"
            aria-expanded={moreOpen}
            className={cn("nav-item relative flex-1", moreActive && "nav-item-active")}
          >
            {moreActive && <ActiveIndicator />}
            <Menu className={cn("w-5 h-5 transition-colors", moreActive ? "text-primary" : "text-muted-foreground")} />
            <NavLabel active={moreActive}>Mais</NavLabel>
          </button>

          <SheetContent side="bottom" className="rounded-t-lg pb-8">
            <SheetHeader className="text-left">
              <SheetTitle>Mais opções</SheetTitle>
            </SheetHeader>

            <div className="mt-4 space-y-1">
              {moreItems.map((item) => {
                const isActive = isCurrent(location.pathname, item.path);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMoreOpen(false)}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium transition-colors",
                      isActive ? "bg-accent text-accent-foreground" : "text-foreground hover:bg-secondary",
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                );
              })}

              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-3 px-3 py-3 w-full rounded-lg text-base font-medium text-destructive hover:bg-destructive/10 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                Sair
              </button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}
