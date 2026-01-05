import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    setTimeout(() => {
      setIsLoading(false);
      setSent(true);
      toast({
        title: "Email enviado!",
        description: "Verifique sua caixa de entrada.",
      });
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/30">
        <div className="max-w-lg mx-auto flex items-center justify-between h-14 px-4">
          <Link to="/" className="p-2 -ml-2 text-foreground hover:text-primary transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-lg font-semibold text-foreground">Recuperar senha</h1>
          <div className="w-10" />
        </div>
      </header>

      <div className="flex-1 flex flex-col justify-center px-6 py-12">
        <div className="mx-auto w-full max-w-sm">
          {!sent ? (
            <div className="animate-slide-up">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-secondary rounded-2xl mb-4">
                  <Mail className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">Esqueceu a senha?</h2>
                <p className="mt-2 text-muted-foreground">
                  Informe seu email e enviaremos um link para redefinir sua senha.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full btn-primary"
                  disabled={isLoading}
                >
                  {isLoading ? "Enviando..." : "Enviar link"}
                </Button>
              </form>
            </div>
          ) : (
            <div className="text-center animate-scale-in">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-status-finished/15 rounded-full mb-4">
                <Mail className="w-8 h-8 text-status-finished" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Verifique seu email</h2>
              <p className="mt-2 text-muted-foreground">
                Enviamos um link de recuperação para <strong>{email}</strong>
              </p>
              <Link to="/">
                <Button variant="outline" className="mt-6">
                  Voltar ao login
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
