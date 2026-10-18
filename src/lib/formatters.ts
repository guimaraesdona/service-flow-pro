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
