import { cn } from "@/lib/utils";
import { OrderStatus } from "@/types";
import { STATUS_LABELS } from "@/lib/orderStatus";

interface StatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

// Fundo tingido com texto escuro do mesmo matiz (contraste AA) e um ponto no
// tom sólido; o rótulo sempre aparece, a cor nunca carrega o sentido sozinha.
const statusClasses: Record<OrderStatus, { badge: string; dot: string }> = {
  start: { badge: "bg-status-start-bg text-status-start-fg", dot: "bg-status-start" },
  progress: { badge: "bg-status-progress-bg text-status-progress-fg", dot: "bg-status-progress" },
  waiting: { badge: "bg-status-waiting-bg text-status-waiting-fg", dot: "bg-status-waiting" },
  cancelled: { badge: "bg-status-cancelled-bg text-status-cancelled-fg", dot: "bg-status-cancelled" },
  finished: { badge: "bg-status-finished-bg text-status-finished-fg", dot: "bg-status-finished" },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const classes = statusClasses[status];

  return (
    <span className={cn("status-badge whitespace-nowrap", classes.badge, className)}>
      <span aria-hidden="true" className={cn("w-1.5 h-1.5 rounded-full", classes.dot)} />
      {STATUS_LABELS[status]}
    </span>
  );
}
