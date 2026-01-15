import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { ServiceOrder, ServiceItem, OrderStatus, OrderPriority } from "@/types";
import { useAuth } from "@/contexts/AuthContext";

export function useOrders() {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    const fetchOrders = async () => {
        if (!user) return [];

        // We fetch orders and their items, plus client info
        const { data, error } = await supabase
            .from("service_orders")
            .select(`
        *,
        client:clients(name),
        items:order_items(*)
      `)
            .order("created_at", { ascending: false });

        if (error) throw error;

        // Map to frontend ServiceOrder type
        return (data || []).map(order => ({
            id: order.id,
            clientId: order.client_id,
            clientName: order.client?.name || "Cliente Desconhecido",
            services: (order.items || []).map((item: any) => ({
                name: item.name,
                quantity: item.quantity,
                price: item.price
            })),
            total: order.total,
            date: order.created_at,
            status: order.status as OrderStatus,
            priority: order.priority as OrderPriority,
            description: order.description,
            scheduledAt: order.scheduled_at,
            discount: order.discount,
            number: order.number
        })) as ServiceOrder[];
    };

    const { data: orders = [], isLoading, error } = useQuery({
        queryKey: ["orders", user?.id],
        queryFn: fetchOrders,
        enabled: !!user,
    });

    const createOrder = useMutation({
        mutationFn: async (newOrder: any) => {
            // 1. Insert Order
            const { data: orderData, error: orderError } = await supabase
                .from("service_orders")
                .insert({
                    user_id: user?.id,
                    client_id: newOrder.clientId,
                    status: newOrder.status,
                    priority: newOrder.priority,
                    total: newOrder.total,
                    discount: newOrder.discount || 0,
                    description: newOrder.description,
                    scheduled_at: newOrder.scheduledAt,
                })
                .select()
                .single();

            if (orderError) throw orderError;

            // 2. Insert Items
            if (newOrder.services && newOrder.services.length > 0) {
                const itemsToInsert = newOrder.services.map((svc: any) => ({
                    order_id: orderData.id,
                    name: svc.name,
                    quantity: svc.quantity,
                    price: svc.price
                }));

                const { error: itemsError } = await supabase
                    .from("order_items")
                    .insert(itemsToInsert);

                if (itemsError) throw itemsError;
            }

            return orderData;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["orders"] });
        },
    });

    const updateOrder = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: any }) => {
            // 1. Update Order Fields
            const { error: orderError } = await supabase
                .from("service_orders")
                .update({
                    client_id: data.clientId,
                    status: data.status,
                    priority: data.priority,
                    total: data.total,
                    discount: data.discount,
                    description: data.description,
                    scheduled_at: data.scheduledAt,
                })
                .eq("id", id);

            if (orderError) throw orderError;

            // 2. Update Items (Delete all and re-insert is simplest for now)
            if (data.services) {
                await supabase.from("order_items").delete().eq("order_id", id);

                if (data.services.length > 0) {
                    const itemsToInsert = data.services.map((svc: any) => ({
                        order_id: id,
                        name: svc.name,
                        quantity: svc.quantity,
                        price: svc.price
                    }));

                    const { error: itemsError } = await supabase
                        .from("order_items")
                        .insert(itemsToInsert);

                    if (itemsError) throw itemsError;
                }
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["orders"] });
        },
    });

    const deleteOrder = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase.from("service_orders").delete().eq("id", id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["orders"] });
        },
    });

    return {
        orders,
        isLoading,
        error,
        createOrder,
        updateOrder,
        deleteOrder,
    };
}
