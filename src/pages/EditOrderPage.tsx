import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { TopNav } from "@/components/layout/TopNav";
import { DesktopHeader } from "@/components/layout/DesktopHeader";
import { Plus, Minus, X, ChevronDown } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
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
import { useCustomFieldDefinitions } from "@/hooks/useCustomFieldDefinitions";
import { ServiceItem, OrderStatus, OrderPriority } from "@/types";
import { formatOrderNumber, formatCurrency, fromScheduledAt, toScheduledAt } from "@/lib/formatters";
import { ImageUploader } from "@/components/form/ImageUploader";
import { STATUS_OPTIONS, PRIORITY_OPTIONS } from "@/lib/orderStatus";
import { DatePicker } from "@/components/form/DatePicker";
import { TimePicker } from "@/components/form/TimePicker";

export default function EditOrderPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { orders, updateOrder } = useOrders();
  const { clients } = useClients();
  const { services: availableServices } = useServices();
  const { deleteImage } = useStorage();
  const { fields: customFieldsDefinitions } = useCustomFieldDefinitions("order");

  const order = orders?.find(o => o.id === id);

  const [selectedClient, setSelectedClient] = useState("");
  const [selectedAddress, setSelectedAddress] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [description, setDescription] = useState("");
  const [observations, setObservations] = useState("");
  const [status, setStatus] = useState<OrderStatus>("start");
  const [priority, setPriority] = useState<OrderPriority>("normal");
  const [discount, setDiscount] = useState("");
  const [discountType, setDiscountType] = useState<"fixed" | "percentage">("fixed");
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [customFieldValues, setCustomFieldValues] = useState<CustomFieldValue[]>([]);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [customFieldErrors, setCustomFieldErrors] = useState<Record<string, string>>({});
  // Remonta o select de serviço depois de cada escolha (ver NewOrderPage).
  const [servicePickerKey, setServicePickerKey] = useState(0);

  const validateField = (field: string, value: string | any[]) => {
    let error = "";
    if (field === "selectedClient" && !value) error = "Selecione um cliente";
    if (field === "services" && Array.isArray(value) && value.length === 0) error = "Adicione pelo menos um serviço";

    setErrors((prev) => ({ ...prev, [field]: error }));
    return !error;
  };

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
        const { date, time } = fromScheduledAt(order.scheduledAt);
        setScheduledDate(date);
        setScheduledTime(time);
      }
      setDescription(order.description || "");
      setObservations(order.observations || "");
      setStatus(order.status);
      setPriority(order.priority);
      setDiscount(order.discount ? order.discount.toString() : "");
      setServices(order.services);
      setImageUrl(order.imageUrl || "");

      if (order.customFields) {
        // Extract internal metadata
        if (order.customFields._discountType) {
           setDiscountType(order.customFields._discountType as "fixed" | "percentage");
        }
        if (order.customFields._discountInput) {
           setDiscount(order.customFields._discountInput.toString());
        }

        // Filter out internal metadata from the form fields
        const values: CustomFieldValue[] = Object.entries(order.customFields)
          .filter(([key]) => !key.startsWith("_"))
          .map(([key, value]) => ({
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
        <TopNav title="Editar OS" showBack />
        <div className="content-container">
          <div className="card-elevated p-10 text-center">
            <p className="font-medium text-foreground">Ordem não encontrada</p>
            <p className="text-sm text-muted-foreground mt-1">Ela pode ter sido excluída.</p>
            <Button asChild variant="outline" className="mt-4 h-9">
              <Link to="/ordens">Ver todas as ordens</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const addService = (serviceId: string) => {
    const service = availableServices?.find((s) => s.id === serviceId);
    if (!service) return;

    if (errors.services) setErrors(prev => ({ ...prev, services: "" }));

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

  const updatePrice = (serviceName: string, newPrice: number) => {
    setServices(services.map((s) => s.name === serviceName ? { ...s, price: newPrice } : s));
  };

  const subtotal = services.reduce((acc, s) => acc + s.price * s.quantity, 0);

  const discountInput = parseFloat(discount) || 0;
  const discountValue = discountType === "fixed"
    ? discountInput
    : subtotal * (discountInput / 100);

  const total = Math.max(0, subtotal - discountValue);



  // Leva o usuário ao campo com erro, mesmo que esteja fora da tela.
  const focusField = (fieldId: string) => {
    const el = document.getElementById(fieldId);
    el?.scrollIntoView({ block: "center", behavior: "smooth" });
    el?.focus({ preventScroll: true });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const isClientValid = validateField("selectedClient", selectedClient);
    const isServicesValid = validateField("services", services);

    if (!isClientValid || !isServicesValid) {
      const missing = [!isClientValid && "cliente", !isServicesValid && "serviço"].filter(Boolean).join(" e ");
      toast({ title: `Falta ${missing}`, variant: "destructive" });
      focusField(!isClientValid ? "order-client" : "order-service");
      return;
    }

    setCustomFieldErrors({}); // Reset errors

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
            title: `Falta preencher: ${missingFields.map(f => f.name).join(", ")}`,
            variant: "destructive"
        });
        return;
    }

    if (!id) return;

    try {
      const customFieldsObject = customFieldValues.reduce((acc, curr) => ({
        ...acc,
        [curr.fieldId]: curr.value
      }), {
        _discountType: discountType, // Persist discount type metadata
        _discountInput: discount // Persist raw discount input
      });

      await updateOrder.mutateAsync({
        id,
        data: {
          clientId: selectedClient,
          status,
          priority,
          total,
          discount: discountValue,
          description,
          observations,
          scheduledAt: toScheduledAt(scheduledDate, scheduledTime),
          services,
          customFields: customFieldsObject,
          imageUrl: imageUrl
        }
      });

      // Delete old image if it changed
      if (order?.imageUrl && order.imageUrl !== imageUrl) {
        await deleteImage(order.imageUrl);
      }

      toast({ title: `${formatOrderNumber(order)} atualizada` });
      navigate(`/ordens/${id}`);
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const fieldError = (message?: string) =>
    message ? <p role="alert" className="text-xs font-medium text-destructive">{message}</p> : null;

  return (
    <div className="page-container bg-background">
      <div className="lg:hidden"><TopNav title={`Editar OS ${formatOrderNumber(order)}`} showBack /></div>
      <DesktopHeader title={`Editar ordem de serviço ${formatOrderNumber(order)}`} />

      <div className="content-container">
        <form onSubmit={handleSubmit} noValidate className="space-y-4 lg:grid lg:grid-cols-5 lg:gap-6 lg:items-start lg:space-y-0">
          {/* O que é a OS: cliente e serviços */}
          <div className="lg:col-span-3 space-y-4">
            <section className="card-elevated p-4 lg:p-5 space-y-4">
              <h2 className="text-sm font-semibold text-foreground">Cliente</h2>
              <div className="space-y-2">
                <Label htmlFor="order-client">Cliente *</Label>
                <Select
                  value={selectedClient}
                  onValueChange={(v) => {
                    setSelectedClient(v);
                    setSelectedAddress("");
                    if (errors.selectedClient) validateField("selectedClient", v);
                  }}
                >
                  <SelectTrigger id="order-client" aria-invalid={!!errors.selectedClient} className={`input-field ${errors.selectedClient ? "border-destructive" : ""}`}>
                    <SelectValue placeholder="Selecione um cliente" />
                  </SelectTrigger>
                  <SelectContent>{clients?.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
                {fieldError(errors.selectedClient)}
                {clients && clients.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    Nenhum cliente cadastrado.{" "}
                    <Link to="/clientes/novo" className="font-medium text-primary underline underline-offset-4">Cadastrar cliente</Link>
                  </p>
                )}
              </div>

              {selectedClientData && selectedClientData.addresses && selectedClientData.addresses.length > 0 && (
                <div className="space-y-2">
                  <Label htmlFor="order-address">Endereço do serviço</Label>
                  <Select value={selectedAddress} onValueChange={setSelectedAddress}>
                    <SelectTrigger id="order-address" className="input-field"><SelectValue placeholder="Selecione o endereço" /></SelectTrigger>
                    <SelectContent>{selectedClientData.addresses.map((a) => <SelectItem key={a.id} value={a.id}>{a.label} - {a.street}, {a.number}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              )}
            </section>

            <section className="card-elevated p-4 lg:p-5 space-y-4">
              <h2 className="text-sm font-semibold text-foreground">Serviços</h2>
              <div className="space-y-2">
                <Label htmlFor="order-service">Adicionar serviço *</Label>
                <Select
                  key={servicePickerKey}
                  onValueChange={(v) => {
                    addService(v);
                    setServicePickerKey((k) => k + 1);
                    if (errors.services) setErrors((prev) => ({ ...prev, services: "" }));
                  }}
                >
                  <SelectTrigger id="order-service" aria-invalid={!!errors.services} className={`input-field ${errors.services ? "border-destructive" : ""}`}>
                    <SelectValue placeholder="Escolha do catálogo" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableServices?.filter((s) => s.active !== false).map((s) => (
                      <SelectItem key={s.id} value={s.id}>{s.name} · {formatCurrency(s.price)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldError(errors.services)}
                {availableServices && availableServices.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    O catálogo está vazio.{" "}
                    <Link to="/servicos/novo" className="font-medium text-primary underline underline-offset-4">Cadastrar serviço</Link>
                  </p>
                )}
              </div>

              {services.length > 0 && (
                <ul className="divide-y divide-border border border-border rounded-md">
                  {services.map((s) => (
                    <li key={s.name} className="flex items-center gap-3 p-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{s.name}</p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="text-xs text-muted-foreground">R$</span>
                          <Input
                            type="number"
                            inputMode="decimal"
                            step="0.01"
                            min="0"
                            aria-label={`Preço de ${s.name}`}
                            className="h-8 max-md:h-10 w-24 text-sm tabular"
                            value={s.price}
                            onChange={(e) => updatePrice(s.name, parseFloat(e.target.value) || 0)}
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button type="button" size="icon" variant="outline" className="relative h-9 w-9 max-md:h-9 max-md:w-9 after:absolute after:-inset-1 after:content-['']" aria-label={`Diminuir ${s.name}`} onClick={() => updateQuantity(s.name, -1)}><Minus className="w-4 h-4" /></Button>
                        <span className="w-7 text-center text-sm font-medium tabular" aria-label="Quantidade">{s.quantity}</span>
                        <Button type="button" size="icon" variant="outline" className="relative h-9 w-9 max-md:h-9 max-md:w-9 after:absolute after:-inset-1 after:content-['']" aria-label={`Aumentar ${s.name}`} onClick={() => updateQuantity(s.name, 1)}><Plus className="w-4 h-4" /></Button>
                        <Button type="button" size="icon" variant="ghost" className="relative h-9 w-9 max-md:h-9 max-md:w-9 after:absolute after:-inset-1 after:content-[''] ml-2 text-muted-foreground hover:text-destructive" aria-label={`Remover ${s.name}`} onClick={() => removeService(s.name)}><X className="w-4 h-4" /></Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              <dl className="space-y-1 text-sm tabular pt-1">
                {discountValue > 0 && (
                  <>
                    <div className="flex justify-between text-muted-foreground">
                      <dt>Subtotal</dt>
                      <dd>{formatCurrency(subtotal)}</dd>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <dt>Desconto {discountType === "percentage" && `(${discount}%)`}</dt>
                      <dd>− {formatCurrency(discountValue)}</dd>
                    </div>
                  </>
                )}
                <div className="flex justify-between text-base font-semibold text-foreground lg:hidden">
                  <dt>Total</dt>
                  <dd>{formatCurrency(total)}</dd>
                </div>
              </dl>
            </section>
            <section className="card-elevated p-4 lg:p-5 space-y-4">
              <h2 className="text-sm font-semibold text-foreground">Detalhes</h2>
              <div className="space-y-2">
                <Label htmlFor="order-description">Descrição</Label>
                <Textarea id="order-description" placeholder="O que precisa ser feito" value={description} onChange={(e) => setDescription(e.target.value)} className="min-h-20 resize-none" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="order-observations">Observações</Label>
                <Textarea id="order-observations" placeholder="Anotações internas" value={observations} onChange={(e) => setObservations(e.target.value)} className="min-h-20 resize-none" />
              </div>
              <CustomFieldsRenderer entityType="order" values={customFieldValues} onValuesChange={setCustomFieldValues} errors={customFieldErrors} />
            </section>
          </div>

          {/* Como e quando */}
          <div className="lg:col-span-2 space-y-4">
            <section className="card-elevated p-4 lg:p-5 space-y-4">
              <h2 className="text-sm font-semibold text-foreground">Andamento</h2>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="order-status">Status</Label>
                  <Select value={status} onValueChange={(v) => setStatus(v as OrderStatus)}>
                    <SelectTrigger id="order-status" className="input-field"><SelectValue /></SelectTrigger>
                    <SelectContent>{STATUS_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="order-priority">Prioridade</Label>
                  <Select value={priority} onValueChange={(v) => setPriority(v as OrderPriority)}>
                    <SelectTrigger id="order-priority" className="input-field"><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>{PRIORITY_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="order-date">Agendar para</Label>
                  <DatePicker id="order-date" value={scheduledDate} onChange={setScheduledDate} placeholder="Sem data" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="order-time">Hora</Label>
                  <TimePicker id="order-time" value={scheduledTime} onChange={setScheduledTime} />
                </div>
              </div>
            </section>


            <Collapsible className="card-elevated">
              <CollapsibleTrigger className="group w-full flex items-center justify-between p-4 lg:px-5 text-sm font-semibold text-foreground">
                Desconto e foto
                <ChevronDown className="w-4 h-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" aria-hidden="true" />
              </CollapsibleTrigger>
              <CollapsibleContent className="px-4 lg:px-5 pb-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="order-discount">Desconto</Label>
                  <div className="flex gap-2">
                    <Select value={discountType} onValueChange={(v) => setDiscountType(v as "fixed" | "percentage")}>
                      <SelectTrigger aria-label="Tipo de desconto" className="w-[96px] input-field"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fixed">R$</SelectItem>
                        <SelectItem value="percentage">%</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input id="order-discount" type="number" inputMode="decimal" step="0.01" min="0" placeholder="0,00" value={discount} onChange={(e) => setDiscount(e.target.value)} className="input-field flex-1 tabular" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Foto</Label>
                  <ImageUploader value={imageUrl} onChange={handleImageChange} />
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Desktop: total e envio acompanham a rolagem */}
            <div className="hidden lg:block sticky top-20 card-elevated p-5 space-y-3">
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-muted-foreground">Total</span>
                <span className="text-xl font-semibold text-foreground tabular">{formatCurrency(total)}</span>
              </div>
              <Button type="submit" className="w-full btn-primary" disabled={updateOrder.isPending}>
                {updateOrder.isPending ? "Salvando..." : "Salvar alterações"}
              </Button>
            </div>
          </div>

          {/* Celular: total e envio sempre à mão */}
          <div className="lg:hidden fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-40 bg-card border-t border-border px-4 py-3">
            <div className="max-w-lg mx-auto flex items-center gap-3">
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Total</p>
                <p className="text-base font-semibold text-foreground tabular">{formatCurrency(total)}</p>
              </div>
              <Button type="submit" className="h-11 px-6" disabled={updateOrder.isPending}>
                {updateOrder.isPending ? "Salvando..." : "Salvar alterações"}
              </Button>
            </div>
          </div>
          <div className="lg:hidden h-20" aria-hidden="true" />
        </form>
      </div>
    </div>
  );
}
