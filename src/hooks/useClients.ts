import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Client } from "@/types";
import { useAuth } from "@/contexts/AuthContext";

export function useClients() {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    const fetchClients = async () => {
        if (!user) return [];

        const { data, error } = await supabase
            .from("clients")
            .select(`
        *,
        addresses:client_addresses(*)
      `)
            .order("created_at", { ascending: false });

        if (error) throw error;

        // Map database shape to our frontend type if necessary
        // Currently they match closely, but we ensure addresses is an array
        return (data || []).map(client => ({
            ...client,
            birthDate: client.birth_date, // Map snake_case to camelCase
            addresses: client.addresses || [],
            customFields: client.custom_fields || [],
            avatar: client.avatar_url
        })) as Client[];
    };

    const { data: clients = [], isLoading, error } = useQuery({
        queryKey: ["clients", user?.id],
        queryFn: fetchClients,
        enabled: !!user,
    });

    const createClient = useMutation({
        mutationFn: async (newClient: Omit<Client, "id" | "createdAt" | "updatedAt">) => {
            // 1. Insert Client
            const { data: clientData, error: clientError } = await supabase
                .from("clients")
                .insert({
                    user_id: user?.id,
                    name: newClient.name,
                    email: newClient.email,
                    phone: newClient.phone,
                    document: newClient.document,
                    birth_date: newClient.birthDate,
                    custom_fields: newClient.customFields || [],
                    avatar_url: newClient.avatar,
                })
                .select()
                .single();

            if (clientError) throw clientError;

            // 2. Insert Addresses if any
            if (newClient.addresses && newClient.addresses.length > 0) {
                const addressesToInsert = newClient.addresses.map(addr => ({
                    client_id: clientData.id,
                    label: addr.label,
                    cep: addr.cep,
                    street: addr.street,
                    number: addr.number,
                    complement: addr.complement,
                    neighborhood: addr.neighborhood,
                    city: addr.city,
                    state: addr.state,
                    is_default: addr.isDefault
                }));

                const { error: addrError } = await supabase
                    .from("client_addresses")
                    .insert(addressesToInsert);

                if (addrError) throw addrError;
            }

            return clientData;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["clients"] });
        },
    });

    const updateClient = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: Partial<Client> }) => {
            // 1. Update Client basic info
            const { error: clientError } = await supabase
                .from("clients")
                .update({
                    name: data.name,
                    email: data.email,
                    phone: data.phone,
                    document: data.document,
                    birth_date: data.birthDate,
                    custom_fields: data.customFields,
                    avatar_url: data.avatar,
                })
                .eq("id", id);

            if (clientError) throw clientError;

            // 2. Handle Addresses (Rewrite strategy: delete all and insert new ones for simplicity, 
            // or smarter diffing. For this MVP, we'll try to update existing or insert new, but 
            // replacing all is safer to avoid orphans if we don't track address IDs in frontend form well)

            // A safer approach for now: if addresses are provided, we sync them. 
            // Ideally we should have address IDs in the form to update specific ones.
            // Assuming 'data.addresses' contains the desired final state of addresses.

            if (data.addresses) {
                // Delete existing addresses
                await supabase.from("client_addresses").delete().eq("client_id", id);

                // Insert new set
                if (data.addresses.length > 0) {
                    const addressesToInsert = data.addresses.map(addr => ({
                        client_id: id,
                        label: addr.label,
                        cep: addr.cep,
                        street: addr.street,
                        number: addr.number,
                        complement: addr.complement,
                        neighborhood: addr.neighborhood,
                        city: addr.city,
                        state: addr.state,
                        is_default: addr.isDefault
                    }));

                    const { error: addrError } = await supabase
                        .from("client_addresses")
                        .insert(addressesToInsert);

                    if (addrError) throw addrError;
                }
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["clients"] });
        },
    });

    const deleteClient = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase.from("clients").delete().eq("id", id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["clients"] });
        },
    });

    return {
        clients,
        isLoading,
        error,
        createClient,
        updateClient,
        deleteClient,
    };
}
