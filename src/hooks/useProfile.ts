import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Profile } from "@/types";
import { useAuth } from "@/contexts/AuthContext";

export function useProfile() {
    const { session } = useAuth();
    const queryClient = useQueryClient();

    const { data: profile, isLoading, error } = useQuery({
        queryKey: ["profile", session?.user.id],
        queryFn: async () => {
            if (!session?.user.id) return null;

            const { data, error } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", session.user.id)
                .single();

            if (error) throw error;
            return data as Profile;
        },
        enabled: !!session?.user.id,
    });

    const updateProfile = useMutation({
        mutationFn: async (updatedProfile: Partial<Profile>) => {
            if (!session?.user.id) throw new Error("No user logged in");

            const { error } = await supabase
                .from("profiles")
                .update(updatedProfile)
                .eq("id", session.user.id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["profile"] });
        },
    });

    return {
        profile,
        isLoading,
        error,
        updateProfile,
    };
}
