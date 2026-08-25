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
  MapPin,
  Calendar,
} from "lucide-react";
import { ImageUploader } from "@/components/form/ImageUploader";
import { useStorage } from "@/hooks/useStorage";
import { useProfile } from "@/hooks/useProfile";
import { maskPhone, maskDocument, maskCEP } from "@/utils/masks";
import { validateEmail, validateDocument } from "@/utils/validations";

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
    use_logo_for_print: true,
    birth_date: "",
    cep: "",
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: ""
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
        use_logo_for_print: profile.use_logo_for_print ?? true,
        birth_date: profile.birth_date || "",
        cep: profile.cep || "",
        street: profile.street || "",
        number: profile.number || "",
        complement: profile.complement || "",
        neighborhood: profile.neighborhood || "",
        city: profile.city || "",
        state: profile.state || ""
      });
    }
  }, [profile]);

  const toggleDarkMode = (enabled: boolean) => {
    setTheme(enabled ? "dark" : "light");
  };

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateField = (field: string, value: string) => {
    let error = "";

    // Check mandatory fields (except avatar_url and complement which are optional)
    if (!value && field !== "avatar_url" && field !== "complement" && field !== "use_logo_for_print") {
      error = "Campo obrigatório";
    }

    if (!error) {
      if (field === "email" && value && !validateEmail(value)) {
        error = "Email inválido";
      }
      if (field === "document" && value) {
        if (!validateDocument(value)) {
          error = "CPF/CNPJ inválido";
        }
      }
    }

    setErrors((prev) => ({ ...prev, [field]: error }));
    return !error;
  };

  const handleBlur = (field: string) => {
    validateField(field, userData[field as keyof typeof userData] as string);
  };

  const updateField = (field: string, value: string) => {
    setUserData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
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
    // Validate all fields
    const fieldsToValidate = [
      "name", "email", "phone", "document", "birth_date",
      "cep", "street", "number", "neighborhood", "city", "state"
    ];

    let hasErrors = false;
    fieldsToValidate.forEach(field => {
      const isValid = validateField(field, userData[field as keyof typeof userData] as string);
      if (!isValid) hasErrors = true;
    });

    if (hasErrors) {
      toast({
        title: "Campos inválidos",
        description: "Por favor, corrija os erros destacados antes de salvar.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      await updateProfile.mutateAsync({
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        document: userData.document,
        avatar_url: userData.avatar_url,
        use_logo_for_print: userData.use_logo_for_print,
        birth_date: userData.birth_date,
        cep: userData.cep,
        street: userData.street,
        number: userData.number,
        complement: userData.complement,
        neighborhood: userData.neighborhood,
        city: userData.city,
        state: userData.state,
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
      console.error("Save error:", error);
      let errorMessage = error.message || "Ocorreu um erro ao salvar as configurações.";

      if (errorMessage.includes("invalid input syntax for type date")) {
        errorMessage = "Data de nascimento inválida. Verifique o formato.";
      }

      toast({
        title: "Erro ao salvar",
        description: errorMessage,
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
                onBlur={() => handleBlur("name")}
                className={`input-field ${errors.name ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                placeholder="Ex: Minha Empresa LTDA"
              />
              {errors.name && <p className="text-xs font-semibold text-red-500 animate-fade-in">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email
              </Label>
              <div className="space-y-1">
                <Input
                  id="email"
                  type="email"
                  value={userData.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  onBlur={() => handleBlur("email")}
                  className={`input-field ${errors.email ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                  placeholder="Ex: contato@minhaempresa.com"
                />
                {errors.email && <p className="text-xs font-semibold text-red-500 animate-fade-in">{errors.email}</p>}
              </div>
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
                onChange={(e) => updateField("phone", maskPhone(e.target.value))}
                onBlur={() => handleBlur("phone")}
                className={`input-field ${errors.phone ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                placeholder="Ex: (11) 99999-9999"
                maxLength={15}
              />
              {errors.phone && <p className="text-xs font-semibold text-red-500 animate-fade-in">{errors.phone}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="document">CPF / CNPJ</Label>
              <div className="space-y-1">
                <Input
                  id="document"
                  value={userData.document}
                  onChange={(e) => updateField("document", maskDocument(e.target.value))}
                  onBlur={() => handleBlur("document")}
                  className={`input-field ${errors.document ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                  placeholder="Ex: 000.000.000-00"
                  maxLength={18}
                />
                {errors.document && <p className="text-xs font-semibold text-red-500 animate-fade-in">{errors.document}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="birth_date" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Data de Nascimento / Abertura
              </Label>
              <div className="space-y-1">
                <Input
                  id="birth_date"
                  type="date"
                  value={userData.birth_date}
                  onChange={(e) => updateField("birth_date", e.target.value)}
                  onBlur={() => handleBlur("birth_date")}
                  className={`input-field ${errors.birth_date ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                />
                {errors.birth_date && <p className="text-xs font-semibold text-red-500 animate-fade-in">{errors.birth_date}</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Address Section */}
        <div className="card-elevated p-6 mb-6 animate-slide-up" style={{ animationDelay: "0.05s" }}>
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Endereço
          </h3>

          <div className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="cep">CEP</Label>
                <Input
                  id="cep"
                  value={userData.cep}
                  onChange={(e) => updateField("cep", maskCEP(e.target.value))}
                  onBlur={() => handleBlur("cep")}
                  className={`input-field ${errors.cep ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                  placeholder="00000-000"
                  maxLength={9}
                />
                {errors.cep && <p className="text-xs font-semibold text-red-500 animate-fade-in">{errors.cep}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="street">Logradouro</Label>
              <Input
                id="street"
                value={userData.street}
                onChange={(e) => updateField("street", e.target.value)}
                onBlur={() => handleBlur("street")}
                className={`input-field ${errors.street ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                placeholder="Rua, Avenida..."
              />
              {errors.street && <p className="text-xs font-semibold text-red-500 animate-fade-in">{errors.street}</p>}
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label htmlFor="number">Número</Label>
                <Input
                  id="number"
                  value={userData.number}
                  onChange={(e) => updateField("number", e.target.value)}
                  onBlur={() => handleBlur("number")}
                  className={`input-field ${errors.number ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                  placeholder="000"
                />
                {errors.number && <p className="text-xs font-semibold text-red-500 animate-fade-in">{errors.number}</p>}
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="complement">Complemento</Label>
                <Input
                  id="complement"
                  value={userData.complement}
                  onChange={(e) => updateField("complement", e.target.value)}
                  className="input-field"
                  placeholder="Apto, Sala..."
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="neighborhood">Bairro</Label>
              <Input
                id="neighborhood"
                value={userData.neighborhood}
                onChange={(e) => updateField("neighborhood", e.target.value)}
                onBlur={() => handleBlur("neighborhood")}
                className={`input-field ${errors.neighborhood ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                placeholder="Seu bairro"
              />
              {errors.neighborhood && <p className="text-xs font-semibold text-red-500 animate-fade-in">{errors.neighborhood}</p>}
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2 space-y-2">
                <Label htmlFor="city">Cidade</Label>
                <Input
                  id="city"
                  value={userData.city}
                  onChange={(e) => updateField("city", e.target.value)}
                  onBlur={() => handleBlur("city")}
                  className={`input-field ${errors.city ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                  placeholder="Sua cidade"
                />
                {errors.city && <p className="text-xs font-semibold text-red-500 animate-fade-in">{errors.city}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">Estado</Label>
                <Input
                  id="state"
                  value={userData.state}
                  onChange={(e) => updateField("state", e.target.value)}
                  onBlur={() => handleBlur("state")}
                  className={`input-field ${errors.state ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                  placeholder="UF"
                />
                {errors.state && <p className="text-xs font-semibold text-red-500 animate-fade-in">{errors.state}</p>}
              </div>
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
