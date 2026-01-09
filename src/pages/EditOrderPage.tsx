import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { TopNav } from "@/components/layout/TopNav";
import { DesktopHeader } from "@/components/layout/DesktopHeader";
import { Camera, Plus, Minus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { OrderStatus } from "@/components/ui/StatusBadge";
import { 
  CustomFieldsManager, 
  CustomField, 
  CustomFieldValue,
  getStoredCustomFields 
} from "@/components/order/CustomFieldsManager";

interface ServiceItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  clientName: string;
  clientId: string;
  services: { name: string; quantity: number; price: number; id?: string }[];
  total: number;
  date: string;
  status: OrderStatus;
  observations?: string;
}

const availableServices = [
  { id: "1", name: "Manutenção Preventiva", price: 150.0 },
  { id: "2", name: "Instalação Elétrica", price: 250.0 },
  { id: "3", name: "Reparo Hidráulico", price: 180.0 },
  { id: "4", name: "Pintura", price: 350.0 },
  { id: "5", name: "Montagem de Móveis", price: 120.0 },
];

const clients = [
  { id: "1", name: "Maria Silva" },
  { id: "2", name: "João Santos" },
  { id: "3", name: "Ana Oliveira" },
  { id: "4", name: "Carlos Mendes" },
  { id: "5", name: "Paula Costa" },
];

const statusOptions: { value: OrderStatus; label: string }[] = [
  { value: "start", label: "Iniciar" },
  { value: "progress", label: "Em andamento" },
  { value: "waiting", label: "Aguardando" },
  { value: "cancelled", label: "Cancelado" },
  { value: "finished", label: "Finalizado" },
];

const mockOrders: Record<string, Order> = {
  "001": {
    id: "001",
    clientName: "Maria Silva",
    clientId: "1",
    services: [{ name: "Manutenção Preventiva", quantity: 1, price: 150.0, id: "1" }],
    total: 150.0,
    date: "2025-01-05",
    status: "progress",
    observations: "Cliente solicitou agendamento para o período da tarde.",
  },
  "002": {
    id: "002",
    clientName: "João Santos",
    clientId: "2",
    services: [
      { name: "Instalação Elétrica", quantity: 1, price: 250.0, id: "2" },
      { name: "Pintura", quantity: 1, price: 350.0, id: "4" },
    ],
    total: 600.0,
    date: "2025-01-04",
    status: "waiting",
    observations: "Aguardando aprovação do orçamento pelo cliente.",
  },
  "003": {
    id: "003",
    clientName: "Ana Oliveira",
    clientId: "3",
    services: [{ name: "Reparo Hidráulico", quantity: 1, price: 180.0, id: "3" }],
    total: 180.0,
    date: "2025-01-03",
    status: "finished",
  },
  "004": {
    id: "004",
    clientName: "Carlos Mendes",
    clientId: "4",
    services: [{ name: "Montagem de Móveis", quantity: 2, price: 120.0, id: "5" }],
    total: 240.0,
    date: "2025-01-02",
    status: "start",
    observations: "Montagem de 2 guarda-roupas.",
  },
  "005": {
    id: "005",
    clientName: "Paula Costa",
    clientId: "5",
    services: [{ name: "Pintura", quantity: 1, price: 350.0, id: "4" }],
    total: 350.0,
    date: "2025-01-01",
    status: "cancelled",
    observations: "Cliente cancelou por motivos pessoais.",
  },
};

export default function EditOrderPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedClient, setSelectedClient] = useState("");
  const [expectedDate, setExpectedDate] = useState("");
  const [observations, setObservations] = useState("");
  const [status, setStatus] = useState<OrderStatus>("start");
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [customFieldValues, setCustomFieldValues] = useState<CustomFieldValue[]>([]);

  useEffect(() => {
    setCustomFields(getStoredCustomFields());
  }, []);

  useEffect(() => {
    if (id && mockOrders[id]) {
      const order = mockOrders[id];
      setSelectedClient(order.clientId);
      setExpectedDate(order.date);
      setObservations(order.observations || "");
      setStatus(order.status);
      setServices(
        order.services.map((s, index) => ({
          id: s.id || index.toString(),
          name: s.name,
          price: s.price,
          quantity: s.quantity,
        }))
      );
    }
  }, [id]);

  const order = id ? mockOrders[id] : null;

  if (!order) {
    return (
      <div className="page-container bg-background">
        <TopNav title="Editar Ordem" showBack />
        <div className="content-container">
          <div className="text-center py-16">
            <p className="text-muted-foreground">Ordem não encontrada</p>
          </div>
        </div>
      </div>
    );
  }

  const addService = (serviceId: string) => {
    const service = availableServices.find((s) => s.id === serviceId);
    if (!service) return;

    const existing = services.find((s) => s.id === serviceId);
    if (existing) {
      setServices(
        services.map((s) =>
          s.id === serviceId ? { ...s, quantity: s.quantity + 1 } : s
        )
      );
    } else {
      setServices([...services, { ...service, quantity: 1 }]);
    }
  };

  const updateQuantity = (serviceId: string, delta: number) => {
    setServices(
      services
        .map((s) =>
          s.id === serviceId ? { ...s, quantity: Math.max(0, s.quantity + delta) } : s
        )
        .filter((s) => s.quantity > 0)
    );
  };

  const removeService = (serviceId: string) => {
    setServices(services.filter((s) => s.id !== serviceId));
  };

  const total = services.reduce((acc, s) => acc + s.price * s.quantity, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedClient || services.length === 0) {
      toast({
        title: "Campos obrigatórios",
        description: "Selecione um cliente e adicione pelo menos um serviço.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Ordem atualizada!",
        description: "Ordem de serviço atualizada com sucesso.",
      });
      navigate(`/ordens/${id}`);
    }, 1000);
  };

  return (
    <div className="page-container bg-background">
      {/* Mobile Header */}
      <div className="lg:hidden">
        <TopNav title={`Editar Ordem #${id}`} showBack />
      </div>

      {/* Desktop Header */}
      <div className="hidden lg:block">
        <DesktopHeader title={`Editar Ordem de Serviço #${id}`} />
      </div>

      <div className="content-container">
        <form onSubmit={handleSubmit} className="space-y-5 animate-slide-up lg:grid lg:grid-cols-2 lg:gap-8 lg:space-y-0">
          {/* Left Column */}
          <div className="space-y-5">
            {/* Image */}
            <div className="flex justify-center mb-6 lg:justify-start">
              <button
                type="button"
                className="w-24 h-24 rounded-xl bg-secondary border-2 border-dashed border-border flex items-center justify-center hover:border-primary/50 transition-colors"
              >
                <Camera className="w-8 h-8 text-muted-foreground" />
              </button>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={(value) => setStatus(value as OrderStatus)}>
                <SelectTrigger className="input-field">
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Client */}
            <div className="space-y-2">
              <Label>Cliente *</Label>
              <Select value={selectedClient} onValueChange={setSelectedClient}>
                <SelectTrigger className="input-field">
                  <SelectValue placeholder="Selecione um cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Expected Date */}
            <div className="space-y-2">
              <Label htmlFor="expectedDate">Data Prevista</Label>
              <Input
                id="expectedDate"
                type="date"
                value={expectedDate}
                onChange={(e) => setExpectedDate(e.target.value)}
                className="input-field"
              />
            </div>

            {/* Add Services */}
            <div className="space-y-2">
              <Label>Adicionar Serviços *</Label>
              <Select onValueChange={addService}>
                <SelectTrigger className="input-field">
                  <SelectValue placeholder="Selecione um serviço" />
                </SelectTrigger>
                <SelectContent>
                  {availableServices.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.name} - R$ {service.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Selected Services */}
            {services.length > 0 && (
              <div className="space-y-2">
                <Label>Serviços Selecionados</Label>
                <div className="space-y-2">
                  {services.map((service) => (
                    <div
                      key={service.id}
                      className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">{service.name}</p>
                        <p className="text-xs text-muted-foreground">
                          R$ {service.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} x {service.quantity}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => updateQuantity(service.id, -1)}
                          className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center hover:bg-border transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-6 text-center text-sm font-medium">{service.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(service.id, 1)}
                          className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center hover:bg-border transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeService(service.id)}
                          className="w-8 h-8 rounded-full bg-destructive/10 text-destructive flex items-center justify-center hover:bg-destructive/20 transition-colors ml-2"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Total */}
            <div className="p-4 bg-primary/5 rounded-xl border border-primary/20">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Valor Total</span>
                <span className="text-xl font-bold text-primary">
                  R$ {total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-5">
            {/* Observations */}
            <div className="space-y-2">
              <Label htmlFor="observations">Observações</Label>
              <Textarea
                id="observations"
                placeholder="Anotações adicionais..."
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                className="min-h-24 bg-secondary/50 border-0 focus:ring-2 focus:ring-primary/20 resize-none"
              />
            </div>

            {/* Custom Fields */}
            <CustomFieldsManager
              fields={customFields}
              onFieldsChange={setCustomFields}
              values={customFieldValues}
              onValuesChange={setCustomFieldValues}
              editMode={true}
            />

            <Button
              type="submit"
              className="w-full btn-primary mt-6"
              disabled={isLoading}
            >
              {isLoading ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
