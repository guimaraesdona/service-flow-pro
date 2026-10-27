import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { TopNav } from "@/components/layout/TopNav";
import { DesktopHeader } from "@/components/layout/DesktopHeader";
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
  const { services, isLoading, updateService } = useServices();
  const { fields: customFieldsDefinitions } = useCustomFieldDefinitions("service");

  const { deleteImage } = useStorage();

  const service = services?.find(s => s.id === id);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
  });

  const [customFieldValues, setCustomFieldValues] = useState<CustomFieldValue[]>([]);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [customFieldErrors, setCustomFieldErrors] = useState<Record<string, string>>({});

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

  if (isLoading) {
    return (
      <div className="page-container bg-background">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="page-container bg-background">
        <div className="lg:hidden">
          <TopNav title="Editar serviço" showBack />
        </div>
        <DesktopHeader title="Editar serviço" />
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
    } catch (error) {
      toast({
        title: "Erro ao atualizar",
        description: error instanceof Error ? error.message : "Não foi possível salvar o serviço.",
        variant: "destructive",
      });
    }
  };

  const fieldError = (field: string) =>
    errors[field] ? (
      <p id={`${field}-error`} role="alert" className="text-xs font-semibold text-destructive">
        {errors[field]}
      </p>
    ) : null;

  const inputClass = (field: string) =>
    `input-field ${errors[field] ? "border-destructive focus-visible:ring-destructive" : ""}`;

  return (
    <div className="page-container bg-background">
      <div className="lg:hidden">
        <TopNav title="Editar serviço" showBack />
      </div>
      <DesktopHeader title="Editar serviço" />

      <div className="content-container">
        <form onSubmit={handleSubmit} noValidate className="max-w-2xl mx-auto space-y-4">
          <section className="card-elevated p-4 lg:p-5 space-y-4">
            <h2 className="text-sm font-semibold text-foreground">Serviço</h2>
            <ImageUploader value={imageUrl} onChange={handleImageChange} />

            <div className="space-y-2">
              <Label htmlFor="name">Nome do serviço *</Label>
              <Input
                id="name"
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? "name-error" : undefined}
                placeholder="Ex: Manutenção preventiva"
                value={formData.name}
                onChange={(e) => updateField("name", e.target.value)}
                onBlur={() => handleBlur("name")}
                className={inputClass("name")}
              />
              {fieldError("name")}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                placeholder="O que está incluído no serviço"
                value={formData.description}
                onChange={(e) => updateField("description", e.target.value)}
                className="min-h-24 resize-none"
              />
            </div>
          </section>

          <section className="card-elevated p-4 lg:p-5 space-y-4">
            <h2 className="text-sm font-semibold text-foreground">Preço</h2>
            <div className="space-y-2 sm:max-w-xs">
              <Label htmlFor="price">Valor base (R$) *</Label>
              <Input
                id="price"
                aria-invalid={!!errors.price}
                aria-describedby={errors.price ? "price-error" : "price-hint"}
                type="number"
                inputMode="decimal"
                step="0.01"
                placeholder="0,00"
                value={formData.price}
                onChange={(e) => updateField("price", e.target.value)}
                onBlur={() => handleBlur("price")}
                className={`${inputClass("price")} tabular`}
              />
              {fieldError("price") ?? (
                <p id="price-hint" className="text-xs text-muted-foreground">
                  Sugerido ao adicionar o serviço numa OS; dá para mudar em cada ordem.
                </p>
              )}
            </div>
          </section>

          {customFieldsDefinitions.length > 0 && (
            <section className="card-elevated p-4 lg:p-5 space-y-4">
              <h2 className="text-sm font-semibold text-foreground">Campos personalizados</h2>
              <CustomFieldsRenderer
                entityType="service"
                values={customFieldValues}
                onValuesChange={setCustomFieldValues}
                errors={customFieldErrors}
              />
            </section>
          )}

          <div className="flex lg:justify-end">
            <Button type="submit" className="w-full lg:w-auto lg:px-8 btn-primary" disabled={updateService.isPending}>
              {updateService.isPending ? "Salvando..." : "Salvar alterações"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
