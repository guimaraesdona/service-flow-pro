import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { TopNav } from "@/components/layout/TopNav";
import { DesktopHeader } from "@/components/layout/DesktopHeader";
import { ArrowRight, Camera, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { CustomFieldsRenderer, CustomFieldValue } from "@/components/form/CustomFieldsRenderer";
import { AddressManager } from "@/components/client/AddressManager";
import { Address } from "@/types";
import { formatDocument, formatPhone } from "@/lib/formatters";
import { maskPhone, maskDocument } from "@/utils/masks";
import { validateEmail, validateDocument } from "@/utils/validations";

import { useClients } from "@/hooks/useClients";
import { useStorage } from "@/hooks/useStorage";
import { ImageUploader } from "@/components/form/ImageUploader";
import { useCustomFieldDefinitions } from "@/hooks/useCustomFieldDefinitions";

export default function NewClientPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  const { createClient } = useClients();
  const { deleteImage } = useStorage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [customFieldValues, setCustomFieldValues] = useState<CustomFieldValue[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const { fields: customFieldsDefinitions } = useCustomFieldDefinitions("client");

  const handleImageChange = async (newUrl: string) => {
    if (avatarUrl && avatarUrl !== newUrl) {
      try {
        await deleteImage(avatarUrl);
      } catch (error) {
        console.error("Failed to delete transient image:", error);
      }
    }
    setAvatarUrl(newUrl);
  };

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    document: "",
    birthDate: "",
    phone: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [customFieldErrors, setCustomFieldErrors] = useState<Record<string, string>>({});

  const validateField = (field: string, value: string) => {
    let error = "";

    // Mandatory fields
    if (!value && ["name", "email", "document", "birthDate", "phone"].includes(field)) {
      error = "Campo obrigatório";
    }

    if (!error) {
      if (field === "email" && value && !validateEmail(value)) {
        error = "Email inválido";
      }
      if (field === "document" && value) {
        if (!validateDocument(value)) {
          error = "CPF/CNPJ inválido";
        }
      }
    }

    setErrors((prev) => ({ ...prev, [field]: error }));
    return !error;
  };

  const handleBlur = (field: string) => {
    validateField(field, formData[field as keyof typeof formData]);
  };

  const updateField = (field: string, value: string) => {
    let newValue = value;
    if (field === "document") {
      newValue = maskDocument(value);
    } else if (field === "phone") {
      newValue = maskPhone(value);
    }

    setFormData((prev) => ({ ...prev, [field]: newValue }));

    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };



  const handleNext = () => {
    // Validate all fields for step 1
    const fieldsToValidate = ["name", "email", "document", "birthDate", "phone"];
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
        description: "Por favor, corrija os erros destacados antes de prosseguir.",
        variant: "destructive",
      });
      return;
    }
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const customFieldsObject = customFieldValues.reduce((acc, curr) => ({
        ...acc,
        [curr.fieldId]: curr.value
      }), {});

      await createClient.mutateAsync({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        document: formData.document,
        birthDate: formData.birthDate,
        addresses: addresses,
        customFields: customFieldsObject,
        avatar: avatarUrl
      });

      toast({
        title: "Cliente cadastrado!",
        description: `${formData.name} foi adicionado com sucesso.`,
      });
      navigate("/clientes");
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
      <div className="lg:hidden">
        <TopNav title="Novo Cliente" showBack />
      </div>
      <div className="hidden lg:block">
        <DesktopHeader title="Novo Cliente" />
      </div>

      <div className="max-w-lg mx-auto w-full px-6 pt-4 lg:max-w-none lg:px-8">
        <div className="flex items-center gap-2">
          <div className={`h-1.5 flex-1 rounded-full transition-colors ${step >= 1 ? "bg-primary" : "bg-secondary"}`} />
          <div className={`h-1.5 flex-1 rounded-full transition-colors ${step >= 2 ? "bg-primary" : "bg-secondary"}`} />
        </div>
        <p className="text-xs text-muted-foreground mt-2">Passo {step} de 2</p>
      </div>

      <div className="content-container">
        <form onSubmit={handleSubmit} className="lg:grid lg:grid-cols-2 lg:gap-8">
          {step === 1 && (
            <>
              <div className="space-y-4 animate-slide-up">
                <div className="flex justify-center mb-6 lg:justify-start">
                  <ImageUploader
                    value={avatarUrl}
                    onChange={setAvatarUrl}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Nome / Razão Social *</Label>
                  <div className="space-y-1">
                    <Input
                      id="name"
                      placeholder="Nome completo"
                      value={formData.name}
                      onChange={(e) => updateField("name", e.target.value)}
                      onBlur={() => handleBlur("name")}
                      className={`input-field ${errors.name ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                    />
                    {errors.name && <p className="text-xs font-semibold text-red-500 animate-fade-in">{errors.name}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <div className="space-y-1">
                    <Input
                      id="email"
                      type="email"
                      placeholder="email@exemplo.com"
                      value={formData.email}
                      onChange={(e) => updateField("email", e.target.value)}
                      onBlur={() => handleBlur("email")}
                      className={`input-field ${errors.email ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                    />
                    {errors.email && <p className="text-xs font-semibold text-red-500 animate-fade-in">{errors.email}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="document">CPF / CNPJ *</Label>
                    <div className="space-y-1">
                      <Input
                        id="document"
                        placeholder="000.000.000-00"
                        value={formData.document}
                        onChange={(e) => updateField("document", e.target.value)}
                        onBlur={() => handleBlur("document")}
                        className={`input-field ${errors.document ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                        maxLength={18}
                      />
                      {errors.document && <p className="text-xs font-semibold text-red-500 animate-fade-in">{errors.document}</p>}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="birthDate">Data Nasc. / Abertura *</Label>
                    <div className="space-y-1">
                      <Input
                        id="birthDate"
                        type="date"
                        value={formData.birthDate}
                        onChange={(e) => updateField("birthDate", e.target.value)}
                        onBlur={() => handleBlur("birthDate")}
                        className={`input-field ${errors.birthDate ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                      />
                      {errors.birthDate && <p className="text-xs font-semibold text-red-500 animate-fade-in">{errors.birthDate}</p>}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone *</Label>
                  <div className="space-y-1">
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="(00) 00000-0000"
                      value={formData.phone}
                      onChange={(e) => updateField("phone", e.target.value)}
                      onBlur={() => handleBlur("phone")}
                      className={`input-field ${errors.phone ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                      maxLength={15}
                    />
                    {errors.phone && <p className="text-xs font-semibold text-red-500 animate-fade-in">{errors.phone}</p>}
                  </div>
                </div>
              </div>

              <div className="space-y-4 animate-slide-up mt-4 lg:mt-0">
                <CustomFieldsRenderer entityType="client" values={customFieldValues} onValuesChange={setCustomFieldValues} errors={customFieldErrors} />
                <Button type="button" onClick={handleNext} className="w-full btn-primary mt-6">
                  Próximo <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="space-y-4 animate-slide-up">
                <AddressManager addresses={addresses} onAddressesChange={setAddresses} />
              </div>

              <div className="space-y-4 animate-slide-up mt-4 lg:mt-0">
                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1">Voltar</Button>
                  <Button type="submit" className="flex-1 btn-primary" disabled={createClient.isPending}>{createClient.isPending ? "Salvando..." : "Cadastrar"}</Button>
                </div>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
