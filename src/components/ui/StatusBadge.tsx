import { cn } from "@/lib/utils";
import { OrderStatus } from "@/types";

interface StatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

const statusConfig: Record<OrderStatus, { label: string; className: string }> = {
  start: { label: "Iniciar", className: "bg-status-start/15 text-status-start border-status-start/30" },
  progress: { label: "Em andamento", className: "bg-status-progress/15 text-status-progress border-status-progress/30" },
  waiting: { label: "Aguardando", className: "bg-status-waiting/15 text-status-waiting border-status-waiting/30" },
  cancelled: { label: "Cancelado", className: "bg-status-cancelled/15 text-status-cancelled border-status-cancelled/30" },
  finished: { label: "Finalizado", className: "bg-status-finished/15 text-status-finished border-status-finished/30" },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        "status-badge border whitespace-nowrap justify-center leading-none py-0 pt-[3px] pb-[1px]",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
