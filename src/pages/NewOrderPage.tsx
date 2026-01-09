import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TopNav } from "@/components/layout/TopNav";
import { DesktopHeader } from "@/components/layout/DesktopHeader";
import { Camera, Plus, Minus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { CustomFieldsRenderer, CustomFieldValue } from "@/components/form/CustomFieldsRenderer";

interface ServiceItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
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

export default function NewOrderPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedClient, setSelectedClient] = useState("");
  const [expectedDate, setExpectedDate] = useState("");
  const [observations, setObservations] = useState("");
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [customFieldValues, setCustomFieldValues] = useState<CustomFieldValue[]>([]);

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
        title: "Ordem criada!",
        description: "Ordem de serviço cadastrada com sucesso.",
      });
      navigate("/ordens");
    }, 1000);
  };

  return (
    <div className="page-container bg-background">
      {/* Mobile Header */}
      <div className="lg:hidden">
        <TopNav title="Nova Ordem" showBack />
      </div>

      {/* Desktop Header */}
      <div className="hidden lg:block">
        <DesktopHeader title="Nova Ordem de Serviço" />
      </div>

      <div className="content-container">
        <form onSubmit={handleSubmit} className="space-y-5 animate-slide-up lg:grid lg:grid-cols-2 lg:gap-8 lg:space-y-0">
          {/* Left Column - Basic Info */}
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

          {/* Right Column - Additional Info */}
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
            <CustomFieldsRenderer
              entityType="order"
              values={customFieldValues}
              onValuesChange={setCustomFieldValues}
            />

            <Button
              type="submit"
            className="w-full btn-primary mt-6"
            disabled={isLoading}
          >
              {isLoading ? "Salvando..." : "Cadastrar"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
