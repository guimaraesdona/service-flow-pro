import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

// Ação principal do celular na zona do polegar, logo acima da barra inferior.
// Quem usa a página precisa reservar ~4rem no fim do conteúdo para não cobrir o último item.
export function NewOrderFab() {
  return (
    <Button
      asChild
      className="lg:hidden fixed right-4 bottom-[calc(4.75rem+env(safe-area-inset-bottom))] z-40 h-12 max-md:h-12 rounded-full px-5 shadow-elevated"
    >
      <Link to="/ordens/nova">
        <Plus className="w-5 h-5 mr-1.5" />
        Nova OS
      </Link>
    </Button>
  );
}
