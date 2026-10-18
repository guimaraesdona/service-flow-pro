import { OrderPriority, OrderStatus } from "@/types";

// Rótulos no feminino porque concordam com "ordem".
export const STATUS_LABELS: Record<OrderStatus, string> = {
  start: "Aberta",
  progress: "Em andamento",
  waiting: "Aguardando",
  finished: "Finalizada",
  cancelled: "Cancelada",
};

export const STATUS_PLURAL: Record<OrderStatus, string> = {
  start: "Abertas",
  progress: "Em andamento",
  waiting: "Aguardando",
  finished: "Finalizadas",
  cancelled: "Canceladas",
};

// Ordem do ciclo de vida, usada em selects, filtros e contagens.
export const STATUS_ORDER: OrderStatus[] = ["start", "progress", "waiting", "finished", "cancelled"];

export const STATUS_OPTIONS = STATUS_ORDER.map((value) => ({ value, label: STATUS_LABELS[value] }));

export const PRIORITY_OPTIONS: { value: OrderPriority; label: string }[] = [
  { value: "low", label: "Baixa" },
  { value: "normal", label: "Normal" },
  { value: "high", label: "Alta" },
];

export const isOverdue = (order: { status: OrderStatus; scheduledAt?: string }) =>
  !!order.scheduledAt &&
  (order.status === "start" || order.status === "waiting") &&
  new Date(order.scheduledAt).getTime() < Date.now();

type StatusAction = { to: OrderStatus; label: string };

// O próximo passo natural de cada status (um botão primário no detalhe da OS)
// e os desvios possíveis. Finalizada e Cancelada podem ser reabertas.
export const STATUS_FLOW: Record<OrderStatus, { next?: StatusAction; others: StatusAction[] }> = {
  start: {
    next: { to: "progress", label: "Iniciar serviço" },
    others: [{ to: "waiting", label: "Marcar como aguardando" }],
  },
  progress: {
    next: { to: "finished", label: "Finalizar OS" },
    others: [{ to: "waiting", label: "Marcar como aguardando" }],
  },
  waiting: {
    next: { to: "progress", label: "Retomar serviço" },
    others: [{ to: "finished", label: "Finalizar OS" }],
  },
  finished: {
    others: [{ to: "progress", label: "Reabrir OS" }],
  },
  cancelled: {
    others: [{ to: "start", label: "Reabrir OS" }],
  },
};
