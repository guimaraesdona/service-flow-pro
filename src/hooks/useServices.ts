import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Service } from "@/types";
import { useAuth } from "@/contexts/AuthContext";

export function useServices() {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    const fetchServices = async () => {
        if (!user) return [];

        const { data, error } = await supabase
            .from("services")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) throw error;

        return (data || []).map(service => ({
            ...service,
            customFields: service.custom_fields || {},
            imageUrl: service.image_url
        })) as Service[];
    };

    const { data: services = [], isLoading, error } = useQuery({
        queryKey: ["services", user?.id],
        queryFn: fetchServices,
        enabled: !!user,
    });

    const createService = useMutation({
        mutationFn: async (newService: Omit<Service, "id">) => {
            const { data, error } = await supabase
                .from("services")
                .insert({
                    user_id: user?.id,
                    name: newService.name,
                    description: newService.description,
                    price: newService.price,
                    active: newService.active ?? true,
                    custom_fields: newService.customFields || {},
                    image_url: newService.imageUrl,
                })
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["services"] });
        },
    });

    const updateService = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: Partial<Service> }) => {
            const { error } = await supabase
                .from("services")
                .update({
                    name: data.name,
                    description: data.description,
                    price: data.price,
                    active: data.active,
                    custom_fields: data.customFields || {},
                    image_url: data.imageUrl,
                })
                .eq("id", id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["services"] });
        },
    });

    const deleteService = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase.from("services").delete().eq("id", id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["services"] });
        },
    });

    return {
        services,
        isLoading,
        error,
        createService,
        updateService,
        deleteService,
    };
}
