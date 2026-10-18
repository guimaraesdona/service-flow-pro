// Valor de campo personalizado como texto de leitura (detalhe e recibo).
// Vazios viram null para que a tela simplesmente omita o campo.
export const printableValue = (value: unknown): string | null => {
  if (value === undefined || value === null || value === "") return null;
  if (Array.isArray(value)) return value.length ? value.join(", ") : null;
  if (typeof value === "boolean") return value ? "Sim" : "Não";
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return new Date(`${value}T00:00:00`).toLocaleDateString("pt-BR");
  }
  return String(value);
};
