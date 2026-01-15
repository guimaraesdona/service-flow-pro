import { useState } from "react";
import { formatPhone } from "@/lib/formatters";
import { Link } from "react-router-dom";
import { TopNav } from "@/components/layout/TopNav";
import { DesktopHeader } from "@/components/layout/DesktopHeader";
import { Plus, Search, Phone, Mail, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useClients } from "@/hooks/useClients";

export default function ClientsPage() {
  const [search, setSearch] = useState("");
  const { clients, isLoading } = useClients();

  const filteredClients = clients.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page-container bg-background">
      {/* Mobile Header */}
      <div className="lg:hidden">
        <TopNav
          title="Clientes"
          rightAction={
            <Link to="/clientes/novo">
              <Button size="icon" variant="ghost" className="text-primary hover:text-primary/80">
                <Plus className="w-5 h-5" />
              </Button>
            </Link>
          }
        />
      </div>

      {/* Desktop Header */}
      <div className="hidden lg:block">
        <DesktopHeader
          title="Clientes"
          actions={
            <Link to="/clientes/novo">
              <Button className="btn-primary">
                <Plus className="w-4 h-4 mr-2" />
                Novo Cliente
              </Button>
            </Link>
          }
        />
      </div>

      <div className="content-container">
        {/* Search */}
        <div className="relative mb-6 animate-fade-in">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar clientes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 input-field"
          />
        </div>

        {/* Client List */}
        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filteredClients.length > 0 ? (
          <div className="space-y-3 lg:grid lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 lg:gap-4 lg:space-y-0">
            {filteredClients.map((client, index) => (
              <Link
                key={client.id}
                to={`/clientes/${client.id}`}
                className="card-elevated p-4 flex items-center gap-4 hover:shadow-soft transition-all animate-slide-up"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground truncate">{client.name}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Mail className="w-3 h-3" />
                      {client.email || "Sem email"}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Phone className="w-3 h-3" />
                    {client.phone ? formatPhone(client.phone) : "-"}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 animate-fade-in">
            <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Nenhum cliente</h3>
            <p className="text-muted-foreground mb-6">Adicione seu primeiro cliente</p>
            <Link to="/clientes/novo">
              <Button className="btn-primary">
                <Plus className="w-4 h-4 mr-2" />
                Novo Cliente
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
