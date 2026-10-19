import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatCurrency, formatOrderNumber } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { ServiceOrder } from "@/types";

interface OrderComboboxProps {
  id?: string;
  orders: ServiceOrder[];
  value: string;
  onChange: (orderId: string) => void;
  invalid?: boolean;
}

const normalize = (text: string) => text.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

// Trecho exato (sem acento, sem caixa), não a busca aproximada padrão do cmdk:
// "padaria" não deve trazer "Transportes" só porque as letras aparecem em ordem.
const filterOrders = (_value: string, search: string, keywords?: string[]) => {
  const term = normalize(search.trim()).replace(/^#/, "");
  return !term || normalize((keywords ?? []).join(" ")).includes(term) ? 1 : 0;
};

// Campo de OS pesquisável: filtra por número, cliente ou serviço enquanto digita.
export function OrderCombobox({ id, orders, value, onChange, invalid }: OrderComboboxProps) {
  const [open, setOpen] = useState(false);
  const selected = orders.find((o) => o.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-invalid={invalid}
          className={cn(
            "w-full h-11 justify-between px-3 font-normal bg-card border-input hover:bg-card hover:text-foreground",
            !selected && "text-muted-foreground",
            invalid && "border-destructive",
          )}
        >
          <span className="truncate">
            {selected ? `${formatOrderNumber(selected)} · ${selected.clientName}` : "Buscar OS por nº, cliente ou serviço"}
          </span>
          <ChevronsUpDown className="w-4 h-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[--radix-popover-trigger-width]" align="start">
        <Command filter={filterOrders}>
          <CommandInput placeholder="Nº, cliente ou serviço" />
          <CommandList>
            <CommandEmpty>Nenhuma OS encontrada.</CommandEmpty>
            {orders.map((order) => (
              <CommandItem
                key={order.id}
                value={order.id}
                keywords={[formatOrderNumber(order), order.number ?? "", order.clientName, ...order.services.map((s) => s.name)]}
                onSelect={() => {
                  onChange(order.id);
                  setOpen(false);
                }}
                className="gap-2"
              >
                <Check className={cn("w-4 h-4 shrink-0", order.id === value ? "opacity-100" : "opacity-0")} aria-hidden="true" />
                <span className="w-12 shrink-0 font-semibold tabular">{formatOrderNumber(order)}</span>
                <span className="flex-1 min-w-0 truncate">{order.clientName}</span>
                <StatusBadge status={order.status} className="hidden sm:inline-flex" />
                <span className="tabular text-muted-foreground whitespace-nowrap">{formatCurrency(order.total)}</span>
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
