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

const mockClients: Record<string, Client> = {
  "1": {
    id: "1",
    name: "Maria Silva",
    email: "maria@email.com",
    phone: "(11) 99999-1111",
    document: "123.456.789-00",
    birthDate: "1985-03-15",
    addresses: [
      {
        id: "1",
        label: "Casa",
        cep: "01310-100",
        street: "Av. Paulista",
        number: "1000",
        complement: "Sala 501",
        neighborhood: "Bela Vista",
        city: "São Paulo",
        state: "SP",
        isDefault: true
      }
    ]
  },
  // ... mock data simplified
  "2": { id: "2", name: "João Santos", email: "joao@email.com", phone: "(11) 99999-2222", document: "987.654.321-00", birthDate: "1990-07-20", addresses: [] },
  "3": { id: "3", name: "Ana Oliveira", email: "ana@email.com", phone: "(11) 99999-3333", document: "456.789.123-00", birthDate: "1988-11-10", addresses: [] },
  "4": { id: "4", name: "Carlos Mendes", email: "carlos@email.com", phone: "(11) 99999-4444", document: "789.123.456-00", birthDate: "1982-05-25", addresses: [] },
  "5": { id: "5", name: "Paula Costa", email: "paula@email.com", phone: "(11) 99999-5555", document: "321.654.987-00", birthDate: "1995-09-08", addresses: [] },
};

export default function EditClientPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    document: "",
    birthDate: "",
    phone: "",
  });

  const [addresses, setAddresses] = useState<Address[]>([]);

  useEffect(() => {
    if (id && mockClients[id]) {
      const client = mockClients[id];
      setFormData({
        name: client.name,
        email: client.email,
        document: client.document,
        birthDate: client.birthDate,
        phone: client.phone,
      });
      setAddresses(client.addresses);
    }
  }, [id]);

  const client = id ? mockClients[id] : null;

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
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Cliente atualizado!",
        description: `${formData.name} foi atualizado com sucesso.`,
      });
      navigate(`/clientes/${id}`);
    }, 1000);
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
                  disabled={isLoading}
                >
                  {isLoading ? "Salvando..." : "Salvar"}
                </Button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
