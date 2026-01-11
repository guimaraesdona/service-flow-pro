import { useState } from "react";
import { TopNav } from "@/components/layout/TopNav";
import { DesktopHeader } from "@/components/layout/DesktopHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import {
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  Plus,
  Calendar,
  User
} from "lucide-react";

interface Payment {
  id: string;
  orderId: string;
  clientName: string;
  amount: number;
  date: string;
  type: "received" | "pending";
}

const mockPayments: Payment[] = [
  { id: "1", orderId: "003", clientName: "Ana Oliveira", amount: 180.0, date: "2025-01-03", type: "received" },
  { id: "2", orderId: "001", clientName: "Maria Silva", amount: 150.0, date: "2025-01-05", type: "pending" },
  { id: "3", orderId: "002", clientName: "João Santos", amount: 600.0, date: "2025-01-04", type: "pending" },
  { id: "4", orderId: "004", clientName: "Carlos Mendes", amount: 240.0, date: "2025-01-02", type: "received" },
];

const mockOrders = [
  { id: "001", clientName: "Maria Silva", total: 150.0 },
  { id: "002", clientName: "João Santos", total: 600.0 },
  { id: "003", clientName: "Ana Oliveira", total: 180.0 },
  { id: "004", clientName: "Carlos Mendes", total: 240.0 },
  { id: "005", clientName: "Paula Costa", total: 350.0 },
];

export default function FinancialPage() {
  const [payments, setPayments] = useState<Payment[]>(mockPayments);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState("");

  const totalRevenue = payments.reduce((acc, p) => acc + p.amount, 0);
  const receivedRevenue = payments.filter(p => p.type === "received").reduce((acc, p) => acc + p.amount, 0);
  const pendingRevenue = payments.filter(p => p.type === "pending").reduce((acc, p) => acc + p.amount, 0);

  const handleAddPayment = () => {
    if (!selectedOrder || !amount || !paymentDate) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos.",
        variant: "destructive",
      });
      return;
    }

    const order = mockOrders.find(o => o.id === selectedOrder);
    if (!order) return;

    const newPayment: Payment = {
      id: Date.now().toString(),
      orderId: selectedOrder,
      clientName: order.clientName,
      amount: parseFloat(amount),
      date: paymentDate,
      type: "received",
    };

    setPayments([newPayment, ...payments]);
    setIsDialogOpen(false);
    setSelectedOrder("");
    setAmount("");
    setPaymentDate("");

    toast({
      title: "Pagamento registrado!",
      description: `R$ ${parseFloat(amount).toLocaleString("pt-BR", { minimumFractionDigits: 2 })} recebido.`,
    });
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
              <div className="w-8 h-8 rounded-lg bg-status-finished/20 flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-status-finished" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Recebido</p>
            <p className="text-lg font-bold text-status-finished">
              R$ {receivedRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
          </div>

          <div className="card-elevated p-4 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-status-waiting/20 flex items-center justify-center">
                <Clock className="w-4 h-4 text-status-waiting" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Pendente</p>
            <p className="text-lg font-bold text-status-waiting">
              R$ {pendingRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
          </div>

          <div className="card-elevated p-4 animate-fade-in" style={{ animationDelay: "0.15s" }}>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-status-progress/20 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-status-progress" />
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
              <h3 className="font-semibold text-foreground">Histórico de Pagamentos</h3>

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
                      <Label>Ordem de Serviço</Label>
                      <Select value={selectedOrder} onValueChange={setSelectedOrder}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma ordem" />
                        </SelectTrigger>
                        <SelectContent>
                          {mockOrders.map((order) => (
                            <SelectItem key={order.id} value={order.id}>
                              #{order.id} - {order.clientName} (R$ {order.total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Valor Recebido (R$)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0,00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Data do Pagamento</Label>
                      <Input
                        type="date"
                        value={paymentDate}
                        onChange={(e) => setPaymentDate(e.target.value)}
                      />
                    </div>

                    <Button onClick={handleAddPayment} className="w-full btn-primary">
                      Confirmar Pagamento
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="divide-y divide-border/50">
              {payments.length === 0 ? (
                <div className="p-8 text-center">
                  <DollarSign className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground">Nenhum pagamento registrado</p>
                </div>
              ) : (
                payments.map((payment) => (
                  <div key={payment.id} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${payment.type === "received" ? "bg-status-finished/20" : "bg-status-waiting/20"
                        }`}>
                        <User className={`w-5 h-5 ${payment.type === "received" ? "text-status-finished" : "text-status-waiting"
                          }`} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{payment.clientName}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>Ordem #{payment.orderId}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(payment.date)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${payment.type === "received" ? "text-status-finished" : "text-status-waiting"
                        }`}>
                        R$ {payment.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {payment.type === "received" ? "Recebido" : "Pendente"}
                      </p>
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
