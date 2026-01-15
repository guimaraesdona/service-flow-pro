import { useState, useEffect } from "react";
import { formatPhone, formatDocument } from "@/lib/formatters";
import { useNavigate, useParams } from "react-router-dom";
import { TopNav } from "@/components/layout/TopNav";
import { ArrowRight, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { AddressManager } from "@/components/client/AddressManager";
import { Client, Address } from "@/types";

import { useClients } from "@/hooks/useClients";

export default function EditClientPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { clients, updateClient } = useClients();

  const client = clients?.find(c => c.id === id);

  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    document: "",
    birthDate: "",
    phone: "",
  });

  const [addresses, setAddresses] = useState<Address[]>([]);

  useEffect(() => {
    if (client) {
      setFormData({
        name: client.name,
        email: client.email || "",
        document: client.document || "",
        birthDate: client.birthDate || "",
        phone: client.phone || "",
      });
      setAddresses(client.addresses || []);
    }
  }, [client]);

  if (!client) {
    return (
      <div className="page-container bg-background">
        <TopNav title="Editar Cliente" showBack />
        <div className="content-container">
          <div className="text-center py-16">
            <p className="text-muted-foreground">Cliente não encontrado</p>
          </div>
        </div>
      </div>
    );
  }

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (!formData.name || !formData.email) {
      toast({
        title: "Campos obrigatórios",
        description: "Nome e email são obrigatórios.",
        variant: "destructive",
      });
      return;
    }
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    try {
      await updateClient.mutateAsync({
        id,
        data: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          document: formData.document,
          birthDate: formData.birthDate,
          addresses: addresses
        }
      });

      toast({
        title: "Cliente atualizado!",
        description: `${formData.name} foi atualizado com sucesso.`,
      });
      navigate(`/clientes/${id}`);
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
      <TopNav title="Editar Cliente" showBack />

      {/* Progress */}
      <div className="max-w-lg mx-auto w-full px-6 pt-4">
        <div className="flex items-center gap-2">
          <div className={`h-1.5 flex-1 rounded-full transition-colors ${step >= 1 ? "bg-primary" : "bg-secondary"}`} />
          <div className={`h-1.5 flex-1 rounded-full transition-colors ${step >= 2 ? "bg-primary" : "bg-secondary"}`} />
        </div>
        <p className="text-xs text-muted-foreground mt-2">Passo {step} de 2</p>
      </div>

      <div className="content-container">
        <form onSubmit={handleSubmit} className="space-y-4">
          {step === 1 && (
            <div className="space-y-4 animate-slide-up">
              {/* Avatar */}
              <div className="flex justify-center mb-6">
                <button
                  type="button"
                  className="w-24 h-24 rounded-full bg-secondary border-2 border-dashed border-border flex items-center justify-center hover:border-primary/50 transition-colors"
                >
                  <Camera className="w-8 h-8 text-muted-foreground" />
                </button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Nome / Razão Social *</Label>
                <Input
                  id="name"
                  placeholder="Nome completo"
                  value={formData.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  className="input-field"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@exemplo.com"
                  value={formData.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  className="input-field"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="document">CPF / CNPJ</Label>
                  <Input
                    id="document"
                    placeholder="000.000.000-00"
                    value={formData.document}
                    onChange={(e) => updateField("document", formatDocument(e.target.value))}
                    className="input-field"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="birthDate">Data Nasc.</Label>
                  <Input
                    id="birthDate"
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => updateField("birthDate", e.target.value)}
                    className="input-field"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="(00) 00000-0000"
                  value={formData.phone}
                  onChange={(e) => updateField("phone", formatPhone(e.target.value))}
                  className="input-field"
                />
              </div>

              <Button type="button" onClick={handleNext} className="w-full btn-primary mt-6">
                Próximo
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-slide-up">
              <AddressManager addresses={addresses} onAddressesChange={setAddresses} />

              <div className="flex gap-3 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="flex-1"
                >
                  Voltar
                </Button>
                <Button
                  type="submit"
                  className="flex-1 btn-primary"
                  disabled={updateClient.isPending}
                >
                  {updateClient.isPending ? "Salvando..." : "Salvar"}
                </Button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
