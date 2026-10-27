import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DollarSign, MoreVertical, Plus, Trash2, ClipboardList } from "lucide-react";
import { TopNav } from "@/components/layout/TopNav";
import { DesktopHeader } from "@/components/layout/DesktopHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { useTransactions } from "@/hooks/useTransactions";
import { useOrders } from "@/hooks/useOrders";
import { formatCurrency, formatOrderNumber } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { OrderCombobox } from "@/components/form/OrderCombobox";
import { DatePicker } from "@/components/form/DatePicker";
import { Transaction } from "@/types";

type Filter = "all" | "received" | "pending";

const FILTER_LABEL: Record<Filter, string> = { all: "Todos", received: "Recebidos", pending: "Pendentes" };

// Data local de hoje; toISOString() daria o dia seguinte depois das 21h no Brasil.
const today = () => format(new Date(), "yyyy-MM-dd");

const errorMessage = (error: unknown) => (error instanceof Error ? error.message : undefined);

const sum = (list: Transaction[]) => list.reduce((acc, p) => acc + p.amount, 0);

function PaymentDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { transactions: payments, createTransaction } = useTransactions();
  const { orders } = useOrders();

  const [selectedOrder, setSelectedOrder] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState(today);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // OS que ainda podem receber pagamento, e quanto cada uma já recebeu.
  const payableOrders = (orders ?? []).filter((o) => o.status !== "cancelled");
  const selectedOrderData = orders?.find((o) => o.id === selectedOrder);
  const receivedFor = (orderId: string) =>
    sum((payments ?? []).filter((p) => p.orderId === orderId && p.type === "received"));

  const validateField = (field: string, value: string) => {
    let error = "";
    if (!value) {
      error = "Campo obrigatório";
    } else if (field === "amount") {
      const val = parseFloat(value);
      if (isNaN(val) || val <= 0) error = "Valor deve ser maior que zero";
    }
    setErrors((prev) => ({ ...prev, [field]: error }));
    return !error;
  };

  const reset = () => {
    setSelectedOrder("");
    setAmount("");
    setPaymentDate(today());
    setErrors({});
  };

  const handleAddPayment = async () => {
    const valid = [
      validateField("selectedOrder", selectedOrder),
      validateField("amount", amount),
      validateField("paymentDate", paymentDate),
    ].every(Boolean);
    if (!valid) return;

    try {
      await createTransaction.mutateAsync({
        orderId: selectedOrder,
        amount: parseFloat(amount),
        date: paymentDate,
        type: "received",
      });
      toast({ title: "Pagamento registrado", description: `${formatCurrency(parseFloat(amount))} recebido.` });
      reset();
      onOpenChange(false);
    } catch (error) {
      toast({ title: "Erro ao registrar", description: errorMessage(error), variant: "destructive" });
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar pagamento</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="payment-order">Ordem de serviço</Label>
            <OrderCombobox
              id="payment-order"
              orders={payableOrders}
              value={selectedOrder}
              invalid={!!errors.selectedOrder}
              onChange={(val) => {
                setSelectedOrder(val);
                if (errors.selectedOrder) validateField("selectedOrder", val);
                // Sugere o que falta receber, sem sobrescrever um valor já digitado.
                const order = orders?.find((o) => o.id === val);
                if (order && !amount) {
                  const remaining = order.total - receivedFor(val);
                  if (remaining > 0) setAmount(remaining.toFixed(2));
                }
              }}
            />
            {selectedOrderData && (
              <p className="text-xs text-muted-foreground tabular">
                Recebido {formatCurrency(receivedFor(selectedOrderData.id))} de {formatCurrency(selectedOrderData.total)}
                {selectedOrderData.total - receivedFor(selectedOrderData.id) > 0 &&
                  ` · faltam ${formatCurrency(selectedOrderData.total - receivedFor(selectedOrderData.id))}`}
              </p>
            )}
            {errors.selectedOrder && <p role="alert" className="text-xs font-semibold text-destructive">{errors.selectedOrder}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="payment-amount">Valor (R$)</Label>
              <Input
                id="payment-amount"
                aria-invalid={!!errors.amount}
                aria-describedby={errors.amount ? "amount-error" : undefined}
                type="number"
                inputMode="decimal"
                step="0.01"
                placeholder="0,00"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  if (errors.amount) validateField("amount", e.target.value);
                }}
                onBlur={() => validateField("amount", amount)}
                className={cn("input-field tabular", errors.amount && "border-destructive focus-visible:ring-destructive")}
              />
              {errors.amount && <p id="amount-error" role="alert" className="text-xs font-semibold text-destructive">{errors.amount}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment-date">Data</Label>
              <DatePicker
                id="payment-date"
                aria-describedby={errors.paymentDate ? "paymentDate-error" : undefined}
                value={paymentDate}
                invalid={!!errors.paymentDate}
                onChange={(next) => {
                  setPaymentDate(next);
                  if (errors.paymentDate) validateField("paymentDate", next);
                }}
              />
              {errors.paymentDate && <p id="paymentDate-error" role="alert" className="text-xs font-semibold text-destructive">{errors.paymentDate}</p>}
            </div>
          </div>

          <Button onClick={handleAddPayment} className="w-full btn-primary" disabled={createTransaction.isPending}>
            {createTransaction.isPending ? "Salvando..." : "Confirmar pagamento"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function PaymentMenu({ payment, onDelete }: { payment: Transaction; onDelete: (payment: Transaction) => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="shrink-0 text-muted-foreground" aria-label={`Ações do pagamento de ${payment.clientName}`}>
          <MoreVertical className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link to={`/ordens/${payment.orderId}`}>
            <ClipboardList className="w-4 h-4 mr-2" />
            Abrir OS
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem className="text-destructive focus:text-destructive" onSelect={() => onDelete(payment)}>
          <Trash2 className="w-4 h-4 mr-2" />
          Excluir pagamento
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function PendingBadge() {
  return <span className="status-badge bg-status-waiting-bg text-status-waiting-fg">Pendente</span>;
}

export default function FinancialPage() {
  const { transactions: payments, isLoading, deleteTransaction } = useTransactions();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");
  const [toDelete, setToDelete] = useState<Transaction | null>(null);

  const all = payments ?? [];
  const received = sum(all.filter((p) => p.type === "received"));
  const pending = sum(all.filter((p) => p.type === "pending"));
  const counts: Record<Filter, number> = {
    all: all.length,
    received: all.filter((p) => p.type === "received").length,
    pending: all.filter((p) => p.type === "pending").length,
  };

  // Mais recentes primeiro, agrupados por mês com o subtotal de cada um.
  const months = useMemo(() => {
    const visible = (payments ?? [])
      .filter((p) => filter === "all" || p.type === filter)
      .sort((a, b) => b.date.localeCompare(a.date));
    const groups = new Map<string, Transaction[]>();
    for (const p of visible) {
      const key = p.date.slice(0, 7);
      groups.set(key, [...(groups.get(key) ?? []), p]);
    }
    return [...groups].map(([key, items]) => ({
      key,
      label: format(parseISO(`${key}-01`), "MMMM 'de' yyyy", { locale: ptBR }),
      total: sum(items),
      items,
    }));
  }, [payments, filter]);

  const confirmDelete = async () => {
    if (!toDelete) return;
    try {
      await deleteTransaction.mutateAsync(toDelete.id);
      toast({ title: "Pagamento excluído" });
    } catch (error) {
      toast({ title: "Erro ao excluir", description: errorMessage(error), variant: "destructive" });
    } finally {
      setToDelete(null);
    }
  };

  const shortDate = (date: string) => format(parseISO(date), "dd/MM/yyyy");

  return (
    <div className="page-container bg-background">
      <div className="lg:hidden">
        <TopNav title="Financeiro" />
      </div>
      <DesktopHeader
        title="Financeiro"
        actions={
          <Button className="h-9" onClick={() => setDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-1.5" />
            Registrar pagamento
          </Button>
        }
      />

      <div className="content-container space-y-5">
        {/* Resumo */}
        <section aria-label="Resumo" className="card-elevated grid grid-cols-2 lg:grid-cols-3 divide-x divide-border">
          <div className="p-4 lg:p-5">
            <p className="text-xs font-medium text-muted-foreground">Recebido</p>
            <p className="mt-1 text-xl lg:text-2xl font-semibold tracking-tight text-status-finished-fg tabular">{formatCurrency(received)}</p>
          </div>
          <div className="p-4 lg:p-5">
            <p className="text-xs font-medium text-muted-foreground">A receber</p>
            <p className="mt-1 text-xl lg:text-2xl font-semibold tracking-tight text-status-waiting-fg tabular">{formatCurrency(pending)}</p>
          </div>
          <div className="col-span-2 lg:col-span-1 px-4 py-3 lg:p-5 border-t lg:border-t-0 border-border flex items-baseline justify-between lg:block">
            <p className="text-xs font-medium text-muted-foreground">Total lançado</p>
            <p className="text-sm lg:mt-1 lg:text-2xl font-semibold tracking-tight text-foreground tabular">{formatCurrency(received + pending)}</p>
          </div>
        </section>

        <div role="group" aria-label="Filtrar pagamentos" className="flex flex-wrap gap-1.5">
          {(Object.keys(FILTER_LABEL) as Filter[]).map((value) => {
            const active = filter === value;
            return (
              <button
                key={value}
                type="button"
                aria-pressed={active}
                onClick={() => setFilter(value)}
                className={cn(
                  "relative h-8 px-3 rounded-full text-sm font-medium whitespace-nowrap border transition-colors after:absolute after:inset-x-0 after:-inset-y-2 after:content-['']",
                  active ? "bg-foreground text-background border-foreground" : "bg-card text-muted-foreground border-border hover:text-foreground",
                )}
              >
                {FILTER_LABEL[value]}
                <span className={cn("ml-1.5 tabular", active ? "opacity-80" : "text-muted-foreground")}>{counts[value]}</span>
              </button>
            );
          })}
        </div>

        {isLoading ? (
          <div className="card-elevated divide-y divide-border">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-4 flex items-center gap-4">
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        ) : all.length === 0 ? (
          <div className="card-elevated p-10 text-center">
            <DollarSign className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" aria-hidden="true" />
            <p className="font-medium text-foreground">Nenhum pagamento registrado</p>
            <p className="text-sm text-muted-foreground mt-1">Registre o que cada cliente pagou para acompanhar o que falta receber.</p>
            <Button className="mt-4 h-10" onClick={() => setDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-1.5" />
              Registrar pagamento
            </Button>
          </div>
        ) : months.length === 0 ? (
          <div className="card-elevated p-10 text-center">
            <p className="font-medium text-foreground">Nenhum pagamento {filter === "pending" ? "pendente" : "recebido"}</p>
            <Button variant="outline" className="mt-4 h-9" onClick={() => setFilter("all")}>
              Ver todos
            </Button>
          </div>
        ) : (
          months.map((month) => (
            <section key={month.key} aria-labelledby={`month-${month.key}`} className="space-y-2">
              <div className="flex items-baseline justify-between px-1">
                <h2 id={`month-${month.key}`} className="text-sm font-semibold text-foreground first-letter:uppercase">
                  {month.label}
                </h2>
                <span className="text-sm text-muted-foreground tabular">{formatCurrency(month.total)}</span>
              </div>

              <ul className="card-elevated divide-y divide-border">
                {month.items.map((payment) => (
                  <li key={payment.id} className="flex items-center pr-1 lg:pr-2">
                    <Link
                      to={`/ordens/${payment.orderId}`}
                      className="flex-1 min-w-0 flex items-center gap-3 pl-4 py-3 lg:py-3.5 pr-2 active:bg-muted/60 lg:hover:bg-muted/40 rounded-l-lg"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{payment.clientName}</p>
                        <p className="lg:hidden text-xs text-muted-foreground tabular mt-0.5">
                          OS {formatOrderNumber({ id: payment.orderId, number: payment.orderNumber })} · {shortDate(payment.date)}
                        </p>
                      </div>
                      {/* Desktop: OS e data em colunas, para a linha não ficar só nas pontas. */}
                      <span className="hidden lg:block w-28 shrink-0 text-sm text-muted-foreground tabular">
                        OS {formatOrderNumber({ id: payment.orderId, number: payment.orderNumber })}
                      </span>
                      <span className="hidden lg:block w-28 shrink-0 text-sm text-muted-foreground tabular">{shortDate(payment.date)}</span>
                      <span className="hidden lg:block w-24 shrink-0">{payment.type === "pending" && <PendingBadge />}</span>
                      <div className="text-right shrink-0 space-y-1 lg:w-32">
                        <p
                          className={cn(
                            "text-sm font-semibold whitespace-nowrap tabular",
                            payment.type === "pending" ? "text-status-waiting-fg" : "text-foreground",
                          )}
                        >
                          {formatCurrency(payment.amount)}
                        </p>
                        {payment.type === "pending" && (
                          <span className="lg:hidden">
                            <PendingBadge />
                          </span>
                        )}
                      </div>
                    </Link>
                    <PaymentMenu payment={payment} onDelete={setToDelete} />
                  </li>
                ))}
              </ul>
            </section>
          ))
        )}
      </div>

      {/* Ação principal no alcance do polegar, como o "Nova OS". */}
      <div className="lg:hidden h-16" aria-hidden="true" />
      <Button
        onClick={() => setDialogOpen(true)}
        className="lg:hidden fixed right-4 bottom-[calc(4.75rem+env(safe-area-inset-bottom))] z-40 h-12 max-md:h-12 rounded-full px-5 shadow-elevated"
      >
        <Plus className="w-5 h-5 mr-1.5" />
        Pagamento
      </Button>

      <PaymentDialog open={dialogOpen} onOpenChange={setDialogOpen} />

      <AlertDialog open={!!toDelete} onOpenChange={(open) => !open && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir pagamento?</AlertDialogTitle>
            <AlertDialogDescription>
              {toDelete &&
                `${formatCurrency(toDelete.amount)} de ${toDelete.clientName} (OS ${formatOrderNumber({
                  id: toDelete.orderId,
                  number: toDelete.orderNumber,
                })}) sai do histórico e dos totais.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
