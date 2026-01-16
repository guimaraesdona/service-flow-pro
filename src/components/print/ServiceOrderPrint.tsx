import { forwardRef } from "react";
import { ServiceOrder } from "@/types";
import { Receipt, Smartphone } from "lucide-react";

interface ServiceOrderPrintProps {
    order: ServiceOrder;
}

export const ServiceOrderPrint = forwardRef<HTMLDivElement, ServiceOrderPrintProps>(({ order }, ref) => {
    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const formatCurrency = (value: number) => {
        return value.toLocaleString("pt-BR", { minimumFractionDigits: 2 });
    };

    return (
        <div ref={ref} className="w-[80mm] bg-white text-black p-4 font-mono text-base leading-tight mx-auto shadow-sm print:shadow-none print:w-full print:mx-0 print:p-0" style={{ printColorAdjust: "exact", WebkitPrintColorAdjust: "exact" }}>
            {/* Header */}
            <div className="text-center border-b-2 border-black pb-4 mb-4">
                <div className="flex justify-center mb-2">
                    <div className="w-12 h-12 bg-black text-white rounded-lg flex items-center justify-center">
                        <Receipt className="w-6 h-6" />
                    </div>
                </div>
                <h1 className="font-extrabold text-xl uppercase">Lava Jato Jardim América LTDA</h1>
                {/* <p className="text-sm font-bold">Soluções Rápidas e Eficientes</p> */}
                <div className="flex items-center justify-center gap-1 mt-2 text-sm font-bold">
                    <Smartphone className="w-4 h-4" />
                    <span>(34) 3213-5001</span>
                </div>
                {/* <div className="flex items-center justify-center gap-1 text-sm font-bold">
                    <Globe className="w-4 h-4" />
                    <span>www.serviceflow.pro</span>
                </div> */}
            </div>

            {/* Order Info */}
            <div className="mb-4 text-sm font-semibold">
                <div className="flex justify-between">
                    <span className="font-extrabold">ORDEM:</span>
                    <span className="font-bold text-lg">#{order.id}</span>
                </div>
                <div className="flex justify-between">
                    <span className="font-bold">DATA:</span>
                    <span>{formatDate(order.date)}</span>
                </div>
                <div className="mt-2 border-t-2 border-dashed border-black pt-2">
                    <span className="font-extrabold">CLIENTE:</span>
                    <p className="truncate font-bold text-lg">{order.clientName}</p>
                </div>
                {order.description && (
                    <div className="mt-2 text-sm text-black">
                        <span className="font-extrabold text-black">DESCRIÇÃO:</span>
                        <p className="font-medium">{order.description}</p>
                    </div>
                )}
            </div>

            {/* Services */}
            <div className="mb-4">
                <div className="border-b-2 border-black font-extrabold mb-2 pb-1 flex justify-between text-base">
                    <span>ITEM</span>
                    <span>TOTAL</span>
                </div>
                <div className="space-y-2">
                    {order.services.map((service, index) => (
                        <div key={index}>
                            <div className="font-bold text-base">{service.name}</div>
                            <div className="flex justify-between text-sm font-semibold">
                                <span>{service.quantity} x R$ {formatCurrency(service.price)}</span>
                                <span>R$ {formatCurrency(service.quantity * service.price)}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Totals */}
            <div className="border-t-2 border-black pt-2 mb-6">
                <div className="flex justify-between font-extrabold text-xl">
                    <span>TOTAL</span>
                    <span>R$ {formatCurrency(order.total)}</span>
                </div>
                {order.discount && order.discount > 0 && (
                    <div className="flex justify-between text-sm font-bold mt-1">
                        <span>Desconto</span>
                        <span>- R$ {formatCurrency(order.discount)}</span>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="text-center text-sm font-bold border-t-2 border-dashed border-black pt-4">
                <p className="font-extrabold mb-2 text-base">AGRADECEMOS A PREFERÊNCIA!</p>
                <p>Este documento não possui valor fiscal.</p>
                <div className="mt-8 border-t-2 border-black pt-2 w-3/4 mx-auto">
                    <p className="text-xs font-bold text-gray-600">ASSINATURA DO CLIENTE</p>
                </div>
            </div>
        </div>
    );
});

ServiceOrderPrint.displayName = "ServiceOrderPrint";
