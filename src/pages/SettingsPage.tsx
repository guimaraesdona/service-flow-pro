import { useState, useRef } from "react";
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
  User,
  Mail,
  Phone,
  Building,
  Moon,
  Sun,
  Save,
  LogOut,
  Camera
} from "lucide-react";
import { useStorage } from "@/hooks/useStorage";

export default function SettingsPage() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const { uploadImage, isUploading } = useStorage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isDarkMode = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);

  const [userData, setUserData] = useState({
    name: "Empresa Exemplo LTDA",
    email: "contato@empresa.com",
    phone: "(11) 99999-0000",
    document: "12.345.678/0001-00",
    avatar: ""
  });

  const toggleDarkMode = (enabled: boolean) => {
    setTheme(enabled ? "dark" : "light");
  };

  const updateField = (field: string, value: string) => {
    setUserData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = await uploadImage(file, "app-images");
      if (url) {
        setUserData(prev => ({ ...prev, avatar: url }));
        toast({
          title: "Avatar atualizado",
          description: "Sua foto de perfil foi atualizada.",
        });
      } else {
        toast({
          title: "Erro",
          description: "Falha ao enviar imagem.",
          variant: "destructive",
        });
      }
    }
  };

  const handleSave = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Configurações salvas!",
        description: "Suas alterações foram salvas com sucesso.",
      });
    }, 1000);
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
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileSelect}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border-2 border-transparent hover:border-primary/50 transition-colors relative"
              >
                {userData.avatar ? (
                  <img src={userData.avatar} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-8 h-8 text-primary" />
                )}
                {isUploading && (
                  <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
                    <span className="text-[10px] font-bold">...</span>
                  </div>
                )}
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-sm"
              >
                <Camera className="w-3 h-3" />
              </button>
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">{userData.name}</h2>
              <p className="text-sm text-muted-foreground">{userData.email}</p>
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
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="document">CPF / CNPJ</Label>
              <Input
                id="document"
                value={userData.document}
                onChange={(e) => updateField("document", e.target.value)}
                className="input-field"
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
            disabled={isLoading}
          >
            <Save className="w-4 h-4 mr-2" />
            {isLoading ? "Salvando..." : "Salvar Alterações"}
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
