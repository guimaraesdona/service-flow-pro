import { Link, useParams } from "react-router-dom";
import { Pencil } from "lucide-react";
import { TopNav } from "@/components/layout/TopNav";
import { DesktopHeader } from "@/components/layout/DesktopHeader";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useServices } from "@/hooks/useServices";
import { useCustomFieldDefinitions } from "@/hooks/useCustomFieldDefinitions";
import { formatCurrency } from "@/lib/formatters";
import { printableValue } from "@/lib/customFields";

export default function ServiceDetailPage() {
  const { id } = useParams();
  const { services, isLoading } = useServices();
  const { fields: serviceFields } = useCustomFieldDefinitions("service");

  const service = services?.find((s) => s.id === id);

  if (isLoading) {
    return (
      <div className="page-container bg-background">
        <div className="content-container space-y-4">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="page-container bg-background">
        <TopNav title="Serviço" showBack />
        <div className="content-container">
          <div className="card-elevated p-10 text-center">
            <p className="font-medium text-foreground">Serviço não encontrado</p>
            <p className="text-sm text-muted-foreground mt-1">Ele pode ter sido excluído.</p>
            <Button asChild variant="outline" className="mt-4 h-9">
              <Link to="/servicos">Ver todos os serviços</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const customFields = serviceFields.flatMap((field) => {
    const value = printableValue(service.customFields?.[field.id]);
    return value ? [{ name: field.name, value }] : [];
  });

  return (
    <div className="page-container bg-background">
      <DesktopHeader
        title={service.name}
        actions={
          <Button asChild variant="outline" className="h-9">
            <Link to={`/servicos/${service.id}/editar`}>
              <Pencil className="w-4 h-4 mr-1.5" />
              Editar
            </Link>
          </Button>
        }
      />

      <div className="lg:hidden">
        <TopNav
          title="Serviço"
          showBack
          rightAction={
            <Button asChild size="icon" variant="ghost" aria-label="Editar serviço">
              <Link to={`/servicos/${service.id}/editar`}>
                <Pencil className="w-5 h-5" />
              </Link>
            </Button>
          }
        />
      </div>

      <div className="content-container">
        <section className="card-elevated p-4 lg:p-5 lg:max-w-3xl">
          <div className="flex items-start gap-4">
            {service.imageUrl && (
              <img src={service.imageUrl} alt="" className="w-16 h-16 lg:w-20 lg:h-20 rounded-lg object-cover shrink-0" />
            )}
            <div className="min-w-0 flex-1">
              {/* No desktop o nome já é o título da página. */}
              <h2 className="text-lg font-semibold text-foreground lg:sr-only">{service.name}</h2>
              <p className="text-sm text-muted-foreground mt-2 lg:mt-0">Valor base</p>
              <p className="text-2xl font-semibold tracking-tight text-foreground tabular">{formatCurrency(service.price)}</p>
            </div>
          </div>

          {(service.description || customFields.length > 0) && (
            <dl className="mt-4 pt-4 border-t border-border space-y-3 text-sm">
              {customFields.map((field) => (
                <div key={field.name} className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">{field.name}</dt>
                  <dd className="text-foreground text-right">{field.value}</dd>
                </div>
              ))}
              {service.description && (
                <div>
                  <dt className="text-muted-foreground">Descrição</dt>
                  <dd className="text-foreground mt-0.5 whitespace-pre-line max-w-prose">{service.description}</dd>
                </div>
              )}
            </dl>
          )}
        </section>
      </div>
    </div>
  );
}
