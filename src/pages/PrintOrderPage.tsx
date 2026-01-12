import { useParams, useNavigate } from "react-router-dom";
import { TopNav } from "@/components/layout/TopNav";
import { Button } from "@/components/ui/button";
import { Printer, ArrowLeft } from "lucide-react";
import { ServiceOrderPrint } from "@/components/print/ServiceOrderPrint";
import { ServiceOrder } from "@/types";

// Reusing mock data for simplicity, ideally fetched from a store or API
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
    services: [{ name: "Montagem de Móveis", quantity: 2, price: 60.0 }],
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

export default function PrintOrderPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const order = id ? mockOrders[id] : null;

  const handlePrint = () => {
    window.print();
  };

  if (!order) {
    return (
      <div className="page-container bg-background">
        <TopNav title="Imprimir Ordem" showBack />
        <div className="content-container">
          <div className="text-center py-16">
            <p className="text-muted-foreground">Ordem não encontrada</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen print:min-h-0 bg-gray-100 dark:bg-zinc-950 flex flex-col">
      {/* Header - Hidden on Print */}
      <div className="bg-background border-b border-border p-4 flex items-center justify-between print:hidden shadow-sm z-10">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <span className="font-semibold text-lg">Pré-visualização de Impressão</span>
        </div>
        <Button onClick={handlePrint} className="btn-primary">
          <Printer className="w-4 h-4 mr-2" />
          Imprimir
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 md:p-8 flex items-start justify-center print:p-0 print:overflow-visible print:block">
        <div className="print:w-full">
          <ServiceOrderPrint order={order} />
        </div>
      </div>

      {/* Print Specific Styles */}
      <style>{`
        @media print {
          @page {
            margin: 0;
            size: auto; /* thermal printers usually handle 'auto' as continuous, but some need explicit height hints */
          }
          html, body {
            height: auto !important;
            overflow: visible !important;
            background: white;
            color: black;
          }
        }
      `}</style>
    </div>
  );
}
