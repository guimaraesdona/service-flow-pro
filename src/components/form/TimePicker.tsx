import { useEffect, useRef, useState } from "react";
import { Clock, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useCoarsePointer } from "@/hooks/use-coarse-pointer";
import { cn } from "@/lib/utils";

interface TimePickerProps {
  id?: string;
  /** Hora no formato "HH:mm"; "" quando vazia. */
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  invalid?: boolean;
  disabled?: boolean;
  className?: string;
  /** Intervalo da coluna de minutos. */
  minuteStep?: number;
}

const pad = (n: number) => String(n).padStart(2, "0");

const parse = (value: string): [number, number] | null => {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value);
  if (!match) return null;
  const [h, m] = [Number(match[1]), Number(match[2])];
  return h < 24 && m < 60 ? [h, m] : null;
};

function Column({
  label,
  options,
  selected,
  onPick,
}: {
  label: string;
  options: number[];
  selected: number | undefined;
  onPick: (value: number) => void;
}) {
  const listRef = useRef<HTMLDivElement>(null);
  const selectedRef = useRef<HTMLButtonElement>(null);

  // Ao abrir, a opção escolhida aparece no meio da coluna. Rola só a coluna:
  // scrollIntoView também arrastaria a página por trás do popover.
  useEffect(() => {
    const list = listRef.current;
    const item = selectedRef.current;
    if (list && item) list.scrollTop = item.offsetTop - list.clientHeight / 2 + item.clientHeight / 2;
  }, []);

  return (
    <div role="group" aria-label={label} className="flex flex-col">
      <span className="px-2 py-1.5 text-xs font-medium text-muted-foreground text-center border-b border-border">{label}</span>
      <div ref={listRef} className="relative h-56 w-16 overflow-y-auto p-1 space-y-0.5">
        {options.map((option) => {
          const active = option === selected;
          return (
            <button
              key={option}
              ref={active ? selectedRef : undefined}
              type="button"
              aria-pressed={active}
              onClick={() => onPick(option)}
              className={cn(
                "w-full h-8 rounded-md text-sm tabular transition-colors",
                active ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-secondary",
              )}
            >
              {pad(option)}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function TimePicker({
  id,
  value,
  onChange,
  placeholder = "Sem hora",
  invalid,
  disabled,
  className,
  minuteStep = 5,
}: TimePickerProps) {
  const coarse = useCoarsePointer();
  const [open, setOpen] = useState(false);
  const parsed = parse(value);

  if (coarse) {
    return (
      <Input
        id={id}
        type="time"
        value={value}
        disabled={disabled}
        aria-invalid={invalid}
        onChange={(e) => onChange(e.target.value)}
        className={cn("input-field", invalid && "border-destructive", className)}
      />
    );
  }

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: Math.ceil(60 / minuteStep) }, (_, i) => i * minuteStep);
  // Uma hora salva fora do intervalo (ex.: 10:07) continua aparecendo na lista.
  if (parsed && !minutes.includes(parsed[1])) minutes.push(parsed[1]);
  minutes.sort((a, b) => a - b);

  return (
    <Popover open={open} onOpenChange={setOpen}>
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
              !parsed && "text-muted-foreground",
              parsed && "pr-9",
              invalid && "border-destructive",
            )}
          >
            <Clock className="w-4 h-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            {parsed ? `${pad(parsed[0])}:${pad(parsed[1])}` : placeholder}
          </Button>
        </PopoverTrigger>
        {parsed && !disabled && (
          <button
            type="button"
            aria-label="Limpar hora"
            onClick={() => onChange("")}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex divide-x divide-border">
          <Column
            label="Hora"
            options={hours}
            selected={parsed?.[0]}
            // Escolher a hora mantém o popover aberto para o minuto.
            onPick={(h) => onChange(`${pad(h)}:${pad(parsed?.[1] ?? 0)}`)}
          />
          <Column
            label="Min"
            options={minutes}
            selected={parsed?.[1]}
            onPick={(m) => {
              onChange(`${pad(parsed?.[0] ?? 8)}:${pad(m)}`);
              setOpen(false);
            }}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
