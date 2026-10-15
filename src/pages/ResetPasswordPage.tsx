import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

// Destino do link de recuperação de senha. O cliente do Supabase lê o token da
// URL e abre uma sessão temporária; com ela, updateUser troca a senha.
export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const { session, loading } = useAuth();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({
        title: "As senhas não coincidem",
        description: "Digite a mesma senha nos dois campos.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) throw error;

      toast({
        title: "Senha alterada!",
        description: "Você já está conectado com a nova senha.",
      });
      navigate("/dashboard");
    } catch (error) {
      toast({
        title: "Erro ao alterar senha",
        description: error instanceof Error ? error.message : "Tente novamente.",
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
          <Link to="/" className="p-2 -ml-2 text-foreground hover:text-primary transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-lg font-semibold text-foreground">Nova senha</h1>
          <div className="w-10" />
        </div>
      </header>

      <div className="flex-1 flex flex-col justify-center px-6 py-12">
        <div className="mx-auto w-full max-w-sm">
          {loading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : !session ? (
            <div className="text-center animate-scale-in">
              <h2 className="text-2xl font-bold text-foreground">Link inválido ou expirado</h2>
              <p className="mt-2 text-muted-foreground">
                Peça um novo link de recuperação para redefinir sua senha.
              </p>
              <Link to="/esqueci-senha">
                <Button variant="outline" className="mt-6">
                  Pedir novo link
                </Button>
              </Link>
            </div>
          ) : (
            <div className="animate-slide-up">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-secondary rounded-2xl mb-4">
                  <KeyRound className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">Defina uma nova senha</h2>
                <p className="mt-2 text-muted-foreground">
                  Escolha a nova senha para <strong>{session.user.email}</strong>
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="password">Nova senha</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar senha</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="input-field"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full btn-primary"
                  disabled={isLoading}
                >
                  {isLoading ? "Salvando..." : "Salvar nova senha"}
                </Button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
