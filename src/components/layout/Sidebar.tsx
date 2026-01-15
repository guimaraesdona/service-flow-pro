import { useLocation, Link, useNavigate } from "react-router-dom";
import { Users, Wrench, ClipboardList, LogOut, LayoutDashboard, DollarSign, Settings, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/clientes", label: "Clientes", icon: Users },
  { path: "/servicos", label: "Serviços", icon: Wrench },
  { path: "/ordens", label: "Ordens de Serviço", icon: ClipboardList },
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
    <aside className="hidden lg:flex flex-col w-60 min-h-screen bg-card border-r border-border/50 print:hidden">
      {/* Logo */}
      <div className="p-6 border-b border-border/50">
        <h1 className="text-xl font-bold text-foreground">OSApp</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + "/");
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-border/50">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );
}
