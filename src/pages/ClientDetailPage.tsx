import { useParams, useNavigate } from "react-router-dom";
import { TopNav } from "@/components/layout/TopNav";
import { Button } from "@/components/ui/button";
import { Edit, User, Mail, Phone, FileText, MapPin, Calendar } from "lucide-react";

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  document: string;
  birthDate: string;
  address: {
    cep: string;
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
  };
}

const mockClients: Record<string, Client> = {
  "1": {
    id: "1",
    name: "Maria Silva",
    email: "maria@email.com",
    phone: "(11) 99999-1111",
    document: "123.456.789-00",
    birthDate: "1985-03-15",
    address: {
      cep: "01310-100",
      street: "Av. Paulista",
      number: "1000",
      complement: "Sala 501",
      neighborhood: "Bela Vista",
      city: "São Paulo",
      state: "SP",
    },
  },
  "2": {
    id: "2",
    name: "João Santos",
    email: "joao@email.com",
    phone: "(11) 99999-2222",
    document: "987.654.321-00",
    birthDate: "1990-07-20",
    address: {
      cep: "04538-132",
      street: "Rua Funchal",
      number: "418",
      neighborhood: "Vila Olímpia",
      city: "São Paulo",
      state: "SP",
    },
  },
  "3": {
    id: "3",
    name: "Ana Oliveira",
    email: "ana@email.com",
    phone: "(11) 99999-3333",
    document: "456.789.123-00",
    birthDate: "1988-11-10",
    address: {
      cep: "01311-000",
      street: "Rua Augusta",
      number: "200",
      neighborhood: "Consolação",
      city: "São Paulo",
      state: "SP",
    },
  },
  "4": {
    id: "4",
    name: "Carlos Mendes",
    email: "carlos@email.com",
    phone: "(11) 99999-4444",
    document: "789.123.456-00",
    birthDate: "1982-05-25",
    address: {
      cep: "04543-011",
      street: "Av. Engenheiro Luiz Carlos Berrini",
      number: "1500",
      neighborhood: "Cidade Monções",
      city: "São Paulo",
      state: "SP",
    },
  },
  "5": {
    id: "5",
    name: "Paula Costa",
    email: "paula@email.com",
    phone: "(11) 99999-5555",
    document: "321.654.987-00",
    birthDate: "1995-09-08",
    address: {
      cep: "01310-200",
      street: "Rua Haddock Lobo",
      number: "595",
      neighborhood: "Cerqueira César",
      city: "São Paulo",
      state: "SP",
    },
  },
};

export default function ClientDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const client = id ? mockClients[id] : null;

  if (!client) {
    return (
      <div className="page-container bg-background">
        <TopNav title="Cliente" showBack />
        <div className="content-container">
          <div className="text-center py-16">
            <p className="text-muted-foreground">Cliente não encontrado</p>
          </div>
        </div>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("pt-BR");
  };

  return (
    <div className="page-container bg-background">
      <TopNav
        title="Cliente"
        showBack
        rightAction={
          <Button
            size="icon"
            variant="ghost"
            onClick={() => navigate(`/clientes/${id}/editar`)}
            className="text-primary hover:text-primary/80"
          >
            <Edit className="w-5 h-5" />
          </Button>
        }
      />

      <div className="content-container space-y-6">
        {/* Header */}
        <div className="card-elevated p-6 text-center animate-fade-in">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <User className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-foreground">{client.name}</h2>
          <p className="text-sm text-muted-foreground">{client.document}</p>
        </div>

        {/* Contact Info */}
        <div className="card-elevated p-4 animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <h3 className="text-sm font-semibold text-foreground mb-4">Contato</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                <Mail className="w-4 h-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-sm text-foreground">{client.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                <Phone className="w-4 h-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Telefone</p>
                <p className="text-sm text-foreground">{client.phone}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                <Calendar className="w-4 h-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Data de Nascimento</p>
                <p className="text-sm text-foreground">{formatDate(client.birthDate)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="card-elevated p-4 animate-slide-up" style={{ animationDelay: "0.2s" }}>
          <h3 className="text-sm font-semibold text-foreground mb-4">Endereço</h3>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
              <MapPin className="w-4 h-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm text-foreground">
                {client.address.street}, {client.address.number}
                {client.address.complement && ` - ${client.address.complement}`}
              </p>
              <p className="text-sm text-foreground">
                {client.address.neighborhood}
              </p>
              <p className="text-sm text-muted-foreground">
                {client.address.city} - {client.address.state}
              </p>
              <p className="text-sm text-muted-foreground">CEP: {client.address.cep}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
