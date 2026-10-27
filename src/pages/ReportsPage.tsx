import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { TopNav } from "@/components/layout/TopNav";
import { DesktopHeader } from "@/components/layout/DesktopHeader";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useClients } from "@/hooks/useClients";
import { useOrders } from "@/hooks/useOrders";
import { formatCurrency, formatOrderNumber } from "@/lib/formatters";

const months = [
  { value: "01", label: "Janeiro" },
  { value: "02", label: "Fevereiro" },
  { value: "03", label: "Março" },
  { value: "04", label: "Abril" },
  { value: "05", label: "Maio" },
  { value: "06", label: "Junho" },
  { value: "07", label: "Julho" },
  { value: "08", label: "Agosto" },
  { value: "09", label: "Setembro" },
  { value: "10", label: "Outubro" },
  { value: "11", label: "Novembro" },
  { value: "12", label: "Dezembro" },
];

const currentYear = new Date().getFullYear();
const years = [currentYear.toString(), (currentYear - 1).toString(), (currentYear - 2).toString()];

const shortDate = (date: string) => new Date(date).toLocaleDateString("pt-BR");

export default function ReportsPage() {
  const { clients } = useClients();
  const { orders } = useOrders();

  const [selectedMonth, setSelectedMonth] = useState(String(new Date().getMonth() + 1).padStart(2, "0"));
  const [selectedYear, setSelectedYear] = useState(String(currentYear));
  const [selectedClient, setSelectedClient] = useState("all");

  // OS abertas no mês escolhido, mais recentes primeiro.
  const filteredOrders = useMemo(() => {
    if (!orders) return [];

    return orders
      .filter((order) => {
        const orderDate = new Date(order.date);
        const monthMatch = String(orderDate.getMonth() + 1).padStart(2, "0") === selectedMonth;
        const yearMatch = String(orderDate.getFullYear()) === selectedYear;
        const clientMatch = selectedClient === "all" || order.clientId === selectedClient;
        return monthMatch && yearMatch && clientMatch;
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [orders, selectedMonth, selectedYear, selectedClient]);

  // Canceladas contam como OS do período, mas não entram no faturamento.
  const metrics = useMemo(() => {
    const validOrders = filteredOrders.filter((o) => o.status !== "cancelled");
    return {
      totalOrders: filteredOrders.length,
      totalRevenue: validOrders.reduce((acc, order) => acc + order.total, 0),
      finishedCount: filteredOrders.filter((o) => o.status === "finished").length,
      pendingCount: filteredOrders.filter((o) => o.status !== "finished" && o.status !== "cancelled").length,
    };
  }, [filteredOrders]);

  const stats = [
    { label: "Ordens", value: String(metrics.totalOrders) },
    { label: "Faturamento", value: formatCurrency(metrics.totalRevenue) },
    { label: "Finalizadas", value: String(metrics.finishedCount) },
    { label: "Pendentes", value: String(metrics.pendingCount) },
  ];

  const periodLabel = `${months.find((m) => m.value === selectedMonth)?.label ?? ""} de ${selectedYear}`;

  return (
    <div className="page-container bg-background">
      <div className="lg:hidden">
        <TopNav title="Relatórios" />
      </div>
      <DesktopHeader title="Relatórios" />

      <div className="content-container space-y-5">
        {/* Filtros */}
        <section aria-label="Filtros" className="grid grid-cols-2 lg:grid-cols-[10rem_8rem_minmax(0,18rem)] gap-3">
          <div className="space-y-2">
            <Label htmlFor="report-month">Mês</Label>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger id="report-month" className="bg-card">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {months.map((month) => (
                  <SelectItem key={month.value} value={month.value}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="report-year">Ano</Label>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger id="report-year" className="bg-card">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="col-span-2 lg:col-span-1 space-y-2">
            <Label htmlFor="report-client">Cliente</Label>
            <Select value={selectedClient} onValueChange={setSelectedClient}>
              <SelectTrigger id="report-client" className="bg-card">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os clientes</SelectItem>
                {clients?.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </section>

        {/* Resumo do período */}
        <section aria-labelledby="report-summary" className="space-y-2">
          <h2 id="report-summary" className="px-1 text-sm font-semibold text-foreground">
            {periodLabel}
          </h2>
          <dl className="card-elevated grid grid-cols-2 lg:grid-cols-4 [&>div]:border-border max-lg:[&>div:nth-child(-n+2)]:border-b max-lg:[&>div:nth-child(odd)]:border-r lg:[&>div:not(:last-child)]:border-r">
            {stats.map((stat) => (
              <div key={stat.label} className="p-4 lg:p-5">
                <dt className="text-xs font-medium text-muted-foreground">{stat.label}</dt>
                <dd className="mt-1 text-xl lg:text-2xl font-semibold tracking-tight text-foreground tabular">{stat.value}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* Ordens do período */}
        <section aria-labelledby="report-orders" className="space-y-2">
          <h2 id="report-orders" className="px-1 text-sm font-semibold text-foreground">
            Ordens do período
          </h2>
          {filteredOrders.length === 0 ? (
            <div className="card-elevated p-8 text-center">
              <p className="font-medium text-foreground">Nenhuma OS em {periodLabel.toLowerCase()}</p>
              <p className="text-sm text-muted-foreground mt-1">Escolha outro mês ou cliente.</p>
            </div>
          ) : (
            <ul className="card-elevated divide-y divide-border">
              {filteredOrders.map((order) => (
                <li key={order.id}>
                  <Link
                    to={`/ordens/${order.id}`}
                    className="flex items-center gap-3 px-4 py-3 active:bg-muted/60 lg:hover:bg-muted/40"
                  >
                    <span className="w-14 shrink-0 text-sm font-semibold text-foreground tabular">{formatOrderNumber(order)}</span>
                    <span className="flex-1 min-w-0">
                      <span className="block text-sm font-medium text-foreground truncate">{order.clientName}</span>
                      <span className="flex items-center gap-2 mt-1 lg:hidden">
                        <StatusBadge status={order.status} />
                        <span className="text-xs text-muted-foreground tabular">{shortDate(order.date)}</span>
                      </span>
                    </span>
                    <span className="hidden lg:block w-28 shrink-0 text-sm text-muted-foreground tabular">{shortDate(order.date)}</span>
                    <span className="hidden lg:block w-32 shrink-0">
                      <StatusBadge status={order.status} />
                    </span>
                    <span className="w-24 lg:w-28 shrink-0 text-right text-sm font-semibold text-foreground tabular whitespace-nowrap">
                      {formatCurrency(order.total)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <p className="px-1 text-xs text-muted-foreground">
          Exportar em PDF ou Excel ainda não está disponível. Por enquanto, imprima cada OS pela tela dela.
        </p>
      </div>
    </div>
  );
}
