import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { maskPhone, maskDocument, maskCEP } from "@/utils/masks";
import { validateEmail, validateDocument } from "@/utils/validations";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    document: "",
    birthDate: "",
    phone: "",
    password: "",
    confirmPassword: "",
    cep: "",
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateField = (field: string, value: string) => {
    let error = "";

    // Optional fields
    const optionalFields = ["complement", "avatar_url"];

    if (!value && !optionalFields.includes(field)) {
       error = "Campo obrigatório";
    }

    if (!error) {
        if (field === "email" && !validateEmail(value)) {
            error = "Email inválido";
        }
        if (field === "document" && value && !validateDocument(value)) {
            error = "CPF/CNPJ inválido";
        }
        if (field === "confirmPassword" && value !== formData.password) {
            error = "As senhas não coincidem";
        }
    }

    setErrors((prev) => ({ ...prev, [field]: error }));
    return !error;
  };

  const handleBlur = (field: string) => {
    validateField(field, formData[field as keyof typeof formData] as string);
  };

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleNext = () => {
    if (step === 1) {
       const fieldsToValidate = ["name", "email", "password", "confirmPassword", "document", "phone"];
       let hasErrors = false;

       fieldsToValidate.forEach(field => {
         const isValid = validateField(field, formData[field as keyof typeof formData]);
         if (!isValid) hasErrors = true;
       });

      if (hasErrors) {
        toast({
          title: "Campos inválidos",
          description: "Por favor, corrija os erros antes de continuar.",
          variant: "destructive",
        });
        return;
      }
      setStep(2);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!acceptedTerms) {
      toast({
        title: "Termos obrigatórios",
        description: "Aceite os termos para continuar.",
        variant: "destructive",
      });
      return;
    }

    // Validate step 2 fields
    const fieldsToValidate = ["cep", "street", "number", "neighborhood", "city", "state"];
    let hasErrors = false;

    fieldsToValidate.forEach(field => {
         const isValid = validateField(field, formData[field as keyof typeof formData]);
         if (!isValid) hasErrors = true;
    });

    if (hasErrors) {
        toast({
          title: "Campos inválidos",
          description: "Por favor, corrija os erros antes de finalizar.",
          variant: "destructive",
        });
        return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.name,
            phone: formData.phone,
            document: formData.document,
            // Add other fields as needed to metadata or create a separate profile update step
          },
        },
      });

      if (error) throw error;

      toast({
        title: "Cadastro realizado!",
        description: "Verifique seu email para confirmar a conta.",
      });
      navigate("/");
    } catch (error: any) {
      toast({
        title: "Erro no cadastro",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/30">
        <div className="max-w-lg mx-auto flex items-center justify-between h-14 px-4">
          <button
            onClick={() => (step === 1 ? navigate(-1) : setStep(1))}
            className="p-2 -ml-2 text-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold text-foreground">Cadastro</h1>
          <div className="w-10" />
        </div>
      </header>

      {/* Progress */}
      <div className="max-w-lg mx-auto w-full px-6 pt-4">
        <div className="flex items-center gap-2">
          <div className={`h-1.5 flex-1 rounded-full transition-colors ${step >= 1 ? "bg-primary" : "bg-secondary"}`} />
          <div className={`h-1.5 flex-1 rounded-full transition-colors ${step >= 2 ? "bg-primary" : "bg-secondary"}`} />
        </div>
        <p className="text-xs text-muted-foreground mt-2">Passo {step} de 2</p>
      </div>

      {/* Form */}
      <div className="flex-1 px-6 py-6 max-w-lg mx-auto w-full">
        <form onSubmit={handleRegister} className="space-y-4">
          {step === 1 && (
            <div className="space-y-4 animate-slide-up">
              <div className="space-y-2">
                <Label htmlFor="name">Nome / Razão Social</Label>
                <Input
                  id="name"
                  placeholder="Seu nome completo"
                  value={formData.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  onBlur={() => handleBlur("name")}
                  className={`input-field ${errors.name ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                />
                {errors.name && <p className="text-xs font-semibold text-red-500 animate-fade-in">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  onBlur={() => handleBlur("email")}
                  className={`input-field ${errors.email ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                />
                {errors.email && <p className="text-xs font-semibold text-red-500 animate-fade-in">{errors.email}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="document">CPF / CNPJ</Label>
                  <Input
                    id="document"
                    placeholder="000.000.000-00"
                    value={formData.document}
                    onChange={(e) => updateField("document", maskDocument(e.target.value))}
                    onBlur={() => handleBlur("document")}
                    className={`input-field ${errors.document ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                    maxLength={18}
                  />
                  {errors.document && <p className="text-xs font-semibold text-red-500 animate-fade-in">{errors.document}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="birthDate">Data Nasc. / Abertura</Label>
                  <Input
                    id="birthDate"
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => updateField("birthDate", e.target.value)}
                    onBlur={() => handleBlur("birthDate")}
                    className={`input-field ${errors.birthDate ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                  />
                  {errors.birthDate && <p className="text-xs font-semibold text-red-500 animate-fade-in">{errors.birthDate}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="(00) 00000-0000"
                  value={formData.phone}
                  onChange={(e) => updateField("phone", maskPhone(e.target.value))}
                  onBlur={() => handleBlur("phone")}
                  className={`input-field ${errors.phone ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                  maxLength={15}
                />
                {errors.phone && <p className="text-xs font-semibold text-red-500 animate-fade-in">{errors.phone}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => updateField("password", e.target.value)}
                    className="input-field pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => updateField("confirmPassword", e.target.value)}
                  className="input-field"
                  required
                />
              </div>

              <Button type="button" onClick={handleNext} className="w-full btn-primary mt-6">
                Próximo
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-slide-up">
              <div className="space-y-2">
                <Label htmlFor="cep">CEP</Label>
                <Input
                  id="cep"
                  placeholder="00000-000"
                  value={formData.cep}
                  onChange={(e) => updateField("cep", e.target.value)}
                  className="input-field"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="street">Logradouro</Label>
                <Input
                  id="street"
                  placeholder="Rua, Avenida..."
                  value={formData.street}
                  onChange={(e) => updateField("street", e.target.value)}
                  className="input-field"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="number">Número</Label>
                  <Input
                    id="number"
                    placeholder="000"
                    value={formData.number}
                    onChange={(e) => updateField("number", e.target.value)}
                    className="input-field"
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="complement">Complemento</Label>
                  <Input
                    id="complement"
                    placeholder="Apto, Sala..."
                    value={formData.complement}
                    onChange={(e) => updateField("complement", e.target.value)}
                    className="input-field"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="neighborhood">Bairro</Label>
                <Input
                  id="neighborhood"
                  placeholder="Seu bairro"
                  value={formData.neighborhood}
                  onChange={(e) => updateField("neighborhood", e.target.value)}
                  className="input-field"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="city">Cidade</Label>
                  <Input
                    id="city"
                    placeholder="Sua cidade"
                    value={formData.city}
                    onChange={(e) => updateField("city", e.target.value)}
                    className="input-field"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">Estado</Label>
                  <Input
                    id="state"
                    placeholder="UF"
                    value={formData.state}
                    onChange={(e) => updateField("state", e.target.value)}
                    className="input-field"
                  />
                </div>
              </div>

              <div className="flex items-start space-x-3 pt-4">
                <Checkbox
                  id="terms"
                  checked={acceptedTerms}
                  onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
                />
                <label htmlFor="terms" className="text-sm text-muted-foreground leading-tight cursor-pointer">
                  Li e aceito os{" "}
                  <a href="#" className="text-primary font-medium hover:underline">
                    Termos de Uso
                  </a>{" "}
                  e{" "}
                  <a href="#" className="text-primary font-medium hover:underline">
                    Política de Privacidade
                  </a>
                </label>
              </div>

              <Button
                type="submit"
                className="w-full btn-primary mt-4"
                disabled={isLoading}
              >
                {isLoading ? "Cadastrando..." : "Cadastrar"}
              </Button>
            </div>
          )}
        </form>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          Já possui conta?{" "}
          <Link to="/" className="font-semibold text-primary hover:text-primary/80 transition-colors">
            Entre
          </Link>
        </p>
      </div>
    </div>
  );
}
