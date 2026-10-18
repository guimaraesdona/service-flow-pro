import { useLocation, Link, useNavigate } from "react-router-dom";
import { Users, Wrench, ClipboardList, LogOut, LayoutDashboard, DollarSign, Settings, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { AppLogo } from "@/components/ui/app-logo";

const navItems = [
  { path: "/dashboard", label: "Início", icon: LayoutDashboard },
  { path: "/ordens", label: "Ordens de serviço", icon: ClipboardList },
  { path: "/clientes", label: "Clientes", icon: Users },
  { path: "/servicos", label: "Serviços", icon: Wrench },
  { path: "/financeiro", label: "Financeiro", icon: DollarSign },
  { path: "/relatorios", label: "Relatórios", icon: FileText },
  { path: "/configuracoes", label: "Configurações", icon: Settings },
];

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <aside className="hidden lg:flex flex-col w-60 h-screen sticky top-0 bg-sidebar border-r border-sidebar-border print:hidden">
      {/* Logo */}
      <div className="h-16 px-5 flex items-center gap-2.5 border-b border-sidebar-border">
        <AppLogo size="md" />
        <span className="text-[15px] font-semibold tracking-tight text-foreground">Service Flow Pro</span>
      </div>

      {/* Navigation */}
      <nav aria-label="Principal" className="flex-1 p-3 space-y-0.5">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + "/");
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 px-3 h-9 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="p-3 border-t border-sidebar-border">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 h-9 w-full rounded-md text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );
}
