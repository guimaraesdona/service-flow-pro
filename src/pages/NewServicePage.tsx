import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TopNav } from "@/components/layout/TopNav";
import { DesktopHeader } from "@/components/layout/DesktopHeader";
import { Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { CustomFieldsRenderer, CustomFieldValue } from "@/components/form/CustomFieldsRenderer";

import { useServices } from "@/hooks/useServices";

export default function NewServicePage() {
  const navigate = useNavigate();
  const { createService } = useServices();
  const [customFieldValues, setCustomFieldValues] = useState<CustomFieldValue[]>([]);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
  });

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.price) {
      toast({
        title: "Campos obrigatórios",
        description: "Nome e valor são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    try {
      await createService.mutateAsync({
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        active: true
      });

      toast({
        title: "Serviço cadastrado!",
        description: `${formData.name} foi adicionado com sucesso.`,
      });
      navigate("/servicos");
    } catch (error: any) {
      toast({
        title: "Erro ao cadastrar",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="page-container bg-background">
      {/* Mobile Header */}
      <div className="lg:hidden">
        <TopNav title="Novo Serviço" showBack />
      </div>

      {/* Desktop Header */}
      <div className="hidden lg:block">
        <DesktopHeader title="Novo Serviço" />
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

            <div className="space-y-2">
              <Label htmlFor="name">Nome do Serviço *</Label>
              <Input
                id="name"
                placeholder="Ex: Manutenção Preventiva"
                value={formData.name}
                onChange={(e) => updateField("name", e.target.value)}
                className="input-field"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                placeholder="Descreva o serviço..."
                value={formData.description}
                onChange={(e) => updateField("description", e.target.value)}
                className="min-h-24 bg-secondary/50 border-0 focus:ring-2 focus:ring-primary/20 resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Valor Base (R$) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                placeholder="0,00"
                value={formData.price}
                onChange={(e) => updateField("price", e.target.value)}
                className="input-field"
                required
              />
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-5">
            {/* Custom Fields */}
            <CustomFieldsRenderer
              entityType="service"
              values={customFieldValues}
              onValuesChange={setCustomFieldValues}
            />

            <Button
              type="submit"
              className="w-full btn-primary mt-6"
              disabled={createService.isPending}
            >
              {createService.isPending ? "Salvando..." : "Cadastrar"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
