import { Link, useParams, useNavigate } from "react-router-dom";
import { TopNav } from "@/components/layout/TopNav";
import { DesktopHeader } from "@/components/layout/DesktopHeader";
import { Edit, User, FileText, Wrench, Printer, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useOrders } from "@/hooks/useOrders";
import { useClients } from "@/hooks/useClients";

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { orders, isLoading } = useOrders();
  const { clients } = useClients();

  const order = orders?.find(o => o.id === id);

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="page-container bg-background">
        <TopNav title="Ordem" showBack />
        <div className="content-container">
          <div className="text-center py-16">
            <p className="text-muted-foreground">Ordem não encontrada</p>
          </div>
        </div>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="page-container bg-background">
      {/* Desktop Header */}
      <div className="hidden lg:block">
        <DesktopHeader
          title={`Detalhes da Ordem #${order.number || order.id.slice(0, 4)}`}
          actions={
            <div className="flex gap-2">
              <Link to={`/ordens/${id}/imprimir`}>
                <Button variant="outline">
                  <Printer className="w-4 h-4 mr-2" />
                  Imprimir
                </Button>
              </Link>
              <Link to={`/ordens/${id}/editar`}>
                <Button className="btn-primary">
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </Button>
              </Link>
            </div>
          }
        />
      </div>

      <div className="lg:hidden">
        <TopNav
          title={`Ordem #${order.number || order.id.slice(0, 4)}`}
          showBack
          rightAction={
            <div className="flex gap-1">
              <Link to={`/ordens/${id}/imprimir`}>
                <Button size="icon" variant="ghost" className="text-primary hover:text-primary/80">
                  <Printer className="w-5 h-5" />
                </Button>
              </Link>
              <Link to={`/ordens/${id}/editar`}>
                <Button size="icon" variant="ghost" className="text-primary hover:text-primary/80">
                  <Edit className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          }
        />
      </div>

      <div className="content-container space-y-6">
        {/* Header */}
        <div className="card-elevated p-6 text-center animate-fade-in">
          <div className="w-20 h-20 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <span className="text-primary text-xl font-bold">#{order.number || order.id.slice(0, 4)}</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <StatusBadge status={order.status} />
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Prioridade: {order.priority}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-2">{formatDate(order.date)}</p>
        </div>

        {/* Client */}
        <div className="card-elevated p-4 animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <h3 className="text-sm font-semibold text-foreground mb-3">Cliente</h3>
          <button
            onClick={() => navigate(`/clientes/${order.clientId}`)}
            className="flex items-center gap-3 w-full hover:bg-secondary/30 -m-2 p-2 rounded-lg transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-foreground">{order.clientName}</p>
              <p className="text-xs text-muted-foreground">Ver detalhes</p>
            </div>
          </button>
        </div>

        {/* Services */}
        <div className="card-elevated p-4 animate-slide-up" style={{ animationDelay: "0.15s" }}>
          <h3 className="text-sm font-semibold text-foreground mb-3">Serviços</h3>
          <div className="space-y-3">
            {order.services.map((service, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center">
                    <Wrench className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-foreground">{service.name}</p>
                    <p className="text-xs text-muted-foreground">Qtd: {service.quantity}</p>
                  </div>
                </div>
                <p className="text-sm font-medium text-foreground">
                  R$ {(service.price * service.quantity).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Total */}
        <div className="card-elevated p-4 animate-slide-up" style={{ animationDelay: "0.2s" }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-status-finished/20 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-status-finished" />
              </div>
              <p className="text-sm text-muted-foreground">Valor total</p>
            </div>
            <p className="text-2xl font-bold text-foreground">
              R$ {order.total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
          </div>
          {(order.discount || 0) > 0 && (
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-border">
              <p className="text-sm text-status-finished">Desconto</p>
              <p className="text-sm font-bold text-status-finished">- R$ {order.discount!.toFixed(2)}</p>
            </div>
          )}
        </div>

        {/* Description/Observations */}
        {order.description && (
          <div className="card-elevated p-4 animate-slide-up" style={{ animationDelay: "0.25s" }}>
            <h3 className="text-sm font-semibold text-foreground mb-3">Observações</h3>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                <FileText className="w-4 h-4 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {order.description}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
