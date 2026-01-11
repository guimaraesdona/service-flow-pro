import { useParams, useNavigate } from "react-router-dom";
import { TopNav } from "@/components/layout/TopNav";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Edit, User, Calendar, DollarSign, FileText, Wrench, Printer } from "lucide-react";
import { ServiceOrder, OrderStatus } from "@/types";

const mockOrders: Record<string, ServiceOrder> = {
  "001": {
    id: "001",
    clientName: "Maria Silva",
    clientId: "1",
    services: [{ name: "Manutenção Preventiva", quantity: 1, price: 150.0 }],
    total: 150.0,
    date: "2025-01-05",
    status: "progress",
    priority: "high",
    description: "Manutenção anual do sistema de ar condicionado. Cliente solicitou agendamento para o período da tarde.",
    scheduledAt: "2025-01-10T14:00:00"
  },
  "002": {
    id: "002",
    clientName: "João Santos",
    clientId: "2",
    services: [
      { name: "Instalação Elétrica", quantity: 1, price: 250.0 },
      { name: "Pintura", quantity: 1, price: 350.0 },
    ],
    total: 600.0,
    date: "2025-01-04",
    status: "waiting",
    priority: "normal",
    discount: 50.0,
    description: "Aguardando aprovação do orçamento pelo cliente."
  },
  "003": {
    id: "003",
    clientName: "Ana Oliveira",
    clientId: "3",
    services: [{ name: "Reparo Hidráulico", quantity: 1, price: 180.0 }],
    total: 180.0,
    date: "2025-01-03",
    status: "finished",
    priority: "low"
  },
  "004": {
    id: "004",
    clientName: "Carlos Mendes",
    clientId: "4",
    services: [{ name: "Montagem de Móveis", quantity: 2, price: 60.0 }], // Fixed price to match total 120 (2 * 60)
    total: 120.0,
    date: "2025-01-02",
    status: "start",
    priority: "normal",
    description: "Montagem de 2 guarda-roupas."
  },
  "005": {
    id: "005",
    clientName: "Paula Costa",
    clientId: "5",
    services: [{ name: "Pintura", quantity: 1, price: 350.0 }],
    total: 350.0,
    date: "2025-01-01",
    status: "cancelled",
    priority: "high",
    description: "Cliente cancelou por motivos pessoais."
  },
};

const statusColors: Record<OrderStatus, string> = {
  start: "bg-status-start",
  progress: "bg-status-progress",
  waiting: "bg-status-waiting",
  cancelled: "bg-status-cancelled",
  finished: "bg-status-finished",
};

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const order = id ? mockOrders[id] : null;

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
      <TopNav
        title={`Ordem #${order.id}`}
        showBack
        rightAction={
          <div className="flex gap-2">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => navigate(`/ordens/${id}/imprimir`)}
              className="text-primary hover:text-primary/80"
            >
              <Printer className="w-5 h-5" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => navigate(`/ordens/${id}/editar`)}
              className="text-primary hover:text-primary/80"
            >
              <Edit className="w-5 h-5" />
            </Button>
          </div>
        }
      />

      <div className="content-container space-y-6">
        {/* Header */}
        <div className="card-elevated p-6 text-center animate-fade-in">
          <div className={`w-20 h-20 rounded-xl ${statusColors[order.status]} flex items-center justify-center mx-auto mb-4`}>
            <span className="text-white text-xl font-bold">#{order.id}</span>
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
