import { useState } from "react";
import { Plus, X, GripVertical, Loader2 } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
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
import { useCustomFieldDefinitions, CreateCustomFieldDefinitionData } from "@/hooks/useCustomFieldDefinitions";

// Exported types for use in other components
export interface CustomField {
  id: string;
  name: string;
  type: "text" | "number" | "date" | "select" | "multiselect" | "textarea" | "checkbox" | "email" | "phone" | "document" | "zip" | "plate";
  required: boolean;
  options?: string[];
  placeholder?: string;
  entity_type: "order" | "client" | "service";
  order_index?: number;
}

type EntityType = "order" | "client" | "service";

const ENTITY_LABELS: Record<EntityType, string> = {
  order: "Ordens de Serviço",
  client: "Clientes",
  service: "Serviços",
};

function SortableItem({ field, onRemove, isDeleting }: { field: CustomField; onRemove: (id: string) => void; isDeleting: boolean }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg touch-none"
    >
      <div className="flex items-center gap-3">
        <div {...attributes} {...listeners} className="cursor-grab hover:text-primary">
            <GripVertical className="w-5 h-5 text-muted-foreground transition-colors" />
        </div>
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
              {field.type === "email" && "E-mail"}
              {field.type === "phone" && "Telefone"}
              {field.type === "document" && "CPF/CNPJ"}
              {field.type === "zip" && "CEP"}
              {field.type === "plate" && "Placa"}
              {field.type === "multiselect" && "Multiselect"}
            </span>
            {field.required && (
              <span className="text-xs font-medium text-red-600 dark:text-red-400">• Obrigatório</span>
            )}
          </div>
        </div>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => onRemove(field.id)}
        disabled={isDeleting}
        className="text-destructive hover:text-destructive/80"
      >
        {isDeleting ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <X className="w-4 h-4" />
        )}
      </Button>
    </div>
  );
}

export function CustomFieldsSettings() {
  const [activeTab, setActiveTab] = useState<EntityType>("order");
  const { fields, isLoading, createDefinition, deleteDefinition, reorderDefinitions } = useCustomFieldDefinitions(activeTab);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = fields.findIndex((f) => f.id === active.id);
      const newIndex = fields.findIndex((f) => f.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
          // Optimistic local update (optional, but good for UX)
          // Ideally rely on the mutation invalidation

          const newOrder = arrayMove(fields, oldIndex, newIndex);
          const updates = newOrder.map((field, index) => ({
              id: field.id,
              order_index: index,
          }));

          reorderDefinitions.mutate(updates);
      }
    }
  };

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newField, setNewField] = useState<Partial<CreateCustomFieldDefinitionData>>({
    name: "",
    type: "text",
    required: false,
    options: [],
  });
  const [selectOption, setSelectOption] = useState("");

  const addField = async () => {
    if (!newField.name?.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Informe o nome do campo.",
        variant: "destructive",
      });
      return;
    }

    try {
      await createDefinition.mutateAsync({
        entity_type: activeTab,
        name: newField.name.trim(),
        type: newField.type || "text",
        required: newField.required || false,
        options: (newField.type === "select" || newField.type === "multiselect") ? newField.options : undefined,
        placeholder: newField.placeholder,
      } as CreateCustomFieldDefinitionData);

      setNewField({ name: "", type: "text", required: false, options: [] });
      setIsDialogOpen(false);
    } catch (error) {
      // Error handled in hook
    }
  };

  const removeField = async (fieldId: string) => {
    try {
      await deleteDefinition.mutateAsync(fieldId);
    } catch (error) {
      // Error handled in hook
    }
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

        <div className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : fields.length > 0 ? (
            <div className="space-y-2">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                  <SortableContext
                    items={fields.map(f => f.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {fields.map((field) => (
                        <SortableItem
                            key={field.id}
                            field={field as CustomField}
                            onRemove={removeField}
                            isDeleting={deleteDefinition.isPending}
                        />
                    ))}
                  </SortableContext>
              </DndContext>
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
                Adicionar Campo para {ENTITY_LABELS[activeTab]}
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
                      setNewField((prev) => ({ ...prev, type: value as any }))
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
                      <SelectItem value="multiselect">Seleção Múltipla</SelectItem>
                      <SelectItem value="textarea">Texto longo</SelectItem>
                      <SelectItem value="checkbox">Sim/Não</SelectItem>
                      <SelectItem value="email">E-mail</SelectItem>
                      <SelectItem value="phone">Telefone</SelectItem>
                      <SelectItem value="document">CPF/CNPJ</SelectItem>
                      <SelectItem value="zip">CEP</SelectItem>
                      <SelectItem value="plate">Placa Veicular</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {(newField.type === "select" || newField.type === "multiselect") && (
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

              <Button onClick={addField} disabled={createDefinition.isPending} className="w-full btn-primary">
                {createDefinition.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Plus className="w-4 h-4 mr-2" />
                )}
                Adicionar Campo
              </Button>
            </DialogContent>
          </Dialog>
        </div>
      </Tabs>
    </div>
  );
}
