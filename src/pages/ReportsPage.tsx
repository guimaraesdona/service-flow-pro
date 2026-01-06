import { useState } from "react";
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

const years = ["2025", "2024", "2023"];

const clients = [
  { id: "all", name: "Todos os Clientes" },
  { id: "1", name: "Maria Silva" },
  { id: "2", name: "João Santos" },
  { id: "3", name: "Ana Oliveira" },
  { id: "4", name: "Carlos Mendes" },
  { id: "5", name: "Paula Costa" },
];

export default function ReportsPage() {
  const [selectedMonth, setSelectedMonth] = useState("01");
  const [selectedYear, setSelectedYear] = useState("2025");
  const [selectedClient, setSelectedClient] = useState("all");
  const [isGenerating, setIsGenerating] = useState(false);

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
    return clients.find(c => c.id === id)?.name || "";
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

      <div className="content-container lg:max-w-2xl">
        {/* Filters */}
        <div className="card-elevated p-6 mb-6 animate-fade-in">
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
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="card-elevated p-6 mb-6 animate-slide-up" style={{ animationDelay: "0.1s" }}>
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

            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-card p-3 rounded-lg">
                <p className="text-2xl font-bold text-primary">12</p>
                <p className="text-xs text-muted-foreground">Ordens</p>
              </div>
              <div className="bg-card p-3 rounded-lg">
                <p className="text-2xl font-bold text-status-finished">R$ 3.420</p>
                <p className="text-xs text-muted-foreground">Faturamento</p>
              </div>
              <div className="bg-card p-3 rounded-lg">
                <p className="text-2xl font-bold text-status-progress">8</p>
                <p className="text-xs text-muted-foreground">Finalizadas</p>
              </div>
              <div className="bg-card p-3 rounded-lg">
                <p className="text-2xl font-bold text-status-waiting">4</p>
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

          <div className="space-y-3">
            <Button
              onClick={handleExportPDF}
              className="w-full justify-start"
              variant="outline"
              disabled={isGenerating}
            >
              <File className="w-5 h-5 mr-3 text-red-500" />
              <div className="text-left">
                <p className="font-medium">Exportar PDF</p>
                <p className="text-xs text-muted-foreground">Documento formatado para impressão</p>
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
                <p className="text-xs text-muted-foreground">Planilha com dados detalhados</p>
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
                <p className="font-medium">Enviar por Email</p>
                <p className="text-xs text-muted-foreground">Receba o relatório no seu email</p>
              </div>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
