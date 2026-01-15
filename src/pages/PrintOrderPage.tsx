import { useRef, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import { TopNav } from "@/components/layout/TopNav";
import { DesktopHeader } from "@/components/layout/DesktopHeader";
import { Button } from "@/components/ui/button";
import { Printer, ArrowLeft } from "lucide-react";
import { ServiceOrderPrint } from "@/components/print/ServiceOrderPrint";
import { useOrders } from "@/hooks/useOrders";

export default function PrintOrderPage() {
  const { id } = useParams();
  const componentRef = useRef<HTMLDivElement>(null);
  const { orders, isLoading } = useOrders();

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
  });

  // Enable/disable styles for print
  useEffect(() => {
    // Force background graphics for printing
    const style = document.createElement('style');
    style.innerHTML = `
      @media print {
        body {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
          background-color: white !important;
          height: auto !important;
          overflow: visible !important;
        }
        @page {
          margin: 0;
          size: auto;
        }
        html, #root, .page-container {
          height: auto !important;
          background-color: white !important;
        }
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const order = orders?.find(o => o.id === id);

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="page-container bg-background">
        <TopNav title="Imprimir Ordem" showBack />
        <div className="content-container">
          <div className="text-center py-16">
            <p className="text-muted-foreground">Ordem não encontrada</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container bg-background print:h-auto print:overflow-visible flex flex-col h-screen">
      <div className="print:hidden flex-none">
        {/* Mobile Header */}
        <div className="lg:hidden">
          <TopNav
            title="Visualização de Impressão"
            showBack
            rightAction={
              <Button onClick={() => handlePrint()} size="icon" variant="ghost">
                <Printer className="w-5 h-5 text-primary" />
              </Button>
            }
          />
        </div>

        {/* Desktop Header */}
        <div className="hidden lg:block">
          <DesktopHeader
            title="Visualização de Impressão"
            actions={
              <div className="flex gap-2">
                <Link to={`/ordens/${id}`}>
                  <Button variant="ghost">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Voltar
                  </Button>
                </Link>
                <Button onClick={() => handlePrint()} className="btn-primary">
                  <Printer className="w-4 h-4 mr-2" />
                  Imprimir
                </Button>
              </div>
            }
          />
        </div>
      </div>

      <div className="flex-1 flex justify-center p-4 bg-secondary/30 overflow-auto print:p-0 print:bg-white print:overflow-visible print:block dark:bg-black/20">
        <div className="w-full max-w-[800px] print:w-full print:max-w-none print:h-auto animate-fade-in print:animate-none">
          <div className="shadow-lg print:shadow-none bg-white min-h-[500px] print:min-h-0">
            <ServiceOrderPrint ref={componentRef} order={order} />
          </div>

          <div className="mt-8 text-center print:hidden pb-8">
            <p className="text-muted-foreground text-sm mb-4">
              Verifique se a visualização está correta antes de imprimir.
            </p>
            <Button onClick={() => handlePrint()} className="btn-primary w-full md:w-auto md:min-w-[200px]">
              <Printer className="w-4 h-4 mr-2" />
              Confirmar Impressão
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
