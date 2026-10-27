import { Link, useParams } from "react-router-dom";
import { format, isValid, parseISO } from "date-fns";
import { Mail, Pencil, Phone } from "lucide-react";
import { TopNav } from "@/components/layout/TopNav";
import { DesktopHeader } from "@/components/layout/DesktopHeader";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useClients } from "@/hooks/useClients";
import { useCustomFieldDefinitions } from "@/hooks/useCustomFieldDefinitions";
import { formatCEP, formatDocument, formatPhone } from "@/lib/formatters";
import { printableValue } from "@/lib/customFields";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="card-elevated">
      <h2 className="px-4 pt-4 text-sm font-semibold text-foreground">{title}</h2>
      <div className="p-4 pt-3">{children}</div>
    </section>
  );
}

// Data salva como "yyyy-MM-dd": new Date() leria em UTC e mostraria o dia anterior.
const shortDate = (value?: string) => {
  const date = value ? parseISO(value) : undefined;
  return date && isValid(date) ? format(date, "dd/MM/yyyy") : "";
};

export default function ClientDetailPage() {
  const { id } = useParams();
  const { clients, isLoading } = useClients();
  const { fields: clientFields } = useCustomFieldDefinitions("client");

  const client = clients?.find((c) => c.id === id);

  if (isLoading) {
    return (
      <div className="page-container bg-background">
        <div className="content-container space-y-4">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="page-container bg-background">
        <TopNav title="Cliente" showBack />
        <div className="content-container">
          <div className="card-elevated p-10 text-center">
            <p className="font-medium text-foreground">Cliente não encontrado</p>
            <p className="text-sm text-muted-foreground mt-1">Ele pode ter sido excluído.</p>
            <Button asChild variant="outline" className="mt-4 h-9">
              <Link to="/clientes">Ver todos os clientes</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const birthDate = shortDate(client.birthDate);
  const customFields = clientFields.flatMap((field) => {
    const value = printableValue(client.customFields?.[field.id]);
    return value ? [{ name: field.name, value }] : [];
  });

  return (
    <div className="page-container bg-background">
      <DesktopHeader
        title={client.name}
        actions={
          <Button asChild variant="outline" className="h-9">
            <Link to={`/clientes/${client.id}/editar`}>
              <Pencil className="w-4 h-4 mr-1.5" />
              Editar
            </Link>
          </Button>
        }
      />

      <div className="lg:hidden">
        <TopNav
          title="Cliente"
          showBack
          rightAction={
            <Button asChild size="icon" variant="ghost" aria-label="Editar cliente">
              <Link to={`/clientes/${client.id}/editar`}>
                <Pencil className="w-5 h-5" />
              </Link>
            </Button>
          }
        />
      </div>

      <div className="content-container lg:grid lg:grid-cols-3 lg:gap-6 lg:items-start space-y-4 lg:space-y-0">
        <div className="lg:col-span-2 space-y-4">
          {/* Resumo */}
          <section className="card-elevated p-4 lg:p-5">
            <div className="flex items-center gap-3">
              {client.avatar && (
                <img src={client.avatar} alt="" className="w-12 h-12 rounded-full object-cover shrink-0" />
              )}
              <div className="min-w-0">
                {/* No desktop o nome já é o título da página. */}
                <h2 className="text-lg font-semibold text-foreground lg:sr-only">{client.name}</h2>
                <p className="text-sm text-muted-foreground tabular lg:hidden">{formatDocument(client.document)}</p>
              </div>
            </div>
            <dl className="mt-3 lg:mt-0 grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2 text-sm">
              <div className="hidden lg:block">
                <dt className="text-muted-foreground">CPF / CNPJ</dt>
                <dd className="text-foreground tabular">{formatDocument(client.document)}</dd>
              </div>
              {birthDate && (
                <div>
                  <dt className="text-muted-foreground">Nascimento / abertura</dt>
                  <dd className="text-foreground tabular">{birthDate}</dd>
                </div>
              )}
              {customFields.map((field) => (
                <div key={field.name}>
                  <dt className="text-muted-foreground">{field.name}</dt>
                  <dd className="text-foreground">{field.value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <Section title="Endereços">
            {client.addresses.length > 0 ? (
              <ul className="divide-y divide-border -my-3">
                {client.addresses.map((address) => (
                  <li key={address.id} className="py-3 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">{address.label}</span>
                      {address.isDefault && (
                        <span className="status-badge bg-accent text-accent-foreground">Padrão</span>
                      )}
                    </div>
                    <p className="text-foreground mt-0.5">
                      {address.street}, {address.number}
                      {address.complement && ` - ${address.complement}`}
                      {address.neighborhood && ` · ${address.neighborhood}`}
                    </p>
                    <p className="text-muted-foreground tabular">
                      {address.city} - {address.state} · CEP {formatCEP(address.cep)}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">Nenhum endereço cadastrado.</p>
            )}
          </Section>
        </div>

        <div className="space-y-4">
          <Section title="Contato">
            {client.phone || client.email ? (
              <div className="space-y-1">
                {client.phone && (
                  <a href={`tel:${client.phone.replace(/\D/g, "")}`} className="flex items-center gap-2 h-9 max-md:h-11 text-sm text-primary hover:underline underline-offset-4">
                    <Phone className="w-4 h-4 shrink-0" aria-hidden="true" />
                    {formatPhone(client.phone)}
                  </a>
                )}
                {client.email && (
                  <a href={`mailto:${client.email}`} className="flex items-center gap-2 h-9 max-md:h-11 text-sm text-primary hover:underline underline-offset-4 min-w-0">
                    <Mail className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span className="truncate">{client.email}</span>
                  </a>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Nenhum contato cadastrado.</p>
            )}
          </Section>
        </div>
      </div>
    </div>
  );
}
