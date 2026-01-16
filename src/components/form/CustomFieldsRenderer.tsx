import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CustomField } from "@/components/settings/CustomFieldsSettings";
import { useCustomFieldDefinitions } from "@/hooks/useCustomFieldDefinitions";

export interface CustomFieldValue {
  fieldId: string;
  value: string | number | boolean;
}

interface CustomFieldsRendererProps {
  entityType: "order" | "client" | "service";
  values: CustomFieldValue[];
  onValuesChange: (values: CustomFieldValue[]) => void;
}

export function CustomFieldsRenderer({
  entityType,
  values,
  onValuesChange,
}: CustomFieldsRendererProps) {
  const { fields, isLoading } = useCustomFieldDefinitions(entityType);

  if (isLoading || fields.length === 0) {
    return null;
  }

  const updateFieldValue = (fieldId: string, value: string | number | boolean) => {
    const existingIndex = values.findIndex((v) => v.fieldId === fieldId);
    if (existingIndex >= 0) {
      const updatedValues = [...values];
      updatedValues[existingIndex] = { fieldId, value };
      onValuesChange(updatedValues);
    } else {
      onValuesChange([...values, { fieldId, value }]);
    }
  };

  const getFieldValue = (fieldId: string): string | number | boolean => {
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
            placeholder={field.placeholder || `Digite ${field.name.toLowerCase()}`}
            className="input-field"
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
        return null;
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
          </div>
        ))}
      </div>
    </div>
  );
}
