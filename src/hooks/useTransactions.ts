import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Transaction } from "@/types";
import { useAuth } from "@/contexts/AuthContext";

export function useTransactions() {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    const fetchTransactions = async () => {
        if (!user) return [];

        const { data, error } = await supabase
            .from("transactions")
            .select(`
        *,
        order:service_orders(
          client:clients(name)
        )
      `)
            .order("created_at", { ascending: false });

        if (error) throw error;

        return (data || []).map((t: any) => ({
            id: t.id,
            orderId: t.order_id,
            clientName: t.order?.client?.name || "Cliente Desconhecido",
            amount: t.amount,
            date: t.date,
            type: t.type,
        })) as Transaction[];
    };

    const { data: transactions = [], isLoading, error } = useQuery({
        queryKey: ["transactions", user?.id],
        queryFn: fetchTransactions,
        enabled: !!user,
    });

    const createTransaction = useMutation({
        mutationFn: async (newTransaction: Omit<Transaction, "id" | "clientName">) => {
            const { data, error } = await supabase
                .from("transactions")
                .insert({
                    user_id: user?.id,
                    order_id: newTransaction.orderId,
                    amount: newTransaction.amount,
                    date: newTransaction.date,
                    type: newTransaction.type,
                })
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["transactions"] });
        },
    });

    const deleteTransaction = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase.from("transactions").delete().eq("id", id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["transactions"] });
        },
    });

    return {
        transactions,
        isLoading,
        error,
        createTransaction,
        deleteTransaction,
    };
}
