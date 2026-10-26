import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { AppLogo } from "@/components/ui/app-logo";
import { validateEmail } from "@/utils/validations";

// Traduz os erros do Supabase Auth. Antes todo erro virava a mesma mensagem
// genérica, o que escondia, por exemplo, uma conta com email não confirmado.
const loginErrorMessage = (error: { code?: string; message?: string }) => {
  switch (error.code) {
    case "invalid_credentials":
      return "Email ou senha incorretos.";
    case "email_not_confirmed":
      return "Confirme seu email pelo link que enviamos antes de entrar.";
    case "over_request_rate_limit":
    case "over_email_send_rate_limit":
      return "Muitas tentativas. Aguarde alguns minutos e tente novamente.";
    default:
      return error.message || "Ocorreu um erro ao fazer login.";
  }
};

export default function LoginPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateField = (field: string, value: string) => {
    let error = "";
    if (field === "email") {
      if (!value) error = "Campo obrigatório";
      else if (!validateEmail(value)) error = "Email inválido";
    }
    if (field === "password" && !value) {
      error = "Campo obrigatório";
    }

    setErrors((prev) => ({ ...prev, [field]: error }));
    return !error;
  };

  const handleBlur = (field: string, value: string) => {
    validateField(field, value);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const isEmailValid = validateField("email", email);
    const isPasswordValid = validateField("password", password);

    if (!isEmailValid || !isPasswordValid) {
       toast({
        title: "Campos inválidos",
        description: "Verifique os erros antes de continuar.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Erro ao entrar",
        description: loginErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12">
        <div className="mx-auto w-full max-w-sm">
          {/* Logo */}
          <div className="text-center mb-10 animate-fade-in">
            <AppLogo size="lg" className="mb-4 shadow-soft" />
            <h1 className="text-3xl font-bold text-foreground">Bem-vindo</h1>
            <p className="mt-2 text-muted-foreground">Faça login para continuar</p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5 animate-slide-up">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email" aria-invalid={!!errors.email} aria-describedby={errors.email ? "email-error" : undefined}
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) validateField("email", e.target.value);
                }}
                onBlur={() => handleBlur("email", email)}
                className={`input-field ${errors.email ? "border-destructive focus-visible:ring-destructive" : ""}`}
                required
              />
              {errors.email && <p id="email-error" role="alert" className="text-xs font-semibold text-destructive animate-fade-in">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Input
                  id="password" aria-invalid={!!errors.password} aria-describedby={errors.password ? "password-error" : undefined}
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) validateField("password", e.target.value);
                  }}
                  onBlur={() => handleBlur("password", password)}
                  className={`input-field pr-11 ${errors.password ? "border-destructive focus-visible:ring-destructive" : ""}`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  aria-pressed={showPassword}
                  className="absolute right-0 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p id="password-error" role="alert" className="text-xs font-semibold text-destructive animate-fade-in">{errors.password}</p>}
            </div>

            <div className="text-right">
              <Link
                to="/esqueci-senha"
                className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
              >
                Esqueceu a senha?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full btn-primary"
              disabled={isLoading}
            >
              {isLoading ? "Entrando..." : "Entrar"}
            </Button>
          </form>

          {/* Register Link */}
          <p className="mt-10 text-center text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: "0.2s" }}>
            Não tem conta?{" "}
            <Link to="/cadastro" className="font-semibold text-primary hover:text-primary/80 transition-colors">
              Cadastre-se
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
