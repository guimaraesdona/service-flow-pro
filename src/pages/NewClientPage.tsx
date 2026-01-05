import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TopNav } from "@/components/layout/TopNav";
import { ArrowRight, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

export default function NewClientPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    document: "",
    birthDate: "",
    phone: "",
    cep: "",
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
  });

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
        title: "Cliente cadastrado!",
        description: `${formData.name} foi adicionado com sucesso.`,
      });
      navigate("/clientes");
    }, 1000);
  };

  return (
    <div className="page-container bg-background">
      <TopNav title="Novo Cliente" showBack />

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
                    onChange={(e) => updateField("document", e.target.value)}
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
                  onChange={(e) => updateField("phone", e.target.value)}
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
              <div className="space-y-2">
                <Label htmlFor="cep">CEP</Label>
                <Input
                  id="cep"
                  placeholder="00000-000"
                  value={formData.cep}
                  onChange={(e) => updateField("cep", e.target.value)}
                  className="input-field"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="street">Logradouro</Label>
                <Input
                  id="street"
                  placeholder="Rua, Avenida..."
                  value={formData.street}
                  onChange={(e) => updateField("street", e.target.value)}
                  className="input-field"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="number">Número</Label>
                  <Input
                    id="number"
                    placeholder="000"
                    value={formData.number}
                    onChange={(e) => updateField("number", e.target.value)}
                    className="input-field"
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="complement">Complemento</Label>
                  <Input
                    id="complement"
                    placeholder="Apto, Sala..."
                    value={formData.complement}
                    onChange={(e) => updateField("complement", e.target.value)}
                    className="input-field"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="neighborhood">Bairro</Label>
                <Input
                  id="neighborhood"
                  placeholder="Seu bairro"
                  value={formData.neighborhood}
                  onChange={(e) => updateField("neighborhood", e.target.value)}
                  className="input-field"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="city">Cidade</Label>
                  <Input
                    id="city"
                    placeholder="Sua cidade"
                    value={formData.city}
                    onChange={(e) => updateField("city", e.target.value)}
                    className="input-field"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">Estado</Label>
                  <Input
                    id="state"
                    placeholder="UF"
                    value={formData.state}
                    onChange={(e) => updateField("state", e.target.value)}
                    className="input-field"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full btn-primary mt-6"
                disabled={isLoading}
              >
                {isLoading ? "Salvando..." : "Cadastrar"}
              </Button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
