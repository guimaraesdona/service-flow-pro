import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { TopNav } from "@/components/layout/TopNav";
import { Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { CustomFieldsRenderer, CustomFieldValue } from "@/components/form/CustomFieldsRenderer";

import { useServices } from "@/hooks/useServices";
import { useStorage } from "@/hooks/useStorage";

export default function EditServicePage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { services, updateService } = useServices();
  const { uploadImage, isUploading } = useStorage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const service = services?.find(s => s.id === id);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
  });

  const [customFieldValues, setCustomFieldValues] = useState<CustomFieldValue[]>([]);
  const [imageUrl, setImageUrl] = useState<string>("");

  useEffect(() => {
    if (service) {
      setFormData({
        name: service.name,
        description: service.description || "",
        price: service.price.toString(),
      });
      setImageUrl(service.imageUrl || "");

      if (service.customFields) {
        const values: CustomFieldValue[] = Object.entries(service.customFields).map(([key, value]) => ({
          fieldId: key,
          value: value as string | number | boolean
        }));
        setCustomFieldValues(values);
      }
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

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = await uploadImage(file, "app-images");
      if (url) {
        setImageUrl(url);
        toast({
          title: "Imagem enviada",
          description: "Imagem atualizada com sucesso.",
        });
      } else {
        toast({
          title: "Erro",
          description: "Falha ao enviar imagem.",
          variant: "destructive",
        });
      }
    }
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
      const customFieldsObject = customFieldValues.reduce((acc, curr) => ({
        ...acc,
        [curr.fieldId]: curr.value
      }), {});

      await updateService.mutateAsync({
        id,
        data: {
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price),
          customFields: customFieldsObject,
          imageUrl: imageUrl
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
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleFileSelect}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-24 h-24 rounded-xl bg-secondary border-2 border-dashed border-border flex items-center justify-center hover:border-primary/50 transition-colors overflow-hidden relative"
            >
              {imageUrl ? (
                <img src={imageUrl} alt="Service" className="w-full h-full object-cover" />
              ) : (
                <Camera className="w-8 h-8 text-muted-foreground" />
              )}
              {isUploading && (
                <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
                  <span className="text-xs font-bold">...</span>
                </div>
              )}
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

          <CustomFieldsRenderer
            entityType="service"
            values={customFieldValues}
            onValuesChange={setCustomFieldValues}
          />

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
