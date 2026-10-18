import { ReactNode, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useProfile } from "@/hooks/useProfile";

interface DesktopHeaderProps {
  title: string;
  actions?: ReactNode;
}

const initials = (name?: string) =>
  (name ?? "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]!.toUpperCase())
    .join("");

const isTyping = (target: EventTarget | null) =>
  target instanceof HTMLElement && (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));

// Busca de OS em qualquer tela. Na lista de ordens ela filtra ao digitar
// (via ?q=); nas demais, Enter leva para a lista já filtrada.
function OrderSearch() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const onOrders = location.pathname === "/ordens";
  const [term, setTerm] = useState(onOrders ? searchParams.get("q") ?? "" : "");
  const inputRef = useRef<HTMLInputElement>(null);

  // Atalhos: "/" foca a busca, "n" abre uma nova OS.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || isTyping(e.target)) return;
      if (e.key === "/") {
        e.preventDefault();
        inputRef.current?.focus();
      } else if (e.key === "n" || e.key === "N") {
        e.preventDefault();
        navigate("/ordens/nova");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navigate]);

  const update = (value: string) => {
    setTerm(value);
    if (onOrders) {
      const next = new URLSearchParams(searchParams);
      if (value) next.set("q", value);
      else next.delete("q");
      setSearchParams(next, { replace: true });
    }
  };

  return (
    <form
      role="search"
      className="relative w-72"
      onSubmit={(e) => {
        e.preventDefault();
        if (!onOrders) navigate(term ? `/ordens?q=${encodeURIComponent(term)}` : "/ordens");
      }}
    >
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
      <Input
        ref={inputRef}
        type="search"
        aria-label="Buscar ordens de serviço"
        aria-keyshortcuts="/"
        placeholder="Buscar OS"
        value={term}
        onChange={(e) => update(e.target.value)}
        className="h-9 pl-9 pr-8"
      />
      <kbd className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 rounded border border-border px-1.5 text-[11px] font-medium text-muted-foreground">
        /
      </kbd>
    </form>
  );
}

export function DesktopHeader({ title, actions }: DesktopHeaderProps) {
  const { profile } = useProfile();

  return (
    <header className="hidden lg:flex items-center justify-between gap-6 h-16 px-8 bg-card border-b border-border w-full sticky top-0 z-30">
      <h1 className="text-lg font-semibold tracking-tight text-foreground truncate">{title}</h1>

      <div className="flex items-center gap-3">
        <OrderSearch />
        {actions}

        {profile && (
          <div
            className="w-8 h-8 rounded-full bg-accent flex items-center justify-center"
            title={profile.name || profile.email}
          >
            <span className="text-xs font-semibold text-accent-foreground">
              {initials(profile.name || profile.email)}
            </span>
          </div>
        )}
      </div>
    </header>
  );
}
