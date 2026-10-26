import { useMemo } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { TopNav } from "@/components/layout/TopNav";
import { DesktopHeader } from "@/components/layout/DesktopHeader";
import { Plus, Search, ClipboardList, Check } from "lucide-react";
import { NewOrderFab } from "@/components/layout/NewOrderFab";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { OrderStatus, ServiceOrder } from "@/types";
import { formatCurrency, formatOrderNumber } from "@/lib/formatters";
import { STATUS_PLURAL, STATUS_ORDER, isOverdue } from "@/lib/orderStatus";
import { cn } from "@/lib/utils";
import { useOrders } from "@/hooks/useOrders";
import { useClients } from "@/hooks/useClients";
import { useServices } from "@/hooks/useServices";

type Filter = OrderStatus | "all";

const shortDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }).replace(".", "");

// Agendamento é o que importa para OS em aberto; para as demais, a data de abertura.
const orderDateLabel = (order: ServiceOrder) =>
  order.scheduledAt && (order.status === "start" || order.status === "waiting")
    ? `${isOverdue(order) ? "Atrasada" : "Agendada"} ${shortDate(order.scheduledAt)}`
    : shortDate(order.date);

function OrderDate({ order }: { order: ServiceOrder }) {
  return <span className={cn("tabular", isOverdue(order) ? "font-medium text-destructive" : "text-muted-foreground")}>{orderDateLabel(order)}</span>;
}

const servicesLabel = (order: ServiceOrder) =>
  order.services.map((s) => (s.quantity > 1 ? `${s.name} ×${s.quantity}` : s.name)).join(", ");

export default function OrdersPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  // A busca vive na URL (?q=): o campo do cabeçalho no desktop e o do corpo
  // no celular escrevem no mesmo lugar.
  const search = searchParams.get("q") ?? "";
  const setSearch = (value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set("q", value);
    else next.delete("q");
    setSearchParams(next, { replace: true });
  };
  const { orders, isLoading } = useOrders();
  const { clients } = useClients();
  const { services } = useServices();

  // O filtro vive na URL: o dashboard linka direto para "?status=progress".
  const statusParam = searchParams.get("status") as OrderStatus | null;
  const filter: Filter = statusParam && STATUS_ORDER.includes(statusParam) ? statusParam : "all";
  const setFilter = (value: Filter) => {
    const next = new URLSearchParams(searchParams);
    if (value === "all") next.delete("status");
    else next.set("status", value);
    setSearchParams(next, { replace: true });
  };

  const counts = useMemo(() => {
    const result: Record<Filter, number> = { all: orders.length, start: 0, progress: 0, waiting: 0, finished: 0, cancelled: 0 };
    orders.forEach((o) => result[o.status]++);
    return result;
  }, [orders]);

  const term = search.trim().toLowerCase().replace(/^#/, "");
  const filteredOrders = orders.filter((o) => {
    if (filter !== "all" && o.status !== filter) return false;
    if (!term) return true;
    return (
      formatOrderNumber(o).toLowerCase().includes(term) ||
      o.clientName.toLowerCase().includes(term) ||
      o.services.some((s) => s.name.toLowerCase().includes(term))
    );
  });

  const clearFilters = () => setSearchParams({}, { replace: true });

  const filters: Filter[] = ["all", ...STATUS_ORDER];

  return (
    <div className="page-container bg-background">
      <div className="lg:hidden">
        <TopNav title="Ordens de serviço" />
      </div>

      <DesktopHeader
        title="Ordens de serviço"
        actions={
          <Button asChild className="h-9">
            <Link to="/ordens/nova">
              <Plus className="w-4 h-4 mr-1.5" />
              Nova OS
            </Link>
          </Button>
        }
      />

      <div className="content-container space-y-4">
        <div className="relative lg:hidden">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
          <Input
            type="search"
            aria-label="Buscar ordens"
            placeholder="Buscar por nº, cliente ou serviço"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 input-field"
          />
        </div>

        <div role="group" aria-label="Filtrar por status" className="-mx-4 px-4 lg:mx-0 lg:px-0 -mt-2 pt-2 pb-3 flex gap-1.5 overflow-x-auto">
          {filters.map((value) => {
            const active = filter === value;
            return (
              <button
                key={value}
                type="button"
                aria-pressed={active}
                onClick={() => setFilter(value)}
                className={cn(
                  "relative h-8 px-3 rounded-full text-sm font-medium whitespace-nowrap border transition-colors after:absolute after:inset-x-0 after:-inset-y-2 after:content-['']",
                  active
                    ? "bg-foreground text-background border-foreground"
                    : "bg-card text-muted-foreground border-border hover:text-foreground",
                )}
              >
                {value === "all" ? "Todas" : STATUS_PLURAL[value]}
                <span className={cn("ml-1.5 tabular", active ? "opacity-80" : "text-muted-foreground")}>{counts[value]}</span>
              </button>
            );
          })}
        </div>

        {isLoading ? (
          <div className="card-elevated divide-y divide-border">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="p-4 flex items-center gap-4">
                <Skeleton className="h-4 w-12" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <FirstOrderEmptyState hasClients={clients.length > 0} hasServices={services.length > 0} />
        ) : filteredOrders.length === 0 ? (
          <div className="card-elevated p-10 text-center">
            <p className="font-medium text-foreground">Nenhuma OS encontrada</p>
            <p className="text-sm text-muted-foreground mt-1">Nada corresponde a esse filtro ou busca.</p>
            <Button variant="outline" className="mt-4 h-9" onClick={clearFilters}>
              Limpar filtros
            </Button>
          </div>
        ) : (
          <>
            {/* Desktop: tabela */}
            <div className="hidden lg:block card-elevated">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs font-medium text-muted-foreground">
                    <th scope="col" className="px-4 h-10 font-medium w-24">Nº</th>
                    <th scope="col" className="px-4 h-10 font-medium">Cliente</th>
                    <th scope="col" className="px-4 h-10 font-medium">Serviços</th>
                    <th scope="col" className="px-4 h-10 font-medium w-40">Data</th>
                    <th scope="col" className="px-4 h-10 font-medium w-36">Status</th>
                    <th scope="col" className="px-4 h-10 font-medium w-32 text-right">Valor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredOrders.map((order) => (
                    <tr
                      key={order.id}
                      onClick={() => navigate(`/ordens/${order.id}`)}
                      className="cursor-pointer hover:bg-muted/60 transition-colors"
                    >
                      <td className="px-4 h-14 font-semibold text-foreground tabular">
                        <Link
                          to={`/ordens/${order.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="rounded-sm hover:underline underline-offset-4"
                        >
                          {formatOrderNumber(order)}
                        </Link>
                      </td>
                      <td className="px-4 font-medium text-foreground">{order.clientName}</td>
                      <td className="px-4 text-muted-foreground max-w-xs truncate">{servicesLabel(order)}</td>
                      <td className="px-4 whitespace-nowrap"><OrderDate order={order} /></td>
                      <td className="px-4"><StatusBadge status={order.status} /></td>
                      <td className="px-4 text-right font-medium text-foreground whitespace-nowrap tabular">{formatCurrency(order.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Celular: lista */}
            <ul className="lg:hidden card-elevated divide-y divide-border">
              {filteredOrders.map((order) => (
                <li key={order.id}>
                  <Link to={`/ordens/${order.id}`} className="flex items-start gap-3 p-4 active:bg-muted/60">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2">
                        <span className="text-sm font-semibold text-foreground tabular">{formatOrderNumber(order)}</span>
                        <span className="text-sm font-medium text-foreground truncate">{order.clientName}</span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate mt-0.5">{servicesLabel(order)}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <StatusBadge status={order.status} />
                        <span className="text-xs"><OrderDate order={order} /></span>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-foreground whitespace-nowrap tabular">{formatCurrency(order.total)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      <div className="lg:hidden h-16" aria-hidden="true" />

      <NewOrderFab />
    </div>
  );
}

function FirstOrderEmptyState({ hasClients, hasServices }: { hasClients: boolean; hasServices: boolean }) {
  // Uma OS precisa de um cliente e de pelo menos um serviço do catálogo.
  const steps = [
    { done: hasClients, label: "Cadastre um cliente", to: "/clientes/novo" },
    { done: hasServices, label: "Cadastre os serviços que você oferece", to: "/servicos/novo" },
  ];
  const ready = hasClients && hasServices;

  return (
    <div className="card-elevated p-8 lg:p-10 text-center">
      <div className="w-12 h-12 rounded-full bg-accent text-accent-foreground flex items-center justify-center mx-auto">
        <ClipboardList className="w-6 h-6" />
      </div>
      <h2 className="text-lg font-semibold text-foreground mt-4">Nenhuma ordem de serviço ainda</h2>
      <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
        {ready
          ? "Abra a primeira OS para começar a acompanhar o andamento dos serviços."
          : "Antes da primeira OS, deixe pronto o que ela precisa:"}
      </p>

      {!ready && (
        <ol className="mt-5 max-w-xs mx-auto space-y-2 text-left">
          {steps.map((step, index) => (
            <li key={step.to}>
              {step.done ? (
                <span className="flex items-center gap-3 h-11 px-3 rounded-md text-sm text-muted-foreground line-through">
                  <span className="w-6 h-6 rounded-full bg-status-finished-bg text-status-finished-fg flex items-center justify-center"><Check className="w-3.5 h-3.5" aria-hidden="true" /></span>
                  {step.label}
                </span>
              ) : (
                <Link to={step.to} className="flex items-center gap-3 h-11 px-3 rounded-md border border-border text-sm font-medium text-foreground hover:bg-muted">
                  <span className="w-6 h-6 rounded-full bg-secondary text-xs font-semibold flex items-center justify-center">{index + 1}</span>
                  {step.label}
                </Link>
              )}
            </li>
          ))}
        </ol>
      )}

      {ready && (
        <Button asChild className="mt-5 h-10">
          <Link to="/ordens/nova">
            <Plus className="w-4 h-4 mr-1.5" />
            Abrir primeira OS
          </Link>
        </Button>
      )}
    </div>
  );
}
