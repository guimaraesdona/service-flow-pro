import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Search } from "lucide-react";
import { TopNav } from "@/components/layout/TopNav";
import { DesktopHeader } from "@/components/layout/DesktopHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useClients } from "@/hooks/useClients";
import { formatDocument, formatPhone } from "@/lib/formatters";

export default function ClientsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const { clients, isLoading } = useClients();

  const term = search.toLowerCase();
  const filteredClients = clients.filter(
    (c) => c.name.toLowerCase().includes(term) || c.email?.toLowerCase().includes(term),
  );

  return (
    <div className="page-container bg-background">
      <div className="lg:hidden">
        <TopNav
          title="Clientes"
          rightAction={
            <Button asChild size="icon" variant="ghost" aria-label="Novo cliente" className="text-primary hover:text-primary/80">
              <Link to="/clientes/novo">
                <Plus className="w-5 h-5" />
              </Link>
            </Button>
          }
        />
      </div>

      <DesktopHeader
        title="Clientes"
        actions={
          <Button asChild className="h-9">
            <Link to="/clientes/novo">
              <Plus className="w-4 h-4 mr-1.5" />
              Novo cliente
            </Link>
          </Button>
        }
      />

      <div className="content-container space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
          <Input
            type="search"
            aria-label="Buscar clientes"
            placeholder="Buscar clientes"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 input-field"
          />
        </div>

        {isLoading ? (
          <div className="card-elevated divide-y divide-border">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="p-4 space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        ) : clients.length === 0 ? (
          <div className="card-elevated p-10 text-center">
            <h2 className="font-semibold text-foreground">Nenhum cliente cadastrado</h2>
            <p className="text-sm text-muted-foreground mt-1">Cadastre um cliente para abrir ordens de serviço para ele.</p>
            <Button asChild className="mt-4 h-10">
              <Link to="/clientes/novo">
                <Plus className="w-4 h-4 mr-1.5" />
                Novo cliente
              </Link>
            </Button>
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="card-elevated p-10 text-center">
            <p className="font-medium text-foreground">Nenhum cliente encontrado</p>
            <p className="text-sm text-muted-foreground mt-1">Nada corresponde a essa busca.</p>
            <Button variant="outline" className="mt-4 h-9" onClick={() => setSearch("")}>
              Limpar busca
            </Button>
          </div>
        ) : (
          <>
            {/* Desktop: tabela */}
            <div className="hidden lg:block card-elevated">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs font-medium text-muted-foreground">
                    <th scope="col" className="px-4 h-10 font-medium">Nome</th>
                    <th scope="col" className="px-4 h-10 font-medium">Email</th>
                    <th scope="col" className="px-4 h-10 font-medium w-44">Telefone</th>
                    <th scope="col" className="px-4 h-10 font-medium w-48">CPF / CNPJ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredClients.map((client) => (
                    <tr
                      key={client.id}
                      onClick={() => navigate(`/clientes/${client.id}`)}
                      className="cursor-pointer hover:bg-muted/60 transition-colors"
                    >
                      <td className="px-4 h-14 font-medium text-foreground">
                        <Link
                          to={`/clientes/${client.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="rounded-sm hover:underline underline-offset-4"
                        >
                          {client.name}
                        </Link>
                      </td>
                      <td className="px-4 text-muted-foreground max-w-xs truncate">{client.email || "—"}</td>
                      <td className="px-4 text-muted-foreground whitespace-nowrap tabular">{client.phone ? formatPhone(client.phone) : "—"}</td>
                      <td className="px-4 text-muted-foreground whitespace-nowrap tabular">{client.document ? formatDocument(client.document) : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Celular: lista */}
            <ul className="lg:hidden card-elevated divide-y divide-border">
              {filteredClients.map((client) => (
                <li key={client.id}>
                  <Link to={`/clientes/${client.id}`} className="block p-4 active:bg-muted/60">
                    <p className="text-sm font-medium text-foreground truncate">{client.name}</p>
                    <p className="text-sm text-muted-foreground truncate mt-0.5">{client.email || "Sem email"}</p>
                    {client.phone && <p className="text-sm text-muted-foreground tabular">{formatPhone(client.phone)}</p>}
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
