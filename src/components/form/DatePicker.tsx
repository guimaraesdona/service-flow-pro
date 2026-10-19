import { useState } from "react";
import { format, parseISO, isValid } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useCoarsePointer } from "@/hooks/use-coarse-pointer";
import { cn } from "@/lib/utils";

interface DatePickerProps {
  id?: string;
  /** Data no formato "yyyy-MM-dd" (o mesmo do banco e do input nativo); "" quando vazia. */
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  invalid?: boolean;
  disabled?: boolean;
  className?: string;
  /** Datas antigas (nascimento, abertura da empresa): mostra seletores de mês e ano. */
  historical?: boolean;
  onBlur?: () => void;
}

const toDate = (value: string) => {
  if (!value) return undefined;
  const date = parseISO(value);
  return isValid(date) ? date : undefined;
};

export function DatePicker({
  id,
  value,
  onChange,
  placeholder = "Selecione a data",
  invalid,
  disabled,
  className,
  historical,
  onBlur,
}: DatePickerProps) {
  const coarse = useCoarsePointer();
  const [open, setOpen] = useState(false);
  const selected = toDate(value);
  const thisYear = new Date().getFullYear();

  if (coarse) {
    return (
      <Input
        id={id}
        type="date"
        value={value}
        disabled={disabled}
        aria-invalid={invalid}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        className={cn("input-field", invalid && "border-destructive", className)}
      />
    );
  }

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) onBlur?.();
      }}
    >
      <div className={cn("relative", className)}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            disabled={disabled}
            aria-invalid={invalid}
            className={cn(
              "w-full h-11 justify-start gap-2 px-3 font-normal tabular bg-card border-input hover:bg-card hover:text-foreground",
              !selected && "text-muted-foreground",
              selected && "pr-9",
              invalid && "border-destructive",
            )}
          >
            <CalendarIcon className="w-4 h-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            {selected ? format(selected, "dd/MM/yyyy") : placeholder}
          </Button>
        </PopoverTrigger>
        {selected && !disabled && (
          <button
            type="button"
            aria-label="Limpar data"
            onClick={() => onChange("")}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          locale={ptBR}
          selected={selected}
          defaultMonth={selected}
          onSelect={(date) => {
            onChange(date ? format(date, "yyyy-MM-dd") : "");
            setOpen(false);
          }}
          initialFocus
          {...(historical
            ? { captionLayout: "dropdown-buttons" as const, fromYear: thisYear - 100, toYear: thisYear }
            : {})}
        />
      </PopoverContent>
    </Popover>
  );
}
