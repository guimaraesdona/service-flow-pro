import { ServiceOrder } from "@/types";
import { Receipt, Smartphone, MapPin, Globe } from "lucide-react";

interface ServiceOrderPrintProps {
    order: ServiceOrder;
}

export function ServiceOrderPrint({ order }: ServiceOrderPrintProps) {
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
        <div className="w-[80mm] bg-white text-black p-4 font-mono text-sm leading-tight mx-auto shadow-sm print:shadow-none print:w-full">
            {/* Header */}
            <div className="text-center border-b border-black pb-4 mb-4">
                <div className="flex justify-center mb-2">
                    <div className="w-12 h-12 bg-black text-white rounded-lg flex items-center justify-center">
                        <Receipt className="w-6 h-6" />
                    </div>
                </div>
                <h1 className="font-bold text-lg uppercase">Service Flow Pro</h1>
                <p className="text-xs">Soluções Rápidas e Eficientes</p>
                <div className="flex items-center justify-center gap-1 mt-1 text-xs">
                    <Smartphone className="w-3 h-3" />
                    <span>(11) 99999-0000</span>
                </div>
                <div className="flex items-center justify-center gap-1 text-xs">
                    <Globe className="w-3 h-3" />
                    <span>www.serviceflow.pro</span>
                </div>
            </div>

            {/* Order Info */}
            <div className="mb-4 text-xs">
                <div className="flex justify-between">
                    <span className="font-bold">ORDEM:</span>
                    <span>#{order.id}</span>
                </div>
                <div className="flex justify-between">
                    <span>DATA:</span>
                    <span>{formatDate(order.date)}</span>
                </div>
                <div className="mt-2 border-t border-dashed border-black pt-2">
                    <span className="font-bold">CLIENTE:</span>
                    <p className="truncate">{order.clientName}</p>
                </div>
                {order.description && (
                    <div className="mt-2 text-xs text-gray-600">
                        <span className="font-bold text-black">DESCRIÇÃO:</span>
                        <p>{order.description}</p>
                    </div>
                )}
            </div>

            {/* Services */}
            <div className="mb-4">
                <div className="border-b border-black font-bold mb-2 pb-1 flex justify-between">
                    <span>ITEM</span>
                    <span>TOTAL</span>
                </div>
                <div className="space-y-2">
                    {order.services.map((service, index) => (
                        <div key={index}>
                            <div className="font-bold">{service.name}</div>
                            <div className="flex justify-between text-xs">
                                <span>{service.quantity} x R$ {formatCurrency(service.price)}</span>
                                <span>R$ {formatCurrency(service.quantity * service.price)}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Totals */}
            <div className="border-t border-black pt-2 mb-6">
                <div className="flex justify-between font-bold text-base">
                    <span>TOTAL</span>
                    <span>R$ {formatCurrency(order.total)}</span>
                </div>
                {order.discount && order.discount > 0 && (
                    <div className="flex justify-between text-xs mt-1">
                        <span>Desconto</span>
                        <span>- R$ {formatCurrency(order.discount)}</span>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="text-center text-xs border-t border-dashed border-black pt-4">
                <p className="font-bold mb-2">AGRADECEMOS A PREFERÊNCIA!</p>
                <p>Este documento não possui valor fiscal.</p>
                <div className="mt-6 border-t border-black pt-2">
                    <p className="text-[10px] text-gray-500">CLIENTE</p>
                </div>
            </div>
        </div>
    );
}
