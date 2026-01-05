import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TopNav } from "@/components/layout/TopNav";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { TrendingUp, ClipboardList, Users, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const chartData = [
  { month: "Ago", value: 4200 },
  { month: "Set", value: 5800 },
  { month: "Out", value: 4900 },
  { month: "Nov", value: 7200 },
  { month: "Dez", value: 8100 },
  { month: "Jan", value: 6500 },
];

const topClients = [
  { id: 1, name: "Maria Silva", orders: 12, total: 4500 },
  { id: 2, name: "João Santos", orders: 8, total: 3200 },
  { id: 3, name: "Ana Oliveira", orders: 7, total: 2800 },
  { id: 4, name: "Carlos Mendes", orders: 5, total: 2100 },
  { id: 5, name: "Paula Costa", orders: 4, total: 1600 },
];

type FilterPeriod = "day" | "week" | "month";

export default function DashboardPage() {
  const navigate = useNavigate();
  const [period, setPeriod] = useState<FilterPeriod>("month");

  const totalMonth = 12450.0;
  const totalOrders = 47;

  const handleLogout = () => {
    // TODO: Implementar lógica de logout com autenticação
    navigate("/");
  };

  return (
    <div className="page-container bg-background">
      <TopNav
        title="Dashboard"
        rightAction={
          <Button
            size="icon"
            variant="ghost"
            onClick={handleLogout}
            className="text-muted-foreground hover:text-destructive"
          >
            <LogOut className="w-5 h-5" />
          </Button>
        }
      />

      <div className="content-container space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-4 animate-slide-up">
          <div className="card-elevated p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs font-medium">Total do mês</span>
            </div>
            <p className="text-2xl font-bold text-foreground">
              R$ {totalMonth.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
          </div>

          <div className="card-elevated p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <ClipboardList className="w-4 h-4" />
              <span className="text-xs font-medium">Qtd. de ordens</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{totalOrders}</p>
          </div>
        </div>

        {/* Chart */}
        <div className="card-elevated p-4 animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <h3 className="text-sm font-semibold text-foreground mb-4">Faturamento (últimos 6 meses)</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(196, 37%, 24%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(196, 37%, 24%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "hsl(0, 0%, 45%)" }}
                />
                <YAxis hide />
                <Tooltip
                  contentStyle={{
                    background: "hsl(0, 0%, 100%)",
                    border: "1px solid hsl(0, 0%, 85%)",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  formatter={(value: number) => [`R$ ${value.toLocaleString("pt-BR")}`, "Faturamento"]}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="hsl(196, 37%, 24%)"
                  strokeWidth={2}
                  fill="url(#colorValue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Clients */}
        <div className="card-elevated animate-slide-up" style={{ animationDelay: "0.2s" }}>
          <div className="p-4 border-b border-border/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold text-foreground">Top Clientes</h3>
              </div>
              <div className="flex gap-1 p-1 bg-secondary rounded-lg">
                {(["day", "week", "month"] as FilterPeriod[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className={cn(
                      "px-3 py-1 text-xs font-medium rounded-md transition-colors",
                      period === p
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {p === "day" ? "Dia" : p === "week" ? "Semana" : "Mês"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="divide-y divide-border/50">
            {topClients.map((client, index) => (
              <div
                key={client.id}
                className="flex items-center justify-between p-4 hover:bg-secondary/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-xs font-bold text-primary">{index + 1}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{client.name}</p>
                    <p className="text-xs text-muted-foreground">{client.orders} ordens</p>
                  </div>
                </div>
                <p className="text-sm font-semibold text-foreground">
                  R$ {client.total.toLocaleString("pt-BR")}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
