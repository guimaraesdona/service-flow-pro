import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { TopNav } from "@/components/layout/TopNav";
import { Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";

import { useServices } from "@/hooks/useServices";

export default function EditServicePage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { services, updateService } = useServices();

  const service = services?.find(s => s.id === id);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
  });

  useEffect(() => {
    if (service) {
      setFormData({
        name: service.name,
        description: service.description || "",
        price: service.price.toString(),
      });
    }
  }, [service]);

  if (!service) {
    return (
      <div className="page-container bg-background">
        <TopNav title="Editar Serviço" showBack />
        <div className="content-container">
          <div className="text-center py-16">
            <p className="text-muted-foreground">Serviço não encontrado</p>
          </div>
        </div>
      </div>
    );
  }

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

    if (!id) return;

    try {
      await updateService.mutateAsync({
        id,
        data: {
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price),
        }
      });

      toast({
        title: "Serviço atualizado!",
        description: `${formData.name} foi atualizado com sucesso.`,
      });
      navigate(`/servicos/${id}`);
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
      <TopNav title="Editar Serviço" showBack />

      <div className="content-container">
        <form onSubmit={handleSubmit} className="space-y-5 animate-slide-up">
          {/* Image */}
          <div className="flex justify-center mb-6">
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

          <Button
            type="submit"
            className="w-full btn-primary mt-6"
            disabled={updateService.isPending}
          >
            {updateService.isPending ? "Salvando..." : "Salvar"}
          </Button>
        </form>
      </div>
    </div>
  );
}
