import { useRef } from "react";
import { Camera, X, Loader2 } from "lucide-react";
import { useStorage } from "@/hooks/useStorage";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface ImageUploaderProps {
    value?: string | null;
    onChange: (url: string) => void;
    className?: string;
    bucket?: string;
    folder?: string; // Optional folder path if needed in future
    previewClassName?: string;
    iconClassName?: string;
}

export function ImageUploader({
    value,
    onChange,
    className,
    bucket = "app-images",
    previewClassName,
    iconClassName
}: ImageUploaderProps) {
    const { uploadImage, isUploading } = useStorage();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            try {
                const url = await uploadImage(file, bucket);
                if (url) {
                    onChange(url);
                    toast({
                        title: "Imagem enviada",
                        description: "Upload concluído com sucesso.",
                    });
                }
            } catch (error) {
                toast({
                    title: "Erro",
                    description: "Falha ao enviar imagem.",
                    variant: "destructive",
                });
            }
        }
    };

    const handleRemove = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent triggering the file input
        onChange("");
    };

    return (
        <div className={cn("relative inline-block w-fit", className)}>
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileSelect}
            />

            <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className={cn(
                    "relative flex items-center justify-center overflow-hidden transition-colors border-2 border-dashed rounded-full border-border bg-secondary hover:border-primary/50 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl",
                    previewClassName || "w-24 h-24"
                )}
            >
                {value ? (
                    <img
                        src={value}
                        alt="Preview"
                        className="object-cover w-full h-full"
                    />
                ) : (
                    <Camera className={cn("text-muted-foreground", iconClassName || "w-8 h-8")} />
                )}

                {isUploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/50">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                )}
            </button>

            {/* Camera Icon Badge (only shows when there is an image, to indicate editable) or always? 
          The design in SettingsPage had a small camera icon at bottom right. 
          The design in others just had the main area.
          Let's try to simulate the "main area" click functionality first.
      */}

            {value && !isUploading && (
                <button
                    type="button"
                    onClick={handleRemove}
                    className="absolute -top-1 -right-1 flex items-center justify-center w-6 h-6 transition-colors rounded-full shadow-sm bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    title="Remover imagem"
                >
                    <X className="w-3 h-3" />
                </button>
            )}
        </div>
    );
}
