import { useState } from "react";
import { TopNav } from "@/components/layout/TopNav";
import { DesktopHeader } from "@/components/layout/DesktopHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import {
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  Plus,
  Calendar,
  User,
  Trash2
} from "lucide-react";

import { useTransactions } from "@/hooks/useTransactions";
import { formatCurrency, formatOrderNumber } from "@/lib/formatters";
import { OrderCombobox } from "@/components/form/OrderCombobox";
import { useOrders } from "@/hooks/useOrders";
import { DatePicker } from "@/components/form/DatePicker";

export default function FinancialPage() {
  const { transactions: payments, createTransaction, deleteTransaction } = useTransactions();
  const { orders } = useOrders();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split("T")[0]);

  const totalRevenue = payments?.reduce((acc, p) => acc + p.amount, 0) || 0;
  const receivedRevenue = payments?.filter(p => p.type === "received").reduce((acc, p) => acc + p.amount, 0) || 0;
  const pendingRevenue = payments?.filter(p => p.type === "pending").reduce((acc, p) => acc + p.amount, 0) || 0;

  const [errors, setErrors] = useState<Record<string, string>>({});

  // OS que ainda podem receber pagamento, e quanto cada uma já recebeu.
  const payableOrders = (orders ?? []).filter((o) => o.status !== "cancelled");
  const selectedOrderData = orders?.find((o) => o.id === selectedOrder);
  const receivedFor = (orderId: string) =>
    (payments ?? []).filter((p) => p.orderId === orderId && p.type === "received").reduce((acc, p) => acc + p.amount, 0);

  const validateField = (field: string, value: string) => {
    let error = "";
    if (!value) {
      error = "Campo obrigatório";
    }
    if (field === "amount" && value) {
      const val = parseFloat(value);
      if (isNaN(val) || val <= 0) {
        error = "Valor deve ser maior que zero";
      }
    }
    setErrors((prev) => ({ ...prev, [field]: error }));
    return !error;
  };

  const handleBlur = (field: string, value: string) => {
    validateField(field, value);
  };

  const handleAddPayment = async () => {
    const isOrderValid = validateField("selectedOrder", selectedOrder);
    const isAmountValid = validateField("amount", amount);
    const isDateValid = validateField("paymentDate", paymentDate);

    if (!isOrderValid || !isAmountValid || !isDateValid) {
      toast({
        title: "Campos inválidos",
        description: "Por favor, preencha todos os campos corretamente.",
        variant: "destructive",
      });
      return;
    }

    const order = orders?.find(o => o.id === selectedOrder);
    if (!order) return;

    try {
      await createTransaction.mutateAsync({
        orderId: selectedOrder,
        amount: parseFloat(amount),
        date: paymentDate,
        type: "received",
      });

      setIsDialogOpen(false);
      setSelectedOrder("");
      setAmount("");
      setPaymentDate(new Date().toISOString().split("T")[0]);

      toast({
        title: "Pagamento registrado!",
        description: `R$ ${parseFloat(amount).toLocaleString("pt-BR", { minimumFractionDigits: 2 })} recebido.`,
      });
    } catch (error: any) {
      toast({
        title: "Erro ao registrar",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeletePayment = async (id: string) => {
    if (!window.confirm("Tem certeza que deseja excluir este pagamento?")) return;

    try {
      await deleteTransaction.mutateAsync(id);
      toast({
        title: "Pagamento excluído",
        description: "O pagamento foi removido com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao excluir",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("pt-BR");
  };

  return (
    <div className="page-container bg-background">
      {/* Mobile Header */}
      <div className="lg:hidden">
        <TopNav title="Financeiro" showBack />
      </div>

      {/* Desktop Header */}
      <div className="hidden lg:block">
        <DesktopHeader title="Financeiro" />
      </div>

      <div className="content-container">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <div className="card-elevated p-4 animate-fade-in">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-primary" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Receita Total</p>
            <p className="text-lg font-bold text-foreground">
              R$ {totalRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
          </div>

          <div className="card-elevated p-4 animate-fade-in" style={{ animationDelay: "0.05s" }}>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-status-finished-bg flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-status-finished-fg" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Recebido</p>
            <p className="text-lg font-bold text-status-finished-fg">
              R$ {receivedRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
          </div>

          <div className="card-elevated p-4 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-status-waiting-bg flex items-center justify-center">
                <Clock className="w-4 h-4 text-status-waiting-fg" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Pendente</p>
            <p className="text-lg font-bold text-status-waiting-fg">
              R$ {pendingRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
          </div>

          <div className="card-elevated p-4 animate-fade-in" style={{ animationDelay: "0.15s" }}>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-status-progress-bg flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-status-progress-fg" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Total Pago</p>
            <p className="text-lg font-bold text-foreground">
              R$ {receivedRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        <div className="mt-6">
          {/* Payment History */}
          <div className="card-elevated animate-slide-up">
            <div className="p-4 border-b border-border/50 flex items-center justify-between">
              <h2 className="font-semibold text-foreground">Histórico de Pagamentos</h2>

              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="btn-primary">
                    <Plus className="w-4 h-4 mr-2" />
                    Registrar Pagamento
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Registrar Pagamento</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
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
                      {errors.selectedOrder && <p role="alert" className="text-xs font-medium text-destructive">{errors.selectedOrder}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="payment-amount">Valor Recebido (R$)</Label>
                      <Input
                        id="payment-amount"
                        aria-invalid={!!errors.amount} aria-describedby={errors.amount ? "amount-error" : undefined}
                        type="number"
                        step="0.01"
                        placeholder="0,00"
                        value={amount}
                        onChange={(e) => {
                            setAmount(e.target.value);
                            if (errors.amount) validateField("amount", e.target.value);
                        }}
                        onBlur={() => handleBlur("amount", amount)}
                        className={errors.amount ? "border-destructive focus-visible:ring-destructive" : ""}
                      />
                      {errors.amount && <p id="amount-error" role="alert" className="text-xs font-semibold text-destructive animate-fade-in">{errors.amount}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="payment-date">Data do pagamento</Label>
                      <DatePicker
                        id="payment-date" aria-describedby={errors.paymentDate ? "paymentDate-error" : undefined}
                        value={paymentDate}
                        invalid={!!errors.paymentDate}
                        onChange={(next) => {
                            setPaymentDate(next);
                            if (errors.paymentDate) validateField("paymentDate", next);
                        }}
                      />
                      {errors.paymentDate && <p id="paymentDate-error" role="alert" className="text-xs font-semibold text-destructive animate-fade-in">{errors.paymentDate}</p>}
                    </div>

                    <Button onClick={handleAddPayment} className="w-full btn-primary" disabled={createTransaction.isPending}>
                      {createTransaction.isPending ? "Salvando..." : "Confirmar Pagamento"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="divide-y divide-border/50">
              {!payments || payments.length === 0 ? (
                <div className="p-8 text-center">
                  <DollarSign className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground">Nenhum pagamento registrado</p>
                </div>
              ) : (
                payments.map((payment) => (
                  <div key={payment.id} className="p-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`hidden sm:flex w-10 h-10 shrink-0 rounded-full items-center justify-center ${payment.type === "received" ? "bg-status-finished-bg" : "bg-status-waiting-bg"
                        }`}>
                        <User className={`w-5 h-5 ${payment.type === "received" ? "text-status-finished-fg" : "text-status-waiting-fg"
                          }`} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{payment.clientName}</p>
                        <div className="flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
                          <span className="whitespace-nowrap">Ordem {formatOrderNumber({ id: payment.orderId, number: payment.orderNumber })}</span>
                          <span className="flex items-center gap-1 whitespace-nowrap tabular">
                            <Calendar className="w-3 h-3" aria-hidden="true" />
                            {formatDate(payment.date)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 sm:gap-4 shrink-0">
                      <div className="text-right">
                        <p className={`font-bold whitespace-nowrap tabular ${payment.type === "received" ? "text-status-finished-fg" : "text-status-waiting-fg"
                          }`}>
                          {formatCurrency(payment.amount)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {payment.type === "received" ? "Recebido" : "Pendente"}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="shrink-0 text-muted-foreground hover:text-destructive"
                        aria-label={`Excluir pagamento de ${payment.clientName}`}
                        onClick={() => handleDeletePayment(payment.id)}
                        disabled={deleteTransaction.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
