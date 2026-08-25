import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CustomField } from "@/components/settings/CustomFieldsSettings";
import { useCustomFieldDefinitions } from "@/hooks/useCustomFieldDefinitions";
import { maskPhone, maskDocument, maskCEP, maskPlate } from "@/utils/masks";
import { validateEmail, validateDocument, validatePlate } from "@/utils/validations";
import { useState } from "react";

export interface CustomFieldValue {
  fieldId: string;
  value: string | number | boolean | string[];
}

interface CustomFieldsRendererProps {
  entityType: "order" | "client" | "service";
  values: CustomFieldValue[];
  onValuesChange: (values: CustomFieldValue[]) => void;
  errors?: Record<string, string>;
}

export function CustomFieldsRenderer({
  entityType,
  values,
  onValuesChange,
  errors: externalErrors = {},
}: CustomFieldsRendererProps) {
  const { fields, isLoading } = useCustomFieldDefinitions(entityType);
  const [internalErrors, setInternalErrors] = useState<Record<string, string>>({});

  const errors = { ...internalErrors, ...externalErrors };

  if (isLoading || fields.length === 0) {
    return null;
  }

  const updateFieldValue = (fieldId: string, value: string | number | boolean | string[]) => {
    // Clear error on change
    if (internalErrors[fieldId]) {
        setInternalErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[fieldId];
            return newErrors;
        });
    }

    const existingIndex = values.findIndex((v) => v.fieldId === fieldId);
    if (existingIndex >= 0) {
      const updatedValues = [...values];
      updatedValues[existingIndex] = { fieldId, value };
      onValuesChange(updatedValues);
    } else {
      onValuesChange([...values, { fieldId, value }]);
    }
  };

  const validateField = (field: CustomField, value: any) => {
    let error = "";
    if (field.required && !value) {
        error = "Campo obrigatório";
    } else if (value) {
        switch (field.type) {
            case "email":
                if (!validateEmail(value as string)) error = "E-mail inválido";
                break;
            case "document":
                if (!validateDocument(value as string)) error = "CPF/CNPJ inválido";
                break;
            case "phone":
                if ((value as string).length < 14) error = "Telefone incompleto";
                break;
            case "zip":
                if ((value as string).length < 9) error = "CEP incompleto";
                break;
            case "plate":
                if (!validatePlate(value as string)) error = "Placa inválida";
                break;
        }
    }
    setInternalErrors(prev => ({ ...prev, [field.id]: error }));
    return !error;
  };

  const getFieldValue = (fieldId: string): string | number | boolean | string[] => {
    const found = values.find((v) => v.fieldId === fieldId);
    return found?.value ?? "";
  };

  const renderFieldInput = (field: CustomField) => {
    const value = getFieldValue(field.id);

    switch (field.type) {
       case "text":
        return (
          <Input
            value={value as string}
            onChange={(e) => updateFieldValue(field.id, e.target.value)}
            onBlur={() => validateField(field, value)}
            placeholder={field.placeholder || `Digite ${field.name.toLowerCase()}`}
            className={`input-field ${errors[field.id] ? "border-red-500 focus-visible:ring-red-500" : ""}`}
          />
        );
      case "email":
        return (
          <Input
            type="email"
            value={value as string}
            onChange={(e) => updateFieldValue(field.id, e.target.value)}
            onBlur={() => validateField(field, value)}
            placeholder={field.placeholder || "exemplo@email.com"}
            className={`input-field ${errors[field.id] ? "border-red-500 focus-visible:ring-red-500" : ""}`}
          />
        );
      case "phone":
        return (
          <Input
            value={value as string}
            onChange={(e) => updateFieldValue(field.id, maskPhone(e.target.value))}
            onBlur={() => validateField(field, value)}
            placeholder={field.placeholder || "(00) 00000-0000"}
            maxLength={15}
            className={`input-field ${errors[field.id] ? "border-red-500 focus-visible:ring-red-500" : ""}`}
          />
        );
      case "document":
        return (
          <Input
            value={value as string}
            onChange={(e) => updateFieldValue(field.id, maskDocument(e.target.value))}
            onBlur={() => validateField(field, value)}
            placeholder={field.placeholder || "000.000.000-00"}
            maxLength={18}
            className={`input-field ${errors[field.id] ? "border-red-500 focus-visible:ring-red-500" : ""}`}
          />
        );
      case "zip":
        return (
          <Input
            value={value as string}
            onChange={(e) => updateFieldValue(field.id, maskCEP(e.target.value))}
            onBlur={() => validateField(field, value)}
            placeholder={field.placeholder || "00000-000"}
            maxLength={9}
            className={`input-field ${errors[field.id] ? "border-red-500 focus-visible:ring-red-500" : ""}`}
            />
        );
      case "plate":
        return (
          <Input
            value={value as string}
            onChange={(e) => updateFieldValue(field.id, maskPlate(e.target.value))}
            onBlur={() => validateField(field, value)}
            placeholder={field.placeholder || "ABC-1234"}
            maxLength={8}
            className={`input-field ${errors[field.id] ? "border-red-500 focus-visible:ring-red-500" : ""}`}
          />
        );
      case "number":
        return (
          <Input
            type="number"
            value={value as number}
            onChange={(e) => updateFieldValue(field.id, parseFloat(e.target.value) || 0)}
            placeholder={field.placeholder || "0"}
            className="input-field"
          />
        );
      case "date":
        return (
          <Input
            type="date"
            value={value as string}
            onChange={(e) => updateFieldValue(field.id, e.target.value)}
            className="input-field"
          />
        );
      case "select":
        return (
          <Select
            value={value as string}
            onValueChange={(v) => updateFieldValue(field.id, v)}
          >
            <SelectTrigger className="input-field">
              <SelectValue placeholder={`Selecione ${field.name.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case "multiselect":
        const currentSelected = Array.isArray(value) ? value : [];
        return (
          <div className="space-y-2 border p-3 rounded-md bg-secondary/20">
             {field.options?.map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${field.id}-${option}`}
                    checked={currentSelected.includes(option)}
                    onCheckedChange={(checked) => {
                       let newSelected = [...currentSelected];
                       if (checked) {
                         newSelected.push(option);
                       } else {
                         newSelected = newSelected.filter(o => o !== option);
                       }
                       updateFieldValue(field.id, newSelected);
                    }}
                  />
                  <Label htmlFor={`${field.id}-${option}`} className="font-normal cursor-pointer">
                    {option}
                  </Label>
                </div>
             ))}
          </div>
        );
      case "textarea":
        return (
          <textarea
            value={value as string}
            onChange={(e) => updateFieldValue(field.id, e.target.value)}
            placeholder={field.placeholder || `Digite ${field.name.toLowerCase()}`}
            className="w-full min-h-20 p-3 bg-secondary/50 border-0 rounded-md focus:ring-2 focus:ring-primary/20 transition-all resize-none"
          />
        );
      case "checkbox":
        return (
          <div className="flex items-center gap-2">
            <Switch
              checked={value as boolean}
              onCheckedChange={(checked) => updateFieldValue(field.id, checked)}
            />
            <span className="text-sm text-muted-foreground">
              {value ? "Sim" : "Não"}
            </span>
          </div>
        );
      default:
        return null; // Fallback for types not explicitly handled in switch but existing in types
    }
  };

  return (
    <div className="space-y-4">
      <Label className="text-sm font-medium text-muted-foreground">
        Campos Personalizados
      </Label>
      <div className="space-y-3">
        {fields.map((field) => (
          <div key={field.id} className="space-y-2">
            <Label className="text-sm flex items-center gap-2">
              {field.name}
              {field.required && <span className="text-destructive">*</span>}
            </Label>
            {renderFieldInput(field as any)}
            {errors[field.id] && <p className="text-xs font-semibold text-red-500 animate-fade-in">{errors[field.id]}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
