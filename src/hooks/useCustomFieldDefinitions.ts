import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

export interface CustomFieldDefinition {
    id: string;
    user_id: string;
    entity_type: "client" | "service" | "order";
    name: string;
    type: "text" | "number" | "date" | "select" | "textarea" | "checkbox" | "email" | "phone" | "document" | "zip" | "plate" | "multiselect";
    required: boolean;
    options?: string[];
    placeholder?: string;
    created_at: string;
    order_index: number;
}

export interface CreateCustomFieldDefinitionData {
    entity_type: "client" | "service" | "order";
    name: string;
    type: "text" | "number" | "date" | "select" | "textarea" | "checkbox" | "email" | "phone" | "document" | "zip" | "plate" | "multiselect";
    required: boolean;
    options?: string[];
    placeholder?: string;
}

export function useCustomFieldDefinitions(entityType?: "client" | "service" | "order") {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    // Fetch definitions
    const query = useQuery({
        queryKey: ["customFieldDefinitions", user?.id, entityType],
        queryFn: async () => {
            if (!user) return [];

            let query = supabase
                .from("custom_field_definitions")
                .select("*")
                .eq("user_id", user.id)
                .order("order_index", { ascending: true })
                .order("created_at", { ascending: true });

            if (entityType) {
                query = query.eq("entity_type", entityType);
            }

            const { data, error } = await query;

            if (error) {
                console.error("Error fetching custom field definitions:", error);
                throw error;
            }

            return data as CustomFieldDefinition[];
        },
        enabled: !!user,
    });

    // Create definition
    const createDefinition = useMutation({
        mutationFn: async (newField: CreateCustomFieldDefinitionData) => {
            if (!user) throw new Error("User not authenticated");

            // Get max order index
            const { data: existingFields } = await supabase
                .from("custom_field_definitions")
                .select("order_index")
                .eq("user_id", user.id)
                .eq("entity_type", newField.entity_type)
                .order("order_index", { ascending: false })
                .limit(1);

            const nextOrderIndex = (existingFields?.[0]?.order_index ?? 0) + 1;

            const { data, error } = await supabase
                .from("custom_field_definitions")
                .insert([{
                    user_id: user.id,
                    order_index: nextOrderIndex,
                    ...newField
                }])
                .select()
                .single();

            if (error) {
                console.error("Error creating custom field definition:", error);
                throw error;
            }

            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["customFieldDefinitions"] });
            toast({
                title: "Campo criado",
                description: "Campo personalizado criado com sucesso.",
            });
        },
        onError: (error) => {
            toast({
                title: "Erro ao criar",
                description: "Não foi possível criar o campo personalizado.",
                variant: "destructive",
            });
        },
    });

    // Delete definition
    const deleteDefinition = useMutation({
        mutationFn: async (id: string) => {
            if (!user) throw new Error("User not authenticated");

            const { error } = await supabase
                .from("custom_field_definitions")
                .delete()
                .eq("id", id)
                .eq("user_id", user.id);

            if (error) {
                console.error("Error deleting custom field definition:", error);
                throw error;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["customFieldDefinitions"] });
            toast({
                title: "Campo removido",
                description: "Campo personalizado removido com sucesso.",
            });
        },
        onError: (error) => {
            toast({
                title: "Erro ao remover",
                description: "Não foi possível remover o campo personalizado.",
                variant: "destructive",
            });
        },
    });

    // Reorder definitions
    const reorderDefinitions = useMutation({
        mutationFn: async (items: { id: string; order_index: number }[]) => {
            if (!user) throw new Error("User not authenticated");

            // Perform updates in parallel
            const updates = items.map(item =>
                supabase
                    .from("custom_field_definitions")
                    .update({ order_index: item.order_index })
                    .eq("id", item.id)
                    .eq("user_id", user.id)
            );

            await Promise.all(updates);
        },
        onSuccess: () => {
             // Optimistic update handled by component or just invalidate
            queryClient.invalidateQueries({ queryKey: ["customFieldDefinitions"] });
        },
        onError: (error) => {
            toast({
                title: "Erro ao ordenar",
                description: "Não foi possível salvar a nova ordem.",
                variant: "destructive",
            });
        },
    });

    return {
        fields: query.data || [],
        isLoading: query.isLoading,
        createDefinition,
        deleteDefinition,
        reorderDefinitions,
    };
}
