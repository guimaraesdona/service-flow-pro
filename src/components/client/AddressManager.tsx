import { useState } from "react";
import { Plus, Trash2, MapPin, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { formatCEP } from "@/lib/formatters";

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
    if (!formData.label || !formData.cep || !formData.street || !formData.city || !formData.state) {
      return;
    }

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
      setFormData((prev) => ({ ...prev, [field]: formatCEP(value) }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
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
                <Label>Identificação *</Label>
                <Input
                  placeholder="Ex: Casa, Trabalho, Escritório..."
                  value={formData.label}
                  onChange={(e) => updateField("label", e.target.value)}
                  className="input-field"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>CEP *</Label>
                  <Input
                    placeholder="00000-000"
                    value={formData.cep}
                    onChange={(e) => updateField("cep", e.target.value)}
                    className="input-field"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Número *</Label>
                  <Input
                    placeholder="000"
                    value={formData.number}
                    onChange={(e) => updateField("number", e.target.value)}
                    className="input-field"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Logradouro *</Label>
                <Input
                  placeholder="Rua, Avenida..."
                  value={formData.street}
                  onChange={(e) => updateField("street", e.target.value)}
                  className="input-field"
                />
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
                <Label>Bairro *</Label>
                <Input
                  placeholder="Seu bairro"
                  value={formData.neighborhood}
                  onChange={(e) => updateField("neighborhood", e.target.value)}
                  className="input-field"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 space-y-2">
                  <Label>Cidade *</Label>
                  <Input
                    placeholder="Sua cidade"
                    value={formData.city}
                    onChange={(e) => updateField("city", e.target.value)}
                    className="input-field"
                  />
                </div>
                <div className="space-y-2">
                  <Label>UF *</Label>
                  <Input
                    placeholder="UF"
                    maxLength={2}
                    value={formData.state}
                    onChange={(e) => updateField("state", e.target.value.toUpperCase())}
                    className="input-field"
                  />
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
                      className="h-8 w-8"
                      onClick={() => handleSetDefault(address.id)}
                      title="Definir como padrão"
                    >
                      <MapPin className="w-4 h-4" />
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleOpenDialog(address)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => handleDeleteAddress(address.id)}
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
