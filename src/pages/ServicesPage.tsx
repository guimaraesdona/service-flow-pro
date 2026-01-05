import { useState } from "react";
import { Link } from "react-router-dom";
import { TopNav } from "@/components/layout/TopNav";
import { Plus, Search, Wrench, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
}

const mockServices: Service[] = [
  { id: "1", name: "Manutenção Preventiva", description: "Verificação geral e ajustes", price: 150.0 },
  { id: "2", name: "Instalação Elétrica", description: "Instalação de pontos elétricos", price: 250.0 },
  { id: "3", name: "Reparo Hidráulico", description: "Conserto de vazamentos e encanamentos", price: 180.0 },
  { id: "4", name: "Pintura", description: "Pintura de ambientes internos", price: 350.0 },
  { id: "5", name: "Montagem de Móveis", description: "Montagem e instalação de móveis", price: 120.0 },
];

export default function ServicesPage() {
  const [search, setSearch] = useState("");
  const [services] = useState<Service[]>(mockServices);

  const filteredServices = services.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page-container bg-background">
      <TopNav
        title="Serviços"
        rightAction={
          <Link to="/servicos/novo">
            <Button size="icon" variant="ghost" className="text-primary hover:text-primary/80">
              <Plus className="w-5 h-5" />
            </Button>
          </Link>
        }
      />

      <div className="content-container">
        {/* Search */}
        <div className="relative mb-6 animate-fade-in">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar serviços..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 input-field"
          />
        </div>

        {/* Services List */}
        {filteredServices.length > 0 ? (
          <div className="space-y-3">
            {filteredServices.map((service, index) => (
              <Link
                key={service.id}
                to={`/servicos/${service.id}`}
                className="card-elevated p-4 flex items-center gap-4 hover:shadow-soft transition-all animate-slide-up"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center flex-shrink-0">
                  <Wrench className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground truncate">{service.name}</h3>
                  <p className="text-sm text-muted-foreground truncate">{service.description}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-sm font-semibold text-foreground">
                    <DollarSign className="w-3 h-3" />
                    {service.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 animate-fade-in">
            <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
              <Wrench className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Nenhum serviço</h3>
            <p className="text-muted-foreground mb-6">Adicione seu primeiro serviço</p>
            <Link to="/servicos/novo">
              <Button className="btn-primary">
                <Plus className="w-4 h-4 mr-2" />
                Novo Serviço
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
