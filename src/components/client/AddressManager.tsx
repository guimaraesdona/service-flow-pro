import { useState } from "react";
import { Plus, Trash2, MapPin, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { formatCEP } from "@/lib/formatters";
import { maskCEP } from "@/utils/masks";

import { Address } from "@/types";

interface AddressManagerProps {
  addresses: Address[];
  onAddressesChange: (addresses: Address[]) => void;
}

export function AddressManager({ addresses, onAddressesChange }: AddressManagerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [formData, setFormData] = useState<Omit<Address, 'id'>>({
    label: "",
    cep: "",
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
    isDefault: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateField = (field: string, value: string) => {
    let error = "";
    // Mandatory fields
    if (!value && ["label", "cep", "street", "number", "neighborhood", "city", "state"].includes(field)) {
      error = "Campo obrigatório";
    }

    setErrors((prev) => ({ ...prev, [field]: error }));
    return !error;
  };

  const handleBlur = (field: string) => {
    validateField(field, formData[field as keyof typeof formData] as string);
  };

  const resetForm = () => {
    setFormData({
      label: "",
      cep: "",
      street: "",
      number: "",
      complement: "",
      neighborhood: "",
      city: "",
      state: "",
      isDefault: false,
    });
    setErrors({});
    setEditingAddress(null);
  };

  const handleOpenDialog = (address?: Address) => {
    if (address) {
      setEditingAddress(address);
      setFormData({
        label: address.label,
        cep: address.cep,
        street: address.street,
        number: address.number,
        complement: address.complement || "",
        neighborhood: address.neighborhood,
        city: address.city,
        state: address.state,
        isDefault: address.isDefault || false,
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    resetForm();
  };

  const handleSaveAddress = () => {
    // Validate all mandatory fields
    const fieldsToValidate = ["label", "cep", "street", "number", "neighborhood", "city", "state"];
    let hasErrors = false;

    fieldsToValidate.forEach(field => {
      const isValid = validateField(field, formData[field as keyof typeof formData] as string);
      if (!isValid) hasErrors = true;
    });

    if (hasErrors) return;

    if (editingAddress) {
      const updatedAddresses = addresses.map((addr) =>
        addr.id === editingAddress.id
          ? { ...formData, id: editingAddress.id }
          : formData.isDefault
            ? { ...addr, isDefault: false }
            : addr
      );
      onAddressesChange(updatedAddresses);
    } else {
      const newAddress: Address = {
        ...formData,
        id: Date.now().toString(),
        isDefault: addresses.length === 0 ? true : formData.isDefault,
      };

      let updatedAddresses = [...addresses];
      if (formData.isDefault) {
        updatedAddresses = updatedAddresses.map((addr) => ({ ...addr, isDefault: false }));
      }
      updatedAddresses.push(newAddress);
      onAddressesChange(updatedAddresses);
    }

    handleCloseDialog();
  };

  const handleDeleteAddress = (id: string) => {
    const updatedAddresses = addresses.filter((addr) => addr.id !== id);
    if (updatedAddresses.length > 0 && !updatedAddresses.some((addr) => addr.isDefault)) {
      updatedAddresses[0].isDefault = true;
    }
    onAddressesChange(updatedAddresses);
  };

  const handleSetDefault = (id: string) => {
    const updatedAddresses = addresses.map((addr) => ({
      ...addr,
      isDefault: addr.id === id,
    }));
    onAddressesChange(updatedAddresses);
  };

  const updateField = (field: keyof Omit<Address, 'id'>, value: string | boolean) => {
    if (field === 'cep' && typeof value === 'string') {
      setFormData((prev) => ({ ...prev, [field]: maskCEP(value) }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }

    if (typeof value === 'string' && errors[field]) {
       setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base font-semibold">Endereços</Label>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleOpenDialog()}
            >
              <Plus className="w-4 h-4 mr-1" />
              Adicionar
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingAddress ? "Editar Endereço" : "Novo Endereço"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="address-label">Identificação *</Label>
                <div className="space-y-1">
                  <Input
                    id="address-label"
                    aria-invalid={!!errors.label} aria-describedby={errors.label ? "address-label-error" : undefined}
                    placeholder="Ex: Casa, Trabalho, Escritório..."
                    value={formData.label}
                    onChange={(e) => updateField("label", e.target.value)}
                    onBlur={() => handleBlur("label")}
                    className={`input-field ${errors.label ? "border-destructive focus-visible:ring-destructive" : ""}`}
                  />
                  {errors.label && <p id="address-label-error" role="alert" className="text-xs font-semibold text-destructive animate-fade-in">{errors.label}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="address-cep">CEP *</Label>
                  <div className="space-y-1">
                    <Input
                      id="address-cep"
                      aria-invalid={!!errors.cep} aria-describedby={errors.cep ? "address-cep-error" : undefined}
                      placeholder="00000-000"
                      value={formData.cep}
                      onChange={(e) => updateField("cep", e.target.value)}
                      onBlur={() => handleBlur("cep")}
                      className={`input-field ${errors.cep ? "border-destructive focus-visible:ring-destructive" : ""}`}
                      maxLength={9}
                    />
                    {errors.cep && <p id="address-cep-error" role="alert" className="text-xs font-semibold text-destructive animate-fade-in">{errors.cep}</p>}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address-number">Número *</Label>
                  <div className="space-y-1">
                    <Input
                      id="address-number"
                      aria-invalid={!!errors.number} aria-describedby={errors.number ? "address-number-error" : undefined}
                      placeholder="000"
                      value={formData.number}
                      onChange={(e) => updateField("number", e.target.value)}
                      onBlur={() => handleBlur("number")}
                      className={`input-field ${errors.number ? "border-destructive focus-visible:ring-destructive" : ""}`}
                    />
                    {errors.number && <p id="address-number-error" role="alert" className="text-xs font-semibold text-destructive animate-fade-in">{errors.number}</p>}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address-street">Logradouro *</Label>
                <div className="space-y-1">
                  <Input
                    id="address-street"
                    aria-invalid={!!errors.street} aria-describedby={errors.street ? "address-street-error" : undefined}
                    placeholder="Rua, Avenida..."
                    value={formData.street}
                    onChange={(e) => updateField("street", e.target.value)}
                    onBlur={() => handleBlur("street")}
                    className={`input-field ${errors.street ? "border-destructive focus-visible:ring-destructive" : ""}`}
                  />
                  {errors.street && <p id="address-street-error" role="alert" className="text-xs font-semibold text-destructive animate-fade-in">{errors.street}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Complemento</Label>
                <Input
                  placeholder="Apto, Sala..."
                  value={formData.complement}
                  onChange={(e) => updateField("complement", e.target.value)}
                  className="input-field"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address-neighborhood">Bairro *</Label>
                <div className="space-y-1">
                  <Input
                    id="address-neighborhood"
                    aria-invalid={!!errors.neighborhood} aria-describedby={errors.neighborhood ? "address-neighborhood-error" : undefined}
                    placeholder="Seu bairro"
                    value={formData.neighborhood}
                    onChange={(e) => updateField("neighborhood", e.target.value)}
                    onBlur={() => handleBlur("neighborhood")}
                    className={`input-field ${errors.neighborhood ? "border-destructive focus-visible:ring-destructive" : ""}`}
                  />
                  {errors.neighborhood && <p id="address-neighborhood-error" role="alert" className="text-xs font-semibold text-destructive animate-fade-in">{errors.neighborhood}</p>}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="address-city">Cidade *</Label>
                  <div className="space-y-1">
                    <Input
                      id="address-city"
                      aria-invalid={!!errors.city} aria-describedby={errors.city ? "address-city-error" : undefined}
                      placeholder="Sua cidade"
                      value={formData.city}
                      onChange={(e) => updateField("city", e.target.value)}
                      onBlur={() => handleBlur("city")}
                      className={`input-field ${errors.city ? "border-destructive focus-visible:ring-destructive" : ""}`}
                    />
                    {errors.city && <p id="address-city-error" role="alert" className="text-xs font-semibold text-destructive animate-fade-in">{errors.city}</p>}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address-state">UF *</Label>
                  <div className="space-y-1">
                    <Input
                      id="address-state"
                      aria-invalid={!!errors.state} aria-describedby={errors.state ? "address-state-error" : undefined}
                      placeholder="UF"
                      maxLength={2}
                      value={formData.state}
                      onChange={(e) => updateField("state", e.target.value.toUpperCase())}
                      onBlur={() => handleBlur("state")}
                      className={`input-field ${errors.state ? "border-destructive focus-visible:ring-destructive" : ""}`}
                    />
                    {errors.state && <p id="address-state-error" role="alert" className="text-xs font-semibold text-destructive animate-fade-in">{errors.state}</p>}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={formData.isDefault}
                  onChange={(e) => updateField("isDefault", e.target.checked)}
                  className="rounded border-border"
                />
                <Label htmlFor="isDefault" className="text-sm font-normal cursor-pointer">
                  Definir como endereço padrão
                </Label>
              </div>

              <Button
                type="button"
                onClick={handleSaveAddress}
                className="w-full btn-primary"
              >
                {editingAddress ? "Salvar Alterações" : "Adicionar Endereço"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {addresses.length === 0 ? (
        <div className="p-4 border border-dashed border-border rounded-lg text-center">
          <MapPin className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Nenhum endereço cadastrado</p>
        </div>
      ) : (
        <div className="space-y-2">
          {addresses.map((address) => (
            <div
              key={address.id}
              className={`p-3 rounded-lg border ${address.isDefault ? "border-primary bg-primary/5" : "border-border bg-secondary/30"
                }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm text-foreground">{address.label}</span>
                    {address.isDefault && (
                      <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                        Padrão
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {address.street}, {address.number}
                    {address.complement && ` - ${address.complement}`}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {address.neighborhood} - {address.city}/{address.state}
                  </p>
                  <p className="text-xs text-muted-foreground">CEP: {address.cep}</p>
                </div>
                <div className="flex items-center gap-1">
                  {!address.isDefault && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleSetDefault(address.id)}
                      aria-label={`Definir ${address.label} como padrão`}
                      title="Definir como padrão"
                    >
                      <MapPin className="w-4 h-4" />
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleOpenDialog(address)}
                    aria-label={`Editar endereço ${address.label}`}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDeleteAddress(address.id)}
                    aria-label={`Excluir endereço ${address.label}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
