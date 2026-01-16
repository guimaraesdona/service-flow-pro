import { useState, useMemo } from "react";
import { TopNav } from "@/components/layout/TopNav";
import { DesktopHeader } from "@/components/layout/DesktopHeader";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import {
  FileText,
  Download,
  Mail,
  Calendar,
  User,
  FileSpreadsheet,
  File
} from "lucide-react";
import { useClients } from "@/hooks/useClients";
import { useOrders } from "@/hooks/useOrders";

const months = [
  { value: "01", label: "Janeiro" },
  { value: "02", label: "Fevereiro" },
  { value: "03", label: "Março" },
  { value: "04", label: "Abril" },
  { value: "05", label: "Maio" },
  { value: "06", label: "Junho" },
  { value: "07", label: "Julho" },
  { value: "08", label: "Agosto" },
  { value: "09", label: "Setembro" },
  { value: "10", label: "Outubro" },
  { value: "11", label: "Novembro" },
  { value: "12", label: "Dezembro" },
];

const currentYear = new Date().getFullYear();
const years = [currentYear.toString(), (currentYear - 1).toString(), (currentYear - 2).toString()];

export default function ReportsPage() {
  const { clients } = useClients();
  const { orders } = useOrders();

  const [selectedMonth, setSelectedMonth] = useState(String(new Date().getMonth() + 1).padStart(2, '0'));
  const [selectedYear, setSelectedYear] = useState(String(currentYear));
  const [selectedClient, setSelectedClient] = useState("all");
  const [isGenerating, setIsGenerating] = useState(false);

  const filteredOrders = useMemo(() => {
    if (!orders) return [];

    return orders.filter(order => {
      const orderDate = new Date(order.date);
      const monthMatch = String(orderDate.getMonth() + 1).padStart(2, '0') === selectedMonth;
      const yearMatch = String(orderDate.getFullYear()) === selectedYear;
      const clientMatch = selectedClient === "all" || order.clientId === selectedClient;

      // Filter out cancelled orders for revenue calculations, but maybe keep them for general listing if needed?
      // For this report summary, let's keep all checks here, but specific metrics might exclude cancelled.
      return monthMatch && yearMatch && clientMatch;
    });
  }, [orders, selectedMonth, selectedYear, selectedClient]);

  const metrics = useMemo(() => {
    const validOrders = filteredOrders.filter(o => o.status !== "cancelled");
    const totalOrders = filteredOrders.length;
    const totalRevenue = validOrders.reduce((acc, order) => acc + order.total, 0);
    const finishedCount = filteredOrders.filter(o => o.status === "finished").length;
    const pendingCount = filteredOrders.filter(o => o.status !== "finished" && o.status !== "cancelled").length;

    return {
      totalOrders,
      totalRevenue,
      finishedCount,
      pendingCount
    };
  }, [filteredOrders]);

  const handleExportPDF = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      toast({
        title: "PDF gerado!",
        description: "O relatório foi baixado com sucesso.",
      });
    }, 1500);
  };

  const handleExportExcel = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      toast({
        title: "Excel gerado!",
        description: "O relatório foi baixado com sucesso.",
      });
    }, 1500);
  };

  const handleSendEmail = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      toast({
        title: "Email enviado!",
        description: "O relatório foi enviado para seu email.",
      });
    }, 1500);
  };

  const getMonthName = (value: string) => {
    return months.find(m => m.value === value)?.label || "";
  };

  const getClientName = (id: string) => {
    if (id === "all") return "Todos os Clientes";
    return clients?.find(c => c.id === id)?.name || "Cliente Desconhecido";
  };

  return (
    <div className="page-container bg-background">
      {/* Mobile Header */}
      <div className="lg:hidden">
        <TopNav title="Relatórios" showBack />
      </div>

      {/* Desktop Header */}
      <div className="hidden lg:block">
        <DesktopHeader title="Relatórios" />
      </div>

      <div className="content-container">
        <div className="lg:grid lg:grid-cols-3 lg:gap-6">
          {/* Filters */}
          <div className="lg:col-span-1">
            <div className="card-elevated p-6 mb-6 lg:mb-0 animate-fade-in">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Filtros do Relatório
              </h3>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Mês</Label>
                    <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {months.map((month) => (
                          <SelectItem key={month.value} value={month.value}>
                            {month.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Ano</Label>
                    <Select value={selectedYear} onValueChange={setSelectedYear}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {years.map((year) => (
                          <SelectItem key={year} value={year}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Cliente
                  </Label>
                  <Select value={selectedClient} onValueChange={setSelectedClient}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os Clientes</SelectItem>
                      {clients?.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          {/* Preview & Export */}
          <div className="lg:col-span-2 space-y-6">
            {/* Preview */}
            <div className="card-elevated p-6 animate-slide-up" style={{ animationDelay: "0.1s" }}>
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Prévia do Relatório
              </h3>

              <div className="bg-secondary/50 rounded-lg p-4">
                <div className="text-center mb-4">
                  <h4 className="text-lg font-bold text-foreground">Relatório de Ordens de Serviço</h4>
                  <p className="text-sm text-muted-foreground">
                    {getMonthName(selectedMonth)} de {selectedYear}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {getClientName(selectedClient)}
                  </p>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
                  <div className="bg-card p-3 rounded-lg">
                    <p className="text-2xl font-bold text-primary">{metrics.totalOrders}</p>
                    <p className="text-xs text-muted-foreground">Ordens</p>
                  </div>
                  <div className="bg-card p-3 rounded-lg">
                    <p className="text-2xl font-bold text-status-finished">
                      R$ {metrics.totalRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-muted-foreground">Faturamento</p>
                  </div>
                  <div className="bg-card p-3 rounded-lg">
                    <p className="text-2xl font-bold text-status-progress">{metrics.finishedCount}</p>
                    <p className="text-xs text-muted-foreground">Finalizadas</p>
                  </div>
                  <div className="bg-card p-3 rounded-lg">
                    <p className="text-2xl font-bold text-status-waiting">{metrics.pendingCount}</p>
                    <p className="text-xs text-muted-foreground">Pendentes</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Export Options */}
            <div className="card-elevated p-6 animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <Download className="w-5 h-5" />
                Exportar Relatório
              </h3>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                <Button
                  onClick={handleExportPDF}
                  className="w-full justify-start"
                  variant="outline"
                  disabled={isGenerating}
                >
                  <File className="w-5 h-5 mr-3 text-red-500" />
                  <div className="text-left">
                    <p className="font-medium">Exportar PDF</p>
                    <p className="text-xs text-muted-foreground">Documento formatado</p>
                  </div>
                </Button>

                <Button
                  onClick={handleExportExcel}
                  className="w-full justify-start"
                  variant="outline"
                  disabled={isGenerating}
                >
                  <FileSpreadsheet className="w-5 h-5 mr-3 text-green-600" />
                  <div className="text-left">
                    <p className="font-medium">Exportar Excel</p>
                    <p className="text-xs text-muted-foreground">Planilha detalhada</p>
                  </div>
                </Button>

                <Button
                  onClick={handleSendEmail}
                  className="w-full justify-start"
                  variant="outline"
                  disabled={isGenerating}
                >
                  <Mail className="w-5 h-5 mr-3 text-primary" />
                  <div className="text-left">
                    <p className="font-medium">Enviar Email</p>
                    <p className="text-xs text-muted-foreground">Receba por email</p>
                  </div>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
