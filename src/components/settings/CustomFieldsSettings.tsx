import { useState, useEffect } from "react";
import { Plus, X, GripVertical } from "lucide-react";
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

export interface CustomField {
  id: string;
  name: string;
  type: "text" | "number" | "date" | "select" | "textarea" | "checkbox";
  required: boolean;
  options?: string[];
  placeholder?: string;
}

type EntityType = "order" | "client" | "service";

const STORAGE_KEYS: Record<EntityType, string> = {
  order: "order_custom_fields",
  client: "client_custom_fields",
  service: "service_custom_fields",
};

const ENTITY_LABELS: Record<EntityType, string> = {
  order: "Ordens de Serviço",
  client: "Clientes",
  service: "Serviços",
};

export function getStoredCustomFields(entity: EntityType): CustomField[] {
  const stored = localStorage.getItem(STORAGE_KEYS[entity]);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }
  return [];
}

export function saveCustomFields(entity: EntityType, fields: CustomField[]) {
  localStorage.setItem(STORAGE_KEYS[entity], JSON.stringify(fields));
}

export function CustomFieldsSettings() {
  const [activeTab, setActiveTab] = useState<EntityType>("order");
  const [fields, setFields] = useState<Record<EntityType, CustomField[]>>({
    order: [],
    client: [],
    service: [],
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newField, setNewField] = useState<Partial<CustomField>>({
    name: "",
    type: "text",
    required: false,
    options: [],
  });
  const [selectOption, setSelectOption] = useState("");

  useEffect(() => {
    setFields({
      order: getStoredCustomFields("order"),
      client: getStoredCustomFields("client"),
      service: getStoredCustomFields("service"),
    });
  }, []);

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

    const updatedFields = [...fields[activeTab], field];
    setFields((prev) => ({ ...prev, [activeTab]: updatedFields }));
    saveCustomFields(activeTab, updatedFields);

    setNewField({ name: "", type: "text", required: false, options: [] });
    setIsDialogOpen(false);

    toast({
      title: "Campo adicionado!",
      description: `Campo "${field.name}" foi adicionado para ${ENTITY_LABELS[activeTab]}.`,
    });
  };

  const removeField = (fieldId: string) => {
    const updatedFields = fields[activeTab].filter((f) => f.id !== fieldId);
    setFields((prev) => ({ ...prev, [activeTab]: updatedFields }));
    saveCustomFields(activeTab, updatedFields);
    
    toast({
      title: "Campo removido",
      description: "O campo foi removido com sucesso.",
    });
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

  return (
    <div className="card-elevated p-6 animate-fade-in">
      <h3 className="font-semibold text-foreground mb-4">Campos Personalizados</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Configure campos adicionais para ordens de serviço, clientes e serviços.
      </p>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as EntityType)}>
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="order">Ordens</TabsTrigger>
          <TabsTrigger value="client">Clientes</TabsTrigger>
          <TabsTrigger value="service">Serviços</TabsTrigger>
        </TabsList>

        {(["order", "client", "service"] as EntityType[]).map((entity) => (
          <TabsContent key={entity} value={entity} className="space-y-4">
            {fields[entity].length > 0 ? (
              <div className="space-y-2">
                {fields[entity].map((field) => (
                  <div
                    key={field.id}
                    className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <GripVertical className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <span className="text-sm font-medium">{field.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground capitalize">
                            {field.type === "text" && "Texto"}
                            {field.type === "number" && "Número"}
                            {field.type === "date" && "Data"}
                            {field.type === "select" && "Seleção"}
                            {field.type === "textarea" && "Texto longo"}
                            {field.type === "checkbox" && "Sim/Não"}
                          </span>
                          {field.required && (
                            <span className="text-xs text-destructive">• Obrigatório</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeField(field.id)}
                      className="p-2 text-destructive hover:text-destructive/80 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">Nenhum campo personalizado configurado.</p>
              </div>
            )}

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full border-dashed">
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Campo para {ENTITY_LABELS[entity]}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Novo Campo - {ENTITY_LABELS[activeTab]}</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
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
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
