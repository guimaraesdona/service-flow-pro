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
import { CustomFieldsRenderer, CustomFieldValue } from "@/components/form/CustomFieldsRenderer";
import { useOrders } from "@/hooks/useOrders";
import { useClients } from "@/hooks/useClients";
import { useServices } from "@/hooks/useServices";
import { useStorage } from "@/hooks/useStorage";
import { useRef } from "react";
import { ServiceItem, OrderStatus, OrderPriority } from "@/types";
import { ImageUploader } from "@/components/form/ImageUploader";

const statusOptions: { value: OrderStatus; label: string }[] = [
  { value: "start", label: "Iniciar" },
  { value: "progress", label: "Em andamento" },
  { value: "waiting", label: "Aguardando" },
  { value: "cancelled", label: "Cancelado" },
  { value: "finished", label: "Finalizado" },
];

const priorityOptions: { value: OrderPriority; label: string }[] = [
  { value: "low", label: "Baixa" },
  { value: "normal", label: "Normal" },
  { value: "high", label: "Alta" },
];

export default function EditOrderPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { orders, updateOrder } = useOrders();
  const { clients } = useClients();
  const { services: availableServices } = useServices();
  const { deleteImage } = useStorage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const order = orders?.find(o => o.id === id);

  const [selectedClient, setSelectedClient] = useState("");
  const [selectedAddress, setSelectedAddress] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<OrderStatus>("start");
  const [priority, setPriority] = useState<OrderPriority>("normal");
  const [discount, setDiscount] = useState("");
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [customFieldValues, setCustomFieldValues] = useState<CustomFieldValue[]>([]);
  const [imageUrl, setImageUrl] = useState<string>("");

  const handleImageChange = async (newUrl: string) => {
    if (imageUrl && imageUrl !== order?.imageUrl && imageUrl !== newUrl) {
      try {
        await deleteImage(imageUrl);
      } catch (error) {
        console.error("Failed to delete transient image:", error);
      }
    }
    setImageUrl(newUrl);
  };

  useEffect(() => {
    if (order) {
      setSelectedClient(order.clientId);
      if (order.scheduledAt) {
        setScheduledDate(order.scheduledAt.split("T")[0]);
        setScheduledTime(order.scheduledAt.split("T")[1]?.substring(0, 5) || "");
      }
      setDescription(order.description || "");
      setStatus(order.status);
      setPriority(order.priority);
      setDiscount(order.discount ? order.discount.toString() : "");
      setServices(order.services);
      setImageUrl(order.imageUrl || "");

      if (order.customFields) {
        const values: CustomFieldValue[] = Object.entries(order.customFields).map(([key, value]) => ({
          fieldId: key,
          value: value as string | number | boolean
        }));
        setCustomFieldValues(values);
      }
    }
  }, [order]);

  const selectedClientData = clients?.find(c => c.id === selectedClient);

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
    const service = availableServices?.find((s) => s.id === serviceId);
    if (!service) return;

    const existing = services.find((s) => s.name === service.name);
    if (existing) {
      setServices(
        services.map((s) =>
          s.name === service.name ? { ...s, quantity: s.quantity + 1 } : s
        )
      );
    } else {
      setServices([...services, { name: service.name, price: service.price, quantity: 1 }]);
    }
  };

  const updateQuantity = (serviceName: string, delta: number) => {
    setServices(
      services
        .map((s) =>
          s.name === serviceName ? { ...s, quantity: Math.max(0, s.quantity + delta) } : s
        )
        .filter((s) => s.quantity > 0)
    );
  };

  const removeService = (serviceName: string) => {
    setServices(services.filter((s) => s.name !== serviceName));
  };

  const subtotal = services.reduce((acc, s) => acc + s.price * s.quantity, 0);
  const discountValue = parseFloat(discount) || 0;
  const total = Math.max(0, subtotal - discountValue);



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

    if (!id) return;

    try {
      const customFieldsObject = customFieldValues.reduce((acc, curr) => ({
        ...acc,
        [curr.fieldId]: curr.value
      }), {});

      await updateOrder.mutateAsync({
        id,
        data: {
          clientId: selectedClient,
          status,
          priority,
          total,
          discount: discountValue,
          description,
          scheduledAt: scheduledDate && scheduledTime ? `${scheduledDate}T${scheduledTime}` : null,
          services,
          customFields: customFieldsObject,
          imageUrl: imageUrl
        }
      });

      // Delete old image if it changed
      if (order?.imageUrl && order.imageUrl !== imageUrl) {
        await deleteImage(order.imageUrl);
      }

      toast({
        title: "Ordem atualizada!",
        description: "Ordem de serviço atualizada com sucesso.",
      });
      navigate(`/ordens/${id}`);
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="page-container bg-background">
      {/* Mobile Header */}
      <div className="lg:hidden">
        <TopNav title={`Editar Ordem #${order.number || order.id.slice(0, 4)}`} showBack />
      </div>

      {/* Desktop Header */}
      <div className="hidden lg:block">
        <DesktopHeader title={`Editar Ordem de Serviço #${order.number || order.id.slice(0, 4)}`} />
      </div>

      <div className="content-container">
        <form onSubmit={handleSubmit} className="space-y-5 animate-slide-up lg:grid lg:grid-cols-2 lg:gap-8 lg:space-y-0">
          {/* Left Column */}
          <div className="space-y-5">
            {/* Image */}
            <div className="flex justify-center mb-6 lg:justify-start">
              <ImageUploader
                value={imageUrl}
                onChange={handleImageChange}
              />
            </div>

            {/* Status & Priority */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={status} onValueChange={(value) => setStatus(value as OrderStatus)}>
                  <SelectTrigger className="input-field">
                    <SelectValue placeholder="Selecione" />
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
              <div className="space-y-2">
                <Label>Prioridade</Label>
                <Select value={priority} onValueChange={(value) => setPriority(value as OrderPriority)}>
                  <SelectTrigger className="input-field">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {priorityOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Client */}
            <div className="space-y-2">
              <Label>Cliente *</Label>
              <Select value={selectedClient} onValueChange={(v) => { setSelectedClient(v); setSelectedAddress(""); }}>
                <SelectTrigger className="input-field">
                  <SelectValue placeholder="Selecione um cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clients?.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedClientData && selectedClientData.addresses && selectedClientData.addresses.length > 0 && (
              <div className="space-y-2">
                <Label>Endereço</Label>
                <Select value={selectedAddress} onValueChange={setSelectedAddress}>
                  <SelectTrigger className="input-field"><SelectValue placeholder="Selecione o endereço" /></SelectTrigger>
                  <SelectContent>{selectedClientData.addresses.map((a) => <SelectItem key={a.id} value={a.id}>{a.label} - {a.street}, {a.number}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            )}

            {/* Scheduled Date */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Data Agendamento</Label>
                <Input type="date" value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)} className="input-field" />
              </div>
              <div className="space-y-2">
                <Label>Hora</Label>
                <Input type="time" value={scheduledTime} onChange={(e) => setScheduledTime(e.target.value)} className="input-field" />
              </div>
            </div>

            {/* Add Services */}
            <div className="space-y-2">
              <Label>Adicionar Serviços *</Label>
              <Select onValueChange={addService}>
                <SelectTrigger className="input-field">
                  <SelectValue placeholder="Selecione um serviço" />
                </SelectTrigger>
                <SelectContent>
                  {availableServices?.map((service) => (
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
                  {services.map((service, index) => (
                    <div
                      key={index}
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
                          onClick={() => updateQuantity(service.name, -1)}
                          className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center hover:bg-border transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-6 text-center text-sm font-medium">{service.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(service.name, 1)}
                          className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center hover:bg-border transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeService(service.name)}
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
          </div>

          {/* Right Column */}
          <div className="space-y-5">
            {/* Description */}
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea
                placeholder="Descreva o serviço..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-24 bg-secondary/50 border-0 focus:ring-2 focus:ring-primary/20 resize-none"
              />
            </div>

            {/* Discount */}
            <div className="space-y-2">
              <Label>Desconto (R$)</Label>
              <Input type="number" step="0.01" placeholder="0,00" value={discount} onChange={(e) => setDiscount(e.target.value)} className="input-field" />
            </div>

            {/* Custom Fields */}
            <CustomFieldsRenderer
              entityType="order"
              values={customFieldValues}
              onValuesChange={setCustomFieldValues}
            />

            {/* Total */}
            <div className="p-4 bg-primary/5 rounded-xl border border-primary/20 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>R$ {subtotal.toFixed(2)}</span>
              </div>
              {discountValue > 0 && (
                <div className="flex justify-between text-sm text-status-finished">
                  <span>Desconto</span>
                  <span>- R$ {discountValue.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg pt-2 border-t border-primary/20">
                <span>Total</span>
                <span className="text-primary">R$ {total.toFixed(2)}</span>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full btn-primary mt-6"
              disabled={updateOrder.isPending}
            >
              {updateOrder.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
