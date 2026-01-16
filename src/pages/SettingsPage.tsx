import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { TopNav } from "@/components/layout/TopNav";
import { DesktopHeader } from "@/components/layout/DesktopHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { CustomFieldsSettings } from "@/components/settings/CustomFieldsSettings";
import { useTheme } from "@/components/theme-provider";
import {
  Mail,
  Phone,
  Building,
  Moon,
  Sun,
  Save,
  LogOut,
} from "lucide-react";
import { ImageUploader } from "@/components/form/ImageUploader";
import { useStorage } from "@/hooks/useStorage";
import { useProfile } from "@/hooks/useProfile";

export default function SettingsPage() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  // Remove local isLoading state in favor of mutation status if desired, but keeping generally fine.
  const [isSaving, setIsSaving] = useState(false);

  // Remove local isLoading state in favor of mutation status if desired, but keeping generally fine.


  const { deleteImage } = useStorage();
  const { profile, updateProfile } = useProfile();


  const isDarkMode = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);

  const [userData, setUserData] = useState({
    name: "",
    email: "",
    phone: "",
    document: "",
    avatar_url: "",
    use_logo_for_print: true
  });

  // Load profile data when available
  useEffect(() => {
    if (profile) {
      setUserData({
        name: profile.name || "",
        email: profile.email || "",
        phone: profile.phone || "",
        document: profile.document || "",
        avatar_url: profile.avatar_url || "",
        use_logo_for_print: profile.use_logo_for_print ?? true
      });
    }
  }, [profile]);

  const toggleDarkMode = (enabled: boolean) => {
    setTheme(enabled ? "dark" : "light");
  };

  const updateField = (field: string, value: string) => {
    setUserData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageChange = async (newUrl: string) => {
    const currentUrl = userData.avatar_url;
    // Check if we are replacing a transient image
    if (currentUrl && currentUrl !== profile?.avatar_url && currentUrl !== newUrl) {
      try {
        await deleteImage(currentUrl);
      } catch (error) {
        console.error("Failed to delete transient image:", error);
      }
    }
    updateField("avatar_url", newUrl);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateProfile.mutateAsync({
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        document: userData.document,
        avatar_url: userData.avatar_url,
        use_logo_for_print: userData.use_logo_for_print,
      });

      // If avatar changed and there was an old one, delete the old one
      if (profile?.avatar_url && profile.avatar_url !== userData.avatar_url) {
        await deleteImage(profile.avatar_url);
      }

      toast({
        title: "Configurações salvas!",
        description: "Suas alterações foram salvas com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao salvar",
        description: error.message || "Ocorreu um erro ao salvar as configurações.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    navigate("/");
  };

  return (
    <div className="page-container bg-background">
      {/* Mobile Header */}
      <div className="lg:hidden">
        <TopNav title="Configurações" showBack />
      </div>

      {/* Desktop Header */}
      <div className="hidden lg:block">
        <DesktopHeader title="Configurações" />
      </div>

      <div className="content-container lg:grid lg:grid-cols-2 lg:gap-8">
        {/* Profile Section */}
        <div className="card-elevated p-6 mb-6 animate-fade-in">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative">
              <ImageUploader
                value={userData.avatar_url}
                onChange={(url) => updateField("avatar_url", url)}
                previewClassName="w-16 h-16"
              />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">{userData.name || "Sua Empresa"}</h2>
              <div className="flex items-center gap-2 mt-1">
                 <Switch
                    id="use_logo"
                    checked={userData.use_logo_for_print}
                    onCheckedChange={(checked) => setUserData(prev => ({ ...prev, use_logo_for_print: checked }))}
                    className="scale-75 origin-left"
                  />
                  <Label htmlFor="use_logo" className="text-xs text-muted-foreground cursor-pointer">
                    Usar logo na impressão
                  </Label>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2">
                <Building className="w-4 h-4" />
                Nome / Razão Social
              </Label>
              <Input
                id="name"
                value={userData.name}
                onChange={(e) => updateField("name", e.target.value)}
                className="input-field"
                placeholder="Ex: Minha Empresa LTDA"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={userData.email}
                onChange={(e) => updateField("email", e.target.value)}
                className="input-field"
                placeholder="Ex: contato@minhaempresa.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Telefone
              </Label>
              <Input
                id="phone"
                type="tel"
                value={userData.phone}
                onChange={(e) => updateField("phone", e.target.value)}
                className="input-field"
                placeholder="Ex: (11) 99999-9999"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="document">CPF / CNPJ</Label>
              <Input
                id="document"
                value={userData.document}
                onChange={(e) => updateField("document", e.target.value)}
                className="input-field"
                placeholder="Ex: 00.000.000/0001-00"
              />
            </div>
          </div>
        </div>

        {/* Appearance Section */}
        <div className="card-elevated p-6 mb-6 animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <h3 className="font-semibold text-foreground mb-4">Aparência</h3>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isDarkMode ? (
                <Moon className="w-5 h-5 text-primary" />
              ) : (
                <Sun className="w-5 h-5 text-primary" />
              )}
              <div>
                <p className="text-sm font-medium text-foreground">Tema Escuro</p>
                <p className="text-xs text-muted-foreground">
                  {isDarkMode ? "Ativado" : "Desativado"}
                </p>
              </div>
            </div>
            <Switch
              checked={isDarkMode}
              onCheckedChange={toggleDarkMode}
            />
          </div>
        </div>

        {/* Custom Fields Section */}
        <div className="lg:col-span-2">
          <CustomFieldsSettings />
        </div>

        {/* Actions */}
        <div className="space-y-3 animate-slide-up lg:col-span-2" style={{ animationDelay: "0.2s" }}>
          <Button
            onClick={handleSave}
            className="w-full lg:w-auto btn-primary"
            disabled={isSaving}
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? "Salvando..." : "Salvar Alterações"}
          </Button>

          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full lg:w-auto lg:ml-3"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sair da Conta
          </Button>
        </div>
      </div>
    </div>
  );
}
