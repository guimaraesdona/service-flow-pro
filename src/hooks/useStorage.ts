import { useState } from "react";
import { supabase } from "@/lib/supabase";

export function useStorage() {
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const uploadImage = async (file: File, bucket: string = "app-images") => {
        setIsUploading(true);
        setError(null);

        try {
            const fileExt = file.name.split(".").pop();
            const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from(bucket)
                .upload(filePath, file);

            if (uploadError) {
                console.error("Supabase Storage Upload Error:", uploadError);
                throw uploadError;
            }

            // Get public URL
            const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);

            return data.publicUrl;
        } catch (err: any) {
            console.error("Upload Logic Error:", err);
            setError(err.message);
            return null;
        } finally {
            setIsUploading(false);
        }
    };

    return {
        uploadImage,
        isUploading,
        error,
    };
}
