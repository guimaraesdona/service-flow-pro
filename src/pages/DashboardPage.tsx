import { useMemo } from "react";
import { Link } from "react-router-dom";
import { TopNav } from "@/components/layout/TopNav";
import { DesktopHeader } from "@/components/layout/DesktopHeader";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Plus, ChevronRight } from "lucide-react";
import { NewOrderFab } from "@/components/layout/NewOrderFab";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useOrders } from "@/hooks/useOrders";
import { formatCurrency, formatOrderNumber } from "@/lib/formatters";
import { STATUS_PLURAL, isOverdue } from "@/lib/orderStatus";
import { OrderStatus, ServiceOrder } from "@/types";
import { cn } from "@/lib/utils";

const SUMMARY: { status: OrderStatus; dot: string }[] = [
  { status: "start", dot: "bg-status-start" },
  { status: "progress", dot: "bg-status-progress" },
  { status: "waiting", dot: "bg-status-waiting" },
  { status: "finished", dot: "bg-status-finished" },
];

const compactCurrency = (value: number) =>
  value >= 1000 ? `${(value / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} mil` : String(value);

const shortDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }).replace(".", "");

// OS que pedem atenção: em andamento primeiro, depois as agendadas mais próximas.
const attentionRank = (o: ServiceOrder) => (o.status === "progress" ? 0 : o.status === "waiting" ? 1 : 2);

export default function DashboardPage() {
  const { orders } = useOrders();

  const counts = useMemo(() => {
    const result: Record<OrderStatus, number> = { start: 0, progress: 0, waiting: 0, finished: 0, cancelled: 0 };
    orders.forEach((o) => result[o.status]++);
    return result;
  }, [orders]);

  const attention = useMemo(
    () =>
      orders
        .filter((o) => o.status === "start" || o.status === "progress" || o.status === "waiting")
        .sort((a, b) => {
          const rank = attentionRank(a) - attentionRank(b);
          if (rank !== 0) return rank;
          return new Date(a.scheduledAt ?? a.date).getTime() - new Date(b.scheduledAt ?? b.date).getTime();
        })
        .slice(0, 6),
    [orders],
  );

  // Valor das OS abertas em cada um dos últimos 6 meses, sem as canceladas.
  const revenue = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
      const value = orders
        .filter((o) => {
          const date = new Date(o.date);
          return date.getMonth() === d.getMonth() && date.getFullYear() === d.getFullYear() && o.status !== "cancelled";
        })
        .reduce((acc, o) => acc + o.total, 0);
      const label = d.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "");
      return { month: label.charAt(0).toUpperCase() + label.slice(1), value };
    });
  }, [orders]);

  const thisMonth = revenue[revenue.length - 1]?.value ?? 0;
  const lastMonth = revenue[revenue.length - 2]?.value ?? 0;
  const monthName = new Date().toLocaleDateString("pt-BR", { month: "long" });

  return (
    <div className="page-container bg-background">
      <div className="lg:hidden">
        <TopNav title="Início" />
      </div>
      <DesktopHeader
        title="Início"
        actions={
          <Button asChild className="h-9">
            <Link to="/ordens/nova">
              <Plus className="w-4 h-4 mr-1.5" />
              Nova OS
            </Link>
          </Button>
        }
      />

      <div className="content-container space-y-4 lg:space-y-6">
        {/* Resumo por status: cada número abre a lista filtrada */}
        <nav aria-label="Ordens por status" className="card-elevated grid grid-cols-2 lg:grid-cols-4 divide-border [&>*]:border-border max-lg:[&>*:nth-child(odd)]:border-r max-lg:[&>*:nth-child(-n+2)]:border-b lg:divide-x">
          {SUMMARY.map(({ status, dot }) => (
            <Link key={status} to={`/ordens?status=${status}`} className="group p-4 lg:p-5 hover:bg-muted/60 transition-colors">
              <span className="flex items-center gap-2 text-sm text-muted-foreground">
                <span aria-hidden="true" className={cn("w-2 h-2 rounded-full", dot)} />
                {STATUS_PLURAL[status]}
              </span>
              <span className="block mt-1 text-2xl font-semibold tracking-tight text-foreground tabular">{counts[status]}</span>
            </Link>
          ))}
        </nav>

        <div className="grid lg:grid-cols-5 gap-4 lg:gap-6 items-start">
          {/* OS que pedem atenção */}
          <section className="card-elevated lg:col-span-3">
            <div className="flex items-center justify-between px-4 h-12 border-b border-border">
              <h2 className="text-sm font-semibold text-foreground">Em aberto</h2>
              <Link to="/ordens" className="relative text-sm font-medium text-primary hover:underline underline-offset-4 after:absolute after:-inset-x-2 after:-inset-y-3 after:content-['']">Ver todas</Link>
            </div>
            {attention.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-sm text-muted-foreground">Nenhuma OS aberta, em andamento ou aguardando.</p>
                <Button asChild variant="outline" className="mt-3 h-9">
                  <Link to="/ordens/nova">Abrir uma OS</Link>
                </Button>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {attention.map((order) => (
                  <li key={order.id}>
                    <Link to={`/ordens/${order.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/60 transition-colors">
                      <span className="w-14 text-sm font-semibold text-foreground tabular">{formatOrderNumber(order)}</span>
                      <span className="flex-1 min-w-0">
                        <span className="block text-sm font-medium text-foreground truncate">{order.clientName}</span>
                        <span className="block text-xs text-muted-foreground truncate">
                          {order.scheduledAt ? (
                            <span className={isOverdue(order) ? "font-medium text-destructive" : undefined}>
                              {isOverdue(order) ? "Atrasada" : "Agendada"} {shortDate(order.scheduledAt)}
                            </span>
                          ) : (
                            `Aberta ${shortDate(order.date)}`
                          )}
                        </span>
                      </span>
                      <span className="flex flex-col items-end gap-1 sm:flex-row sm:items-center sm:gap-3">
                        <span className="text-sm text-foreground tabular whitespace-nowrap">{formatCurrency(order.total)}</span>
                        <StatusBadge status={order.status} />
                      </span>
                      <ChevronRight className="w-4 h-4 text-muted-foreground hidden sm:block" aria-hidden="true" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Faturamento */}
          <section className="card-elevated lg:col-span-2 p-4 lg:p-5">
            <h2 className="text-sm font-semibold text-foreground">Faturamento</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Valor das OS abertas no mês, sem as canceladas</p>
            <p className="mt-3 text-2xl font-semibold tracking-tight text-foreground tabular">{formatCurrency(thisMonth)}</p>
            <p className="text-sm text-muted-foreground">
              em {monthName}
              {lastMonth > 0 && (
                <> · {thisMonth >= lastMonth ? "+" : "−"}{Math.abs(Math.round(((thisMonth - lastMonth) / lastMonth) * 100))}% sobre o mês anterior</>
              )}
            </p>
            {revenue.every((r) => r.value === 0) ? (
              <p className="mt-4 h-48 flex items-center justify-center rounded-md border border-dashed border-border text-sm text-muted-foreground">
                Sem OS nos últimos 6 meses
              </p>
            ) : (
            <div className="h-48 mt-4 text-muted-foreground" role="img" aria-label={`Faturamento dos últimos 6 meses: ${revenue.map((r) => `${r.month} ${formatCurrency(r.value)}`).join(", ")}`}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenue} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "currentColor" }} />
                  <YAxis width={52} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "currentColor" }} tickFormatter={compactCurrency} />
                  <Tooltip
                    cursor={{ fill: "hsl(var(--muted))" }}
                    contentStyle={{
                      background: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "13px",
                      color: "hsl(var(--popover-foreground))",
                    }}
                    formatter={(value: number) => [formatCurrency(value), "Faturamento"]}
                  />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={36} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            )}
          </section>
        </div>
      </div>

      <div className="lg:hidden h-16" aria-hidden="true" />
      <NewOrderFab />
    </div>
  );
}
