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
import { useCustomFieldDefinitions } from "@/hooks/useCustomFieldDefinitions";
import { ImageUploader } from "@/components/form/ImageUploader";

export default function EditServicePage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { services, updateService } = useServices();
  const { fields: customFieldsDefinitions } = useCustomFieldDefinitions("service");

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
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [customFieldErrors, setCustomFieldErrors] = useState<Record<string, string>>({});

  const validateField = (field: string, value: string) => {
    let error = "";
    if (field !== "description" && !value) {
      error = "Campo obrigatório";
    }
    if (field === "price" && value) {
      const price = parseFloat(value);
      if (isNaN(price) || price < 0) {
        error = "Valor não pode ser negativo";
      }
    }
    setErrors((prev) => ({ ...prev, [field]: error }));
    return !error;
  };

  const handleBlur = (field: string) => {
    validateField(field, formData[field as keyof typeof formData] as string);
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

    const fieldsToValidate = ["name", "price"];
    let hasErrors = false;

    fieldsToValidate.forEach(field => {
        const isValid = validateField(field, formData[field as keyof typeof formData]);
        if (!isValid) hasErrors = true;
    });

    setCustomFieldErrors({});

    // Validate Custom Fields
    const missingFields = customFieldsDefinitions.filter(field => {
        if (!field.required) return false;
        const val = customFieldValues.find(v => v.fieldId === field.id)?.value;
        if (val === undefined || val === "" || val === null) return true;
        if (Array.isArray(val) && val.length === 0) return true;
        return false;
    });

    if (missingFields.length > 0) {
        const newCustomErrors: Record<string, string> = {};
        missingFields.forEach(f => {
            newCustomErrors[f.id] = "Campo obrigatório";
        });
        setCustomFieldErrors(newCustomErrors);
        hasErrors = true;
    }

    if (hasErrors) {
      toast({
        title: "Campos inválidos",
        description: "Por favor, corrija os erros destacados.",
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
              onBlur={() => handleBlur("name")}
              className={`input-field ${errors.name ? "border-red-500 focus-visible:ring-red-500" : ""}`}
              required
            />
            {errors.name && <p className="text-xs font-semibold text-red-500 animate-fade-in">{errors.name}</p>}
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
              onBlur={() => handleBlur("price")}
              className={`input-field ${errors.price ? "border-red-500 focus-visible:ring-red-500" : ""}`}
              required
            />
            {errors.price && <p className="text-xs font-semibold text-red-500 animate-fade-in">{errors.price}</p>}
          </div>

          <CustomFieldsRenderer
            entityType="service"
            values={customFieldValues}
            onValuesChange={setCustomFieldValues}
            errors={customFieldErrors}
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
