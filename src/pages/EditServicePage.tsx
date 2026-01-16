import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { TopNav } from "@/components/layout/TopNav";
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

export default function EditServicePage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { services, updateService } = useServices();

  const { deleteImage } = useStorage();
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
  const handleImageChange = async (newUrl: string) => {
    // If there is a current image in state, and it is diverse from the one in DB (meaning it's a new upload),
    // and we are replacing it or removing it, we should delete this transient file to avoid orphans.
    if (imageUrl && imageUrl !== service?.imageUrl && imageUrl !== newUrl) {
      try {
        await deleteImage(imageUrl);
      } catch (error) {
        console.error("Failed to delete transient image:", error);
      }
    }
    setImageUrl(newUrl);
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
      // Delete old image if it changed
      if (service?.imageUrl && service.imageUrl !== imageUrl) {
        await deleteImage(service.imageUrl).catch((err) => {
          console.error("Failed to delete old image:", err);
          toast({
            title: "Aviso",
            description: "A imagem antiga não pôde ser removida do armazenamento, mas o registro foi atualizado.",
            variant: "destructive"
          });
        });
      }

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
