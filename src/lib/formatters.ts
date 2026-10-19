export const formatCPF = (value: string) => {
  return value
    .replace(/\D/g, "")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})/, "$1-$2")
    .replace(/(-\d{2})\d+?$/, "$1");
};

export const formatDocument = (value: string) => {
  const cleanValue = value.replace(/\D/g, "");
  if (cleanValue.length <= 11) {
    return formatCPF(value);
  }
  return formatCNPJ(value);
};

export const formatCNPJ = (value: string) => {
  return value
    .replace(/\D/g, "")
    .replace(/(\d{2})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2")
    .replace(/(-\d{2})\d+?$/, "$1");
};

export const formatPhone = (value: string) => {
  const cleanValue = value.replace(/\D/g, "");
  if (cleanValue.length <= 10) {
    return cleanValue
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d)/, "$1-$2")
      .replace(/(-\d{4})\d+?$/, "$1");
  } else {
    return cleanValue
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .replace(/(-\d{4})\d+?$/, "$1");
  }
};

export const formatCEP = (value: string) => {
  return value
    .replace(/\D/g, "")
    .replace(/(\d{5})(\d)/, "$1-$2")
    .replace(/(-\d{3})\d+?$/, "$1");
};

export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

export const normalizeDocument = (value: string) => {
  return value.replace(/\D/g, "");
};

// Número exibido da OS. `number` é opcional no banco (ver migration); sem ele,
// usa o início do id em maiúsculas, para nunca mostrar o UUID inteiro.
export const formatOrderNumber = (order: { id: string; number?: string | null }) =>
  `#${order.number || order.id.slice(0, 4).toUpperCase()}`;

const PRIORITY_LABELS: Record<string, string> = { low: "Baixa", normal: "Normal", high: "Alta" };

export const formatPriority = (priority: string) => PRIORITY_LABELS[priority] ?? priority;

const pad2 = (n: number) => String(n).padStart(2, "0");

// Agendamento: os campos do formulário (data e hora locais) viram um instante
// com fuso. Sem fuso, um timestamptz do Postgres leria a hora como UTC.
// Só a data, sem hora, agenda para o início do dia em vez de ser descartada.
export const toScheduledAt = (date: string, time: string): string | null => {
  if (!date) return null;
  const local = new Date(`${date}T${time || "00:00"}`);
  return Number.isNaN(local.getTime()) ? null : local.toISOString();
};

// O inverso: instante salvo → data e hora no fuso de quem está editando.
export const fromScheduledAt = (value?: string | null): { date: string; time: string } => {
  const d = value ? new Date(value) : null;
  if (!d || Number.isNaN(d.getTime())) return { date: "", time: "" };
  return {
    date: `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`,
    time: `${pad2(d.getHours())}:${pad2(d.getMinutes())}`,
  };
};
