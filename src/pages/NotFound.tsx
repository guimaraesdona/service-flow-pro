import { Link } from "react-router-dom";
import { Home } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => (
  <main className="min-h-screen flex flex-col items-center justify-center bg-background px-6">
    <div className="text-center max-w-sm animate-fade-in">
      <h1 className="text-2xl font-bold text-foreground mb-2">Página não encontrada</h1>
      <p className="text-muted-foreground mb-8">
        O endereço não existe ou foi alterado (erro 404). Volte ao início e siga pelo menu.
      </p>
      <Button asChild className="btn-primary px-5">
        <Link to="/dashboard">
          <Home className="w-4 h-4 mr-2" />
          Voltar ao início
        </Link>
      </Button>
    </div>
  </main>
);

export default NotFound;
