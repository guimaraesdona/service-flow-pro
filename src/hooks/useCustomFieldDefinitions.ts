import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

export interface CustomFieldDefinition {
    id: string;
    user_id: string;
    entity_type: "client" | "service" | "order";
    name: string;
    type: "text" | "number" | "date" | "select" | "textarea" | "checkbox";
    required: boolean;
    options?: string[];
    placeholder?: string;
    created_at: string;
}

export interface CreateCustomFieldDefinitionData {
    entity_type: "client" | "service" | "order";
    name: string;
    type: "text" | "number" | "date" | "select" | "textarea" | "checkbox";
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

            const { data, error } = await supabase
                .from("custom_field_definitions")
                .insert([{
                    user_id: user.id,
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

    return {
        fields: query.data || [],
        isLoading: query.isLoading,
        createDefinition,
        deleteDefinition,
    };
}
