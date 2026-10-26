import { Link, useParams, useNavigate } from "react-router-dom";
import { TopNav } from "@/components/layout/TopNav";
import { DesktopHeader } from "@/components/layout/DesktopHeader";
import { Pencil, Printer, Phone, Mail, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ToastAction } from "@/components/ui/toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import { useOrders } from "@/hooks/useOrders";
import { useClients } from "@/hooks/useClients";
import { useCustomFieldDefinitions } from "@/hooks/useCustomFieldDefinitions";
import { formatCurrency, formatOrderNumber, formatPriority } from "@/lib/formatters";
import { printableValue } from "@/lib/customFields";
import { STATUS_FLOW, STATUS_LABELS } from "@/lib/orderStatus";
import { OrderStatus } from "@/types";

const longDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });

const dateTime = (dateStr: string) =>
  new Date(dateStr).toLocaleString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }).replace(".", "");

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="card-elevated">
      <h2 className="px-4 pt-4 text-sm font-semibold text-foreground">{title}</h2>
      <div className="p-4 pt-3">{children}</div>
    </section>
  );
}

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { orders, isLoading, updateStatus, deleteOrder } = useOrders();
  const { clients } = useClients();
  const { fields: orderFields } = useCustomFieldDefinitions("order");

  const order = orders?.find((o) => o.id === id);

  if (isLoading) {
    return (
      <div className="page-container bg-background">
        <div className="content-container space-y-4">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="page-container bg-background">
        <TopNav title="Ordem de serviço" showBack />
        <div className="content-container">
          <div className="card-elevated p-10 text-center">
            <p className="font-medium text-foreground">Ordem não encontrada</p>
            <p className="text-sm text-muted-foreground mt-1">Ela pode ter sido excluída.</p>
            <Button asChild variant="outline" className="mt-4 h-9">
              <Link to="/ordens">Ver todas as ordens</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const number = formatOrderNumber(order);
  const client = clients?.find((c) => c.id === order.clientId);
  const flow = STATUS_FLOW[order.status];
  const subtotal = order.services.reduce((acc, s) => acc + s.price * s.quantity, 0);
  const customFields = orderFields.flatMap((field) => {
    const value = printableValue(order.customFields?.[field.id]);
    return value ? [{ name: field.name, value }] : [];
  });

  const changeStatus = async (to: OrderStatus) => {
    const from = order.status;
    try {
      await updateStatus.mutateAsync({ id: order.id, status: to });
      toast({
        title: `${number} agora está ${STATUS_LABELS[to].toLowerCase()}`,
        action: (
          <ToastAction altText="Desfazer a troca de status" onClick={() => updateStatus.mutate({ id: order.id, status: from })}>
            Desfazer
          </ToastAction>
        ),
      });
    } catch (error) {
      toast({
        title: "Não foi possível trocar o status",
        description: error instanceof Error ? error.message : "Tente de novo.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteOrder.mutateAsync(order.id);
      toast({ title: `${number} excluída` });
      navigate("/ordens", { replace: true });
    } catch (error) {
      toast({
        title: "Não foi possível excluir",
        description: error instanceof Error ? error.message : "Tente de novo.",
        variant: "destructive",
      });
    }
  };

  const nextStep = flow.next && (
    <Button className="h-11 lg:h-10 w-full sm:w-auto" disabled={updateStatus.isPending} onClick={() => changeStatus(flow.next!.to)}>
      {flow.next.label}
    </Button>
  );

  // Cancelar é troca de status (reversível), não exclusão: fica com o ciclo, discreto.
  const cancelStep = order.status !== "cancelled" && order.status !== "finished" && (
    <ConfirmButton
      label="Cancelar OS"
      tone="quiet"
      title={`Cancelar a OS ${number}?`}
      description="Ela sai das ordens em andamento. Dá para reabrir depois."
      confirmLabel="Cancelar OS"
      onConfirm={() => changeStatus("cancelled")}
    />
  );

  const otherSteps = flow.others.map((step) => (
    <Button
      key={step.to}
      variant={flow.next ? "outline" : "default"}
      className="h-11 lg:h-10 w-full sm:w-auto"
      disabled={updateStatus.isPending}
      onClick={() => changeStatus(step.to)}
    >
      {step.label}
    </Button>
  ));

  return (
    <div className="page-container bg-background">
      <DesktopHeader
        title={`Ordem de serviço ${number}`}
        actions={
          <>
            <Button asChild variant="outline" className="h-9">
              <Link to={`/ordens/${order.id}/imprimir`}>
                <Printer className="w-4 h-4 mr-1.5" />
                Imprimir
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-9">
              <Link to={`/ordens/${order.id}/editar`}>
                <Pencil className="w-4 h-4 mr-1.5" />
                Editar
              </Link>
            </Button>
          </>
        }
      />

      <div className="lg:hidden">
        <TopNav
          title={`OS ${number}`}
          showBack
          rightAction={
            <div className="flex">
              <Button asChild size="icon" variant="ghost" aria-label="Imprimir">
                <Link to={`/ordens/${order.id}/imprimir`}><Printer className="w-5 h-5" /></Link>
              </Button>
              <Button asChild size="icon" variant="ghost" aria-label="Editar">
                <Link to={`/ordens/${order.id}/editar`}><Pencil className="w-5 h-5" /></Link>
              </Button>
            </div>
          }
        />
      </div>

      <div className="content-container lg:grid lg:grid-cols-3 lg:gap-6 lg:items-start space-y-4 lg:space-y-0">
        <div className="lg:col-span-2 space-y-4">
          {/* Resumo e próximo passo */}
          <section className="card-elevated p-4 lg:p-5">
            <h2 className="sr-only">Resumo</h2>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <StatusBadge status={order.status} className="text-sm px-2.5 py-1" />
              {order.priority === "high" && (
                <span className="text-xs font-medium text-destructive">Prioridade alta</span>
              )}
            </div>
            <dl className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2 text-sm">
              <div>
                <dt className="text-muted-foreground">Aberta em</dt>
                <dd className="text-foreground">{longDate(order.date)}</dd>
              </div>
              {order.scheduledAt && (
                <div>
                  <dt className="text-muted-foreground">Agendada para</dt>
                  <dd className="text-foreground">{dateTime(order.scheduledAt)}</dd>
                </div>
              )}
              {order.priority !== "high" && (
                <div>
                  <dt className="text-muted-foreground">Prioridade</dt>
                  <dd className="text-foreground">{formatPriority(order.priority)}</dd>
                </div>
              )}
            </dl>

            {/* Desktop: ações de status no próprio resumo */}
            <div className="hidden lg:flex flex-wrap items-center gap-2 mt-5 pt-4 border-t border-border">
              {nextStep}
              {otherSteps}
              {cancelStep && <div className="ml-auto">{cancelStep}</div>}
            </div>
          </section>

          <Section title="Serviços">
            <ul className="divide-y divide-border">
              {order.services.map((service, index) => (
                <li key={index} className="flex items-center justify-between gap-4 py-2.5 first:pt-0">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{service.name}</p>
                    <p className="text-xs text-muted-foreground tabular">
                      {service.quantity} × {formatCurrency(service.price)}
                    </p>
                  </div>
                  <p className="text-sm text-foreground tabular whitespace-nowrap">{formatCurrency(service.price * service.quantity)}</p>
                </li>
              ))}
            </ul>
            <dl className="mt-3 pt-3 border-t border-border space-y-1 text-sm tabular">
              {(order.discount ?? 0) > 0 && (
                <>
                  <div className="flex justify-between text-muted-foreground">
                    <dt>Subtotal</dt>
                    <dd>{formatCurrency(subtotal)}</dd>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <dt>Desconto</dt>
                    <dd>− {formatCurrency(order.discount ?? 0)}</dd>
                  </div>
                </>
              )}
              <div className="flex justify-between text-base font-semibold text-foreground">
                <dt>Total</dt>
                <dd>{formatCurrency(order.total)}</dd>
              </div>
            </dl>
          </Section>

          {(order.description || order.observations || customFields.length > 0) && (
            <Section title="Detalhes">
              <dl className="space-y-3 text-sm">
                {customFields.map((field) => (
                  <div key={field.name} className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">{field.name}</dt>
                    <dd className="text-foreground text-right">{field.value}</dd>
                  </div>
                ))}
                {order.description && (
                  <div>
                    <dt className="text-muted-foreground">Descrição</dt>
                    <dd className="text-foreground mt-0.5 whitespace-pre-line">{order.description}</dd>
                  </div>
                )}
                {order.observations && (
                  <div>
                    <dt className="text-muted-foreground">Observações</dt>
                    <dd className="text-foreground mt-0.5 whitespace-pre-line">{order.observations}</dd>
                  </div>
                )}
              </dl>
            </Section>
          )}
        </div>

        <div className="space-y-4">
          <Section title="Cliente">
            <Link
              to={`/clientes/${order.clientId}`}
              className="flex items-center justify-between gap-3 -mx-2 px-2 py-1.5 max-md:min-h-11 rounded-md hover:bg-muted"
            >
              <span className="text-sm font-medium text-foreground">{order.clientName}</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
            </Link>
            {(client?.phone || client?.email) && (
              <div className="mt-2 space-y-1">
                {client?.phone && (
                  <a href={`tel:${client.phone.replace(/\D/g, "")}`} className="flex items-center gap-2 h-9 max-md:h-11 text-sm text-primary hover:underline underline-offset-4">
                    <Phone className="w-4 h-4" aria-hidden="true" />
                    {client.phone}
                  </a>
                )}
                {client?.email && (
                  <a href={`mailto:${client.email}`} className="flex items-center gap-2 h-9 max-md:h-11 text-sm text-primary hover:underline underline-offset-4 truncate">
                    <Mail className="w-4 h-4" aria-hidden="true" />
                    {client.email}
                  </a>
                )}
              </div>
            )}
          </Section>

        </div>

        {/* Ação destrutiva sozinha no fim, longe das ações do dia a dia */}
        <section className="lg:col-span-2 pt-4 border-t border-border flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          {cancelStep && <div className="lg:hidden">{cancelStep}</div>}
          <ConfirmButton
            label="Excluir OS"
            tone="danger"
            title={`Excluir a OS ${number}?`}
            description="A OS, seus itens e os pagamentos registrados para ela são apagados de vez. Isso não pode ser desfeito."
            confirmLabel="Excluir de vez"
            onConfirm={handleDelete}
          />
        </section>
      </div>

      {/* Celular: próximo passo fixo na zona do polegar */}
      {(flow.next || flow.others.length > 0) && (
        <div className="lg:hidden fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-40 bg-card border-t border-border px-4 py-3">
          <div className="max-w-lg mx-auto flex gap-2 [&>*]:flex-1">
            {otherSteps}
            {nextStep}
          </div>
        </div>
      )}
      <div className="lg:hidden h-20" aria-hidden="true" />
    </div>
  );
}

function ConfirmButton({
  label,
  tone,
  title,
  description,
  confirmLabel,
  onConfirm,
}: {
  label: string;
  tone: "quiet" | "danger";
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => void;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          className={
            tone === "danger"
              ? "h-10 justify-start sm:justify-center text-destructive hover:text-destructive hover:bg-destructive/10"
              : "h-10 justify-start sm:justify-center text-muted-foreground"
          }
        >
          {label}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Voltar</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
