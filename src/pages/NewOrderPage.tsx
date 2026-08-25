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
import { ServiceItem, OrderStatus, OrderPriority } from "@/types";
import { useOrders } from "@/hooks/useOrders";
import { useClients } from "@/hooks/useClients";
import { useServices } from "@/hooks/useServices";
import { useStorage } from "@/hooks/useStorage";
import { useCustomFieldDefinitions } from "@/hooks/useCustomFieldDefinitions";
import { useRef } from "react";
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

export default function NewOrderPage() {
  const navigate = useNavigate();
  const { createOrder } = useOrders();
  const { clients } = useClients();
  const { services: availableServices } = useServices();
  const { deleteImage } = useStorage();
  const { fields: customFieldsDefinitions } = useCustomFieldDefinitions("order");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedClient, setSelectedClient] = useState("");
  const [selectedAddress, setSelectedAddress] = useState("");
  const [status, setStatus] = useState<OrderStatus>("start");
  const [priority, setPriority] = useState<OrderPriority>("normal");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [description, setDescription] = useState("");
  const [observations, setObservations] = useState("");
  const [discount, setDiscount] = useState("");
  const [discountType, setDiscountType] = useState<"fixed" | "percentage">("fixed");
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [customFieldValues, setCustomFieldValues] = useState<CustomFieldValue[]>([]);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [customFieldErrors, setCustomFieldErrors] = useState<Record<string, string>>({});

  const validateField = (field: string, value: string | any[]) => {
    let error = "";
    if (field === "selectedClient" && !value) error = "Selecione um cliente";
    if (field === "services" && Array.isArray(value) && value.length === 0) error = "Adicione pelo menos um serviço";

    setErrors((prev) => ({ ...prev, [field]: error }));
    return !error;
  };

  const handleImageChange = async (newUrl: string) => {
    if (imageUrl && imageUrl !== newUrl) {
      try {
        await deleteImage(imageUrl);
      } catch (error) {
        console.error("Failed to delete transient image:", error);
      }
    }
    setImageUrl(newUrl);
  };

  const selectedClientData = clients?.find(c => c.id === selectedClient);

  const addService = (serviceId: string) => {
    const service = availableServices?.find((s) => s.id === serviceId);
    if (!service) return;
    const existing = services.find((s) => s.name === service.name);

    if (existing) {
      setServices(services.map((s) => s.name === service.name ? { ...s, quantity: s.quantity + 1 } : s));
    } else {
      setServices([...services, { name: service.name, price: service.price, quantity: 1 }]);
    }
  };

  const updateQuantity = (serviceName: string, delta: number) => {
    setServices(services.map((s) => s.name === serviceName ? { ...s, quantity: Math.max(0, s.quantity + delta) } : s).filter((s) => s.quantity > 0));
  };

  const removeService = (serviceName: string) => { setServices(services.filter((s) => s.name !== serviceName)); };

  const updatePrice = (serviceName: string, newPrice: number) => {
    setServices(services.map((s) => s.name === serviceName ? { ...s, price: newPrice } : s));
  };

  const subtotal = services.reduce((acc, s) => acc + s.price * s.quantity, 0);

  const discountInput = parseFloat(discount) || 0;
  const discountValue = discountType === "fixed"
    ? discountInput
    : subtotal * (discountInput / 100);

  const total = Math.max(0, subtotal - discountValue);



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const isClientValid = validateField("selectedClient", selectedClient);
    const isServicesValid = validateField("services", services);

    if (!isClientValid || !isServicesValid) {
      toast({
        title: "Campos inválidos",
        description: "Verifique os erros antes de continuar.",
        variant: "destructive"
      });
      return;
    }

    setCustomFieldErrors({});

    // Validate Custom Fields
    const missingFields = customFieldsDefinitions.filter(field => {
        if (!field.required) return false;
        const val = customFieldValues.find(v => v.fieldId === field.id)?.value;
        if (val === undefined || val === "" || val === null) return true;
        if (Array.isArray(val) && val.length === 0) return true;
        return false;
    });

    if (missingFields.length > 0) {
        const newCustomErrors: Record<string, string> = {};
        missingFields.forEach(f => {
            newCustomErrors[f.id] = "Campo obrigatório";
        });
        setCustomFieldErrors(newCustomErrors);

        toast({
            title: "Campos obrigatórios",
            description: `Preencha os campos: ${missingFields.map(f => f.name).join(", ")}`,
            variant: "destructive"
        });
        return;
    }

    try {
      const customFieldsObject = customFieldValues.reduce((acc, curr) => ({
        ...acc,
        [curr.fieldId]: curr.value
      }), {
        _discountType: discountType, // Persist discount type metadata
        _discountInput: discount // Persist raw discount input
      });

      await createOrder.mutateAsync({
        clientId: selectedClient,
        status,
        priority,
        total,
        discount: discountValue,
        description: description,
        observations: observations,
        scheduledAt: scheduledDate && scheduledTime ? `${scheduledDate}T${scheduledTime}` : null,
        services,
        customFields: customFieldsObject,
        imageUrl: imageUrl
      });

      toast({ title: "Ordem criada!", description: "Ordem de serviço cadastrada com sucesso." });
      navigate("/ordens");
    } catch (error: any) {
      toast({
        title: "Erro ao criar ordem",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="page-container bg-background">
      <div className="lg:hidden"><TopNav title="Nova Ordem" showBack /></div>
      <div className="hidden lg:block"><DesktopHeader title="Nova Ordem de Serviço" /></div>

      <div className="content-container">
        <form onSubmit={handleSubmit} className="space-y-5 animate-slide-up lg:grid lg:grid-cols-2 lg:gap-8 lg:space-y-0">
          <div className="space-y-5">
            <div className="flex justify-center mb-6 lg:justify-start">
              <ImageUploader
                value={imageUrl}
                onChange={handleImageChange}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as OrderStatus)}>
                  <SelectTrigger className="input-field"><SelectValue /></SelectTrigger>
                  <SelectContent>{statusOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Prioridade</Label>
                <Select value={priority} onValueChange={(v) => setPriority(v as OrderPriority)}>
                  <SelectTrigger className="input-field"><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>{priorityOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Cliente *</Label>
              <Select
                value={selectedClient}
                onValueChange={(v) => {
                  setSelectedClient(v);
                  setSelectedAddress("");
                  if (errors.selectedClient) validateField("selectedClient", v);
                }}
              >
                <SelectTrigger className={`input-field ${errors.selectedClient ? "border-red-500 focus:ring-red-500" : ""}`}>
                  <SelectValue placeholder="Selecione um cliente" />
                </SelectTrigger>
                <SelectContent>{clients?.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
              {errors.selectedClient && <p className="text-xs font-semibold text-red-500 animate-fade-in">{errors.selectedClient}</p>}
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

            <div className="space-y-2">
              <Label>Adicionar Serviços *</Label>
              <Select onValueChange={(v) => {
                  addService(v);
                  if (errors.services) setErrors(prev => ({ ...prev, services: "" }));
              }}>
                <SelectTrigger className={`input-field ${errors.services ? "border-red-500 focus:ring-red-500" : ""}`}>
                  <SelectValue placeholder="Selecione um serviço" />
                </SelectTrigger>
                <SelectContent>{availableServices?.map((s) => <SelectItem key={s.id} value={s.id}>{s.name} - R$ {s.price.toFixed(2)}</SelectItem>)}</SelectContent>
              </Select>
              {errors.services && <p className="text-xs font-semibold text-red-500 animate-fade-in">{errors.services}</p>}
            </div>

            {services.length > 0 && (
              <div className="space-y-2">
                <Label>Serviços Selecionados</Label>
                <div className="space-y-2">
                  {services.map((s, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">{s.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-muted-foreground">R$</span>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            className="h-7 w-24 text-xs bg-background/50 border-border/50"
                            value={s.price}
                            onChange={(e) => updatePrice(s.name, parseFloat(e.target.value) || 0)}
                          />
                          <span className="text-xs text-muted-foreground">x {s.quantity}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button type="button" onClick={() => updateQuantity(s.name, -1)} className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center"><Minus className="w-4 h-4" /></button>
                        <span className="w-6 text-center text-sm font-medium">{s.quantity}</span>
                        <button type="button" onClick={() => updateQuantity(s.name, 1)} className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center"><Plus className="w-4 h-4" /></button>
                        <button type="button" onClick={() => removeService(s.name)} className="w-8 h-8 rounded-full bg-destructive/10 text-destructive flex items-center justify-center ml-2"><X className="w-4 h-4" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-5">
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea placeholder="Descreva o serviço a ser realizado..." value={description} onChange={(e) => setDescription(e.target.value)} className="min-h-20 bg-secondary/50 border-0 focus:ring-2 focus:ring-primary/20 resize-none" />
            </div>

            <div className="space-y-2">
              <Label>Observações</Label>
              <Textarea placeholder="Anotações adicionais..." value={observations} onChange={(e) => setObservations(e.target.value)} className="min-h-20 bg-secondary/50 border-0 focus:ring-2 focus:ring-primary/20 resize-none" />
            </div>

            <div className="space-y-2">
              <Label>Desconto</Label>
              <div className="flex gap-2">
                <Select value={discountType} onValueChange={(v) => setDiscountType(v as "fixed" | "percentage")}>
                   <SelectTrigger className="w-[110px] input-field">
                    <SelectValue />
                   </SelectTrigger>
                   <SelectContent>
                     <SelectItem value="fixed">R$ (Real)</SelectItem>
                     <SelectItem value="percentage">% (Porc.)</SelectItem>
                   </SelectContent>
                </Select>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  className="input-field flex-1"
                />
              </div>
            </div>

            <CustomFieldsRenderer entityType="order" values={customFieldValues} onValuesChange={setCustomFieldValues} errors={customFieldErrors} />

            <div className="p-4 bg-primary/5 rounded-xl border border-primary/20 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>R$ {subtotal.toFixed(2)}</span>
              </div>
              {discountValue > 0 && (
                <div className="flex justify-between text-sm text-status-finished">
                  <span>Desconto {discountType === "percentage" && `(${discount}%)`}</span>
                  <span>- R$ {discountValue.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg pt-2 border-t border-primary/20">
                <span>Total</span>
                <span className="text-primary">R$ {total.toFixed(2)}</span>
              </div>
            </div>

            <Button type="submit" className="w-full btn-primary" disabled={createOrder.isPending}>{createOrder.isPending ? "Salvando..." : "Cadastrar"}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
