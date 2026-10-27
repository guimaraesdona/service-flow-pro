import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TopNav } from "@/components/layout/TopNav";
import { DesktopHeader } from "@/components/layout/DesktopHeader";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { CustomFieldsRenderer, CustomFieldValue } from "@/components/form/CustomFieldsRenderer";
import { AddressManager } from "@/components/client/AddressManager";
import { Address } from "@/types";
import { maskPhone, maskDocument } from "@/utils/masks";
import { validateEmail, validateDocument } from "@/utils/validations";

import { useClients } from "@/hooks/useClients";
import { useStorage } from "@/hooks/useStorage";
import { ImageUploader } from "@/components/form/ImageUploader";
import { useCustomFieldDefinitions } from "@/hooks/useCustomFieldDefinitions";
import { DatePicker } from "@/components/form/DatePicker";

export default function NewClientPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  const { createClient } = useClients();
  const { deleteImage } = useStorage();
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
    } catch (error) {
      toast({
        title: "Erro ao cadastrar",
        description: error instanceof Error ? error.message : "Não foi possível cadastrar o cliente.",
        variant: "destructive",
      });
    }
  };

  const inputClass = (field: string) =>
    `input-field ${errors[field] ? "border-destructive focus-visible:ring-destructive" : ""}`;

  const fieldError = (field: string) =>
    errors[field] ? (
      <p id={`${field}-error`} role="alert" className="text-xs font-semibold text-destructive">
        {errors[field]}
      </p>
    ) : null;

  const a11y = (field: string) => ({
    id: field,
    "aria-invalid": !!errors[field],
    "aria-describedby": errors[field] ? `${field}-error` : undefined,
  });

  return (
    <div className="page-container bg-background">
      <div className="lg:hidden">
        <TopNav title="Novo cliente" showBack />
      </div>
      <DesktopHeader title="Novo cliente" />

      <div className="content-container">
        <div className="max-w-2xl mx-auto space-y-4">
          <div>
            <div className="flex items-center gap-2" aria-hidden="true">
              <div className={`h-1.5 flex-1 rounded-full transition-colors ${step >= 1 ? "bg-primary" : "bg-secondary"}`} />
              <div className={`h-1.5 flex-1 rounded-full transition-colors ${step >= 2 ? "bg-primary" : "bg-secondary"}`} />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Passo {step} de 2 · {step === 1 ? "Dados do cliente" : "Endereços"}
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {step === 1 && (
              <>
                <section className="card-elevated p-4 lg:p-5 space-y-4">
                  <h2 className="text-sm font-semibold text-foreground">Dados</h2>
                  <ImageUploader value={avatarUrl} onChange={handleImageChange} />

                  <div className="space-y-2">
                    <Label htmlFor="name">Nome / razão social *</Label>
                    <Input
                      {...a11y("name")}
                      placeholder="Nome completo"
                      value={formData.name}
                      onChange={(e) => updateField("name", e.target.value)}
                      onBlur={() => handleBlur("name")}
                      className={inputClass("name")}
                    />
                    {fieldError("name")}
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="document">CPF / CNPJ *</Label>
                      <Input
                        {...a11y("document")}
                        inputMode="numeric"
                        placeholder="000.000.000-00"
                        value={formData.document}
                        onChange={(e) => updateField("document", e.target.value)}
                        onBlur={() => handleBlur("document")}
                        className={inputClass("document")}
                        maxLength={18}
                      />
                      {fieldError("document")}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="birthDate">Nascimento / abertura *</Label>
                      <DatePicker
                        id="birthDate"
                        aria-describedby={errors.birthDate ? "birthDate-error" : undefined}
                        historical
                        value={formData.birthDate}
                        invalid={!!errors.birthDate}
                        onChange={(next) => updateField("birthDate", next)}
                        onBlur={() => handleBlur("birthDate")}
                      />
                      {fieldError("birthDate")}
                    </div>
                  </div>
                </section>

                <section className="card-elevated p-4 lg:p-5 space-y-4">
                  <h2 className="text-sm font-semibold text-foreground">Contato</h2>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        {...a11y("email")}
                        type="email"
                        placeholder="email@exemplo.com"
                        value={formData.email}
                        onChange={(e) => updateField("email", e.target.value)}
                        onBlur={() => handleBlur("email")}
                        className={inputClass("email")}
                      />
                      {fieldError("email")}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefone *</Label>
                      <Input
                        {...a11y("phone")}
                        type="tel"
                        placeholder="(00) 00000-0000"
                        value={formData.phone}
                        onChange={(e) => updateField("phone", e.target.value)}
                        onBlur={() => handleBlur("phone")}
                        className={inputClass("phone")}
                        maxLength={15}
                      />
                      {fieldError("phone")}
                    </div>
                  </div>
                </section>

                {customFieldsDefinitions.length > 0 && (
                  <section className="card-elevated p-4 lg:p-5 space-y-4">
                    <h2 className="text-sm font-semibold text-foreground">Campos personalizados</h2>
                    <CustomFieldsRenderer entityType="client" values={customFieldValues} onValuesChange={setCustomFieldValues} errors={customFieldErrors} />
                  </section>
                )}

                <div className="flex lg:justify-end">
                  <Button type="button" onClick={handleNext} className="w-full lg:w-auto lg:px-8 btn-primary">
                    Próximo <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <section className="card-elevated p-4 lg:p-5">
                  <AddressManager addresses={addresses} onAddressesChange={setAddresses} />
                </section>

                <div className="flex gap-3 lg:justify-end">
                  <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1 lg:flex-none lg:px-6">
                    Voltar
                  </Button>
                  <Button type="submit" className="flex-1 lg:flex-none lg:px-8 btn-primary" disabled={createClient.isPending}>
                    {createClient.isPending ? "Salvando..." : "Cadastrar cliente"}
                  </Button>
                </div>
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
