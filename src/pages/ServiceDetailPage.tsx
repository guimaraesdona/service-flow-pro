import { useParams, useNavigate } from "react-router-dom";
import { TopNav } from "@/components/layout/TopNav";
import { Button } from "@/components/ui/button";
import { Edit, Wrench, DollarSign, FileText } from "lucide-react";

import { useServices } from "@/hooks/useServices";

export default function ServiceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { services, isLoading } = useServices();

  const service = services?.find(s => s.id === id);

  if (isLoading) {
    return (
      <div className="page-container bg-background">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="page-container bg-background">
        <TopNav title="Serviço" showBack />
        <div className="content-container">
          <div className="text-center py-16">
            <p className="text-muted-foreground">Serviço não encontrado</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container bg-background">
      <TopNav
        title="Serviço"
        showBack
        rightAction={
          <Button
            size="icon"
            variant="ghost"
            onClick={() => navigate(`/servicos/${id}/editar`)}
            className="text-primary hover:text-primary/80"
          >
            <Edit className="w-5 h-5" />
          </Button>
        }
      />

      <div className="content-container space-y-6">
        {/* Header */}
        <div className="card-elevated p-6 text-center animate-fade-in">
          <div className="w-20 h-20 rounded-xl bg-accent/20 flex items-center justify-center mx-auto mb-4">
            <Wrench className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-foreground">{service.name}</h2>
        </div>

        {/* Price */}
        <div className="card-elevated p-4 animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-status-finished/20 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-status-finished" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Valor base</p>
              <p className="text-2xl font-bold text-foreground">
                R$ {service.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="card-elevated p-4 animate-slide-up" style={{ animationDelay: "0.2s" }}>
          <h3 className="text-sm font-semibold text-foreground mb-3">Descrição</h3>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
              <FileText className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {service.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
