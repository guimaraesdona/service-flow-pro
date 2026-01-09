import { useState, useEffect } from "react";
import { Plus, X, Settings2, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";

export interface CustomField {
  id: string;
  name: string;
  type: "text" | "number" | "date" | "select" | "textarea" | "checkbox";
  required: boolean;
  options?: string[]; // For select type
  placeholder?: string;
}

export interface CustomFieldValue {
  fieldId: string;
  value: string | number | boolean;
}

interface CustomFieldsManagerProps {
  fields: CustomField[];
  onFieldsChange: (fields: CustomField[]) => void;
  values: CustomFieldValue[];
  onValuesChange: (values: CustomFieldValue[]) => void;
  editMode?: boolean;
}

const STORAGE_KEY = "order_custom_fields";

export function getStoredCustomFields(): CustomField[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }
  return [];
}

export function saveCustomFields(fields: CustomField[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(fields));
}

export function CustomFieldsManager({
  fields,
  onFieldsChange,
  values,
  onValuesChange,
  editMode = false,
}: CustomFieldsManagerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newField, setNewField] = useState<Partial<CustomField>>({
    name: "",
    type: "text",
    required: false,
    options: [],
  });
  const [selectOption, setSelectOption] = useState("");

  const addField = () => {
    if (!newField.name?.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Informe o nome do campo.",
        variant: "destructive",
      });
      return;
    }

    const field: CustomField = {
      id: `custom_${Date.now()}`,
      name: newField.name.trim(),
      type: newField.type || "text",
      required: newField.required || false,
      options: newField.type === "select" ? newField.options : undefined,
      placeholder: newField.placeholder,
    };

    const updatedFields = [...fields, field];
    onFieldsChange(updatedFields);
    saveCustomFields(updatedFields);

    setNewField({ name: "", type: "text", required: false, options: [] });
    setIsDialogOpen(false);

    toast({
      title: "Campo adicionado!",
      description: `Campo "${field.name}" foi adicionado com sucesso.`,
    });
  };

  const removeField = (fieldId: string) => {
    const updatedFields = fields.filter((f) => f.id !== fieldId);
    onFieldsChange(updatedFields);
    saveCustomFields(updatedFields);
    
    // Also remove the value
    onValuesChange(values.filter((v) => v.fieldId !== fieldId));
  };

  const addSelectOption = () => {
    if (selectOption.trim()) {
      setNewField((prev) => ({
        ...prev,
        options: [...(prev.options || []), selectOption.trim()],
      }));
      setSelectOption("");
    }
  };

  const removeSelectOption = (index: number) => {
    setNewField((prev) => ({
      ...prev,
      options: prev.options?.filter((_, i) => i !== index) || [],
    }));
  };

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
              ))
              }
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
      {/* Existing Custom Fields */}
      {fields.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Campos Personalizados</Label>
          </div>
          
          {fields.map((field) => (
            <div key={field.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm flex items-center gap-2">
                  {field.name}
                  {field.required && <span className="text-destructive">*</span>}
                </Label>
                {editMode && (
                  <button
                    type="button"
                    onClick={() => removeField(field.id)}
                    className="text-destructive hover:text-destructive/80 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              {renderFieldInput(field)}
            </div>
          ))}
        </div>
      )}

      {/* Add New Field Button */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="w-full border-dashed"
          >
            <Settings2 className="w-4 h-4 mr-2" />
            {fields.length > 0 ? "Gerenciar Campos Personalizados" : "Adicionar Campo Personalizado"}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Novo Campo Personalizado</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Existing Fields List */}
            {fields.length > 0 && (
              <div className="space-y-2 mb-4 pb-4 border-b border-border">
                <Label className="text-sm font-medium text-muted-foreground">Campos existentes</Label>
                <div className="space-y-2">
                  {fields.map((field) => (
                    <div
                      key={field.id}
                      className="flex items-center justify-between p-2 bg-secondary/50 rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <GripVertical className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{field.name}</span>
                        <span className="text-xs text-muted-foreground">({field.type})</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeField(field.id)}
                        className="text-destructive hover:text-destructive/80 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New Field Form */}
            <div className="space-y-2">
              <Label>Nome do Campo</Label>
              <Input
                value={newField.name}
                onChange={(e) => setNewField((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Número de série"
                className="input-field"
              />
            </div>

            <div className="space-y-2">
              <Label>Tipo do Campo</Label>
              <Select
                value={newField.type}
                onValueChange={(value) =>
                  setNewField((prev) => ({ ...prev, type: value as CustomField["type"] }))
                }
              >
                <SelectTrigger className="input-field">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Texto</SelectItem>
                  <SelectItem value="number">Número</SelectItem>
                  <SelectItem value="date">Data</SelectItem>
                  <SelectItem value="select">Seleção</SelectItem>
                  <SelectItem value="textarea">Texto longo</SelectItem>
                  <SelectItem value="checkbox">Sim/Não</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {newField.type === "select" && (
              <div className="space-y-2">
                <Label>Opções</Label>
                <div className="flex gap-2">
                  <Input
                    value={selectOption}
                    onChange={(e) => setSelectOption(e.target.value)}
                    placeholder="Nova opção"
                    className="input-field flex-1"
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSelectOption())}
                  />
                  <Button type="button" onClick={addSelectOption} size="icon" variant="outline">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {newField.options && newField.options.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {newField.options.map((opt, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-secondary rounded-md text-sm"
                      >
                        {opt}
                        <button
                          type="button"
                          onClick={() => removeSelectOption(i)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label>Placeholder (opcional)</Label>
              <Input
                value={newField.placeholder || ""}
                onChange={(e) => setNewField((prev) => ({ ...prev, placeholder: e.target.value }))}
                placeholder="Texto de ajuda"
                className="input-field"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>Campo obrigatório</Label>
              <Switch
                checked={newField.required}
                onCheckedChange={(checked) =>
                  setNewField((prev) => ({ ...prev, required: checked }))
                }
              />
            </div>
          </div>

          <Button onClick={addField} className="w-full btn-primary">
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Campo
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
