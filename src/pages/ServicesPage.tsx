import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Search } from "lucide-react";
import { TopNav } from "@/components/layout/TopNav";
import { DesktopHeader } from "@/components/layout/DesktopHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useServices } from "@/hooks/useServices";
import { formatCurrency } from "@/lib/formatters";

export default function ServicesPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const { services, isLoading } = useServices();

  const term = search.toLowerCase();
  const filteredServices = services.filter(
    (s) => s.name.toLowerCase().includes(term) || s.description?.toLowerCase().includes(term),
  );

  return (
    <div className="page-container bg-background">
      <div className="lg:hidden">
        <TopNav
          title="Serviços"
          rightAction={
            <Button asChild size="icon" variant="ghost" aria-label="Novo serviço" className="text-primary hover:text-primary/80">
              <Link to="/servicos/novo">
                <Plus className="w-5 h-5" />
              </Link>
            </Button>
          }
        />
      </div>

      <DesktopHeader
        title="Serviços"
        actions={
          <Button asChild className="h-9">
            <Link to="/servicos/novo">
              <Plus className="w-4 h-4 mr-1.5" />
              Novo serviço
            </Link>
          </Button>
        }
      />

      <div className="content-container space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
          <Input
            type="search"
            aria-label="Buscar serviços"
            placeholder="Buscar serviços"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 input-field"
          />
        </div>

        {isLoading ? (
          <div className="card-elevated divide-y divide-border">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="p-4 flex items-center gap-4">
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        ) : services.length === 0 ? (
          <div className="card-elevated p-10 text-center">
            <h2 className="font-semibold text-foreground">Nenhum serviço cadastrado</h2>
            <p className="text-sm text-muted-foreground mt-1">Cadastre os serviços que você oferece para montar as ordens mais rápido.</p>
            <Button asChild className="mt-4 h-10">
              <Link to="/servicos/novo">
                <Plus className="w-4 h-4 mr-1.5" />
                Novo serviço
              </Link>
            </Button>
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="card-elevated p-10 text-center">
            <p className="font-medium text-foreground">Nenhum serviço encontrado</p>
            <p className="text-sm text-muted-foreground mt-1">Nada corresponde a essa busca.</p>
            <Button variant="outline" className="mt-4 h-9" onClick={() => setSearch("")}>
              Limpar busca
            </Button>
          </div>
        ) : (
          <>
            {/* Desktop: tabela */}
            <div className="hidden lg:block card-elevated">
              <table className="w-full text-sm table-fixed">
                <thead>
                  <tr className="border-b border-border text-left text-xs font-medium text-muted-foreground">
                    <th scope="col" className="px-4 h-10 font-medium w-1/3">Nome</th>
                    <th scope="col" className="px-4 h-10 font-medium">Descrição</th>
                    <th scope="col" className="px-4 h-10 font-medium w-36 text-right">Valor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredServices.map((service) => (
                    <tr
                      key={service.id}
                      onClick={() => navigate(`/servicos/${service.id}`)}
                      className="cursor-pointer hover:bg-muted/60 transition-colors"
                    >
                      <td className="px-4 h-14 font-medium text-foreground truncate">
                        <Link
                          to={`/servicos/${service.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="rounded-sm hover:underline underline-offset-4"
                        >
                          {service.name}
                        </Link>
                      </td>
                      <td className="px-4 text-muted-foreground truncate">{service.description || "—"}</td>
                      <td className="px-4 text-right font-medium text-foreground whitespace-nowrap tabular">{formatCurrency(service.price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Celular: lista */}
            <ul className="lg:hidden card-elevated divide-y divide-border">
              {filteredServices.map((service) => (
                <li key={service.id}>
                  <Link to={`/servicos/${service.id}`} className="flex items-start gap-3 p-4 active:bg-muted/60">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{service.name}</p>
                      {service.description && <p className="text-sm text-muted-foreground truncate mt-0.5">{service.description}</p>}
                    </div>
                    <span className="text-sm font-semibold text-foreground whitespace-nowrap tabular">{formatCurrency(service.price)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
