import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { TopNav } from "@/components/layout/TopNav";
import { DesktopHeader } from "@/components/layout/DesktopHeader";
import { Camera, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { CustomFieldsRenderer, CustomFieldValue } from "@/components/form/CustomFieldsRenderer";

import { useServices } from "@/hooks/useServices";
import { useStorage } from "@/hooks/useStorage";
import { ImageUploader } from "@/components/form/ImageUploader";

export default function NewServicePage() {
  const navigate = useNavigate();
  const { createService } = useServices();
  const { deleteImage } = useStorage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [customFieldValues, setCustomFieldValues] = useState<CustomFieldValue[]>([]);

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
      const customFieldsObject = customFieldValues.reduce((acc, curr) => ({
        ...acc,
        [curr.fieldId]: curr.value
      }), {});

      await createService.mutateAsync({
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        active: true,
        customFields: customFieldsObject,
        imageUrl: imageUrl
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
              <ImageUploader
                value={imageUrl}
                onChange={handleImageChange}
              />
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
