import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6">
      <div className="text-center animate-slide-up">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-secondary rounded-2xl mb-6">
          <span className="text-4xl font-bold text-primary">404</span>
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Página não encontrada</h1>
        <p className="text-muted-foreground mb-8">
          A página que você está procurando não existe ou foi movida.
        </p>
        <Link to="/dashboard">
          <Button className="btn-primary">
            <Home className="w-4 h-4 mr-2" />
            Voltar ao início
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
