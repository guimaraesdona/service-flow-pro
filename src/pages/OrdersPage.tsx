import { useState } from "react";
import { Link } from "react-router-dom";
import { TopNav } from "@/components/layout/TopNav";
import { DesktopHeader } from "@/components/layout/DesktopHeader";
import { Plus, Search, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { OrderStatus } from "@/types";
import { useOrders } from "@/hooks/useOrders";

const statusColors: Record<OrderStatus, string> = {
  start: "bg-status-start",
  progress: "bg-status-progress",
  waiting: "bg-status-waiting",
  cancelled: "bg-status-cancelled",
  finished: "bg-status-finished",
};

export default function OrdersPage() {
  const [search, setSearch] = useState("");
  const { orders, isLoading } = useOrders();

  const filteredOrders = orders.filter((o) =>
    o.clientName.toLowerCase().includes(search.toLowerCase()) ||
    o.id.includes(search)
  );

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
    });
  };

  return (
    <div className="page-container bg-background">
      {/* Mobile Header */}
      <div className="lg:hidden">
        <TopNav
          title="Ordens de Serviço"
          rightAction={
            <Link to="/ordens/nova">
              <Button size="icon" variant="ghost" className="text-primary hover:text-primary/80">
                <Plus className="w-5 h-5" />
              </Button>
            </Link>
          }
        />
      </div>

      {/* Desktop Header */}
      <div className="hidden lg:block">
        <DesktopHeader
          title="Ordens de Serviço"
          actions={
            <Link to="/ordens/nova">
              <Button className="btn-primary">
                <Plus className="w-4 h-4 mr-2" />
                Nova Ordem
              </Button>
            </Link>
          }
        />
      </div>

      <div className="content-container">
        {/* Search */}
        <div className="relative mb-6 animate-fade-in">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar ordens..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 input-field"
          />
        </div>

        {/* Orders List */}
        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filteredOrders.length > 0 ? (
          <div className="space-y-3 lg:grid lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 lg:gap-4 lg:space-y-0">
            {filteredOrders.map((order, index) => (
              <Link
                key={order.id}
                to={`/ordens/${order.id}`}
                className="card-elevated p-4 flex items-center gap-4 hover:shadow-soft transition-all animate-slide-up"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {/* Status indicator */}
                <div className={`w-12 h-12 rounded-xl ${statusColors[order.status]} flex items-center justify-center flex-shrink-0`}>
                  <span className="text-white text-sm font-bold">#{order.number || order.id.slice(0, 4)}</span>
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground truncate">{order.clientName}</h3>
                  <p className="text-sm text-muted-foreground truncate">{order.services.map(s => s.name).join(", ")}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <StatusBadge status={order.status} />
                    <span className="flex items-center justify-center gap-1 text-xs text-muted-foreground whitespace-nowrap leading-none">
                      <Calendar className="w-3 h-3" />
                      <span className="mt-[3px]">{formatDate(order.date)}</span>
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-sm font-bold text-foreground">
                    R$ {order.total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 animate-fade-in">
            <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Nenhuma ordem</h3>
            <p className="text-muted-foreground mb-6">Crie sua primeira ordem de serviço</p>
            <Link to="/ordens/nova">
              <Button className="btn-primary">
                <Plus className="w-4 h-4 mr-2" />
                Nova Ordem
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
