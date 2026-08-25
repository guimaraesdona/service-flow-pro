import { describe, expect, it } from "vitest";
import {
  formatCEP,
  formatCNPJ,
  formatCPF,
  formatCurrency,
  formatDocument,
  formatPhone,
  normalizeDocument,
} from "./formatters";

describe("formatCPF", () => {
  it("formata CPF completo", () => {
    expect(formatCPF("52998224725")).toBe("529.982.247-25");
  });

  it("descarta dígitos além do CPF", () => {
    expect(formatCPF("529982247259999")).toBe("529.982.247-25");
  });
});

describe("formatCNPJ", () => {
  it("formata CNPJ completo", () => {
    expect(formatCNPJ("11222333000181")).toBe("11.222.333/0001-81");
  });
});

describe("formatDocument", () => {
  it("usa CPF para até 11 dígitos", () => {
    expect(formatDocument("52998224725")).toBe("529.982.247-25");
  });

  it("usa CNPJ acima de 11 dígitos", () => {
    expect(formatDocument("11222333000181")).toBe("11.222.333/0001-81");
  });
});

describe("formatPhone", () => {
  it("formata telefone fixo", () => {
    expect(formatPhone("1133334444")).toBe("(11) 3333-4444");
  });

  it("formata celular", () => {
    expect(formatPhone("11987654321")).toBe("(11) 98765-4321");
  });
});

describe("formatCEP", () => {
  it("formata CEP completo", () => {
    expect(formatCEP("01310100")).toBe("01310-100");
  });
});

describe("normalizeDocument", () => {
  it("remove a formatação", () => {
    expect(normalizeDocument("529.982.247-25")).toBe("52998224725");
    expect(normalizeDocument("11.222.333/0001-81")).toBe("11222333000181");
  });
});

describe("formatCurrency", () => {
  // Intl separa "R$" do número com espaço não-quebrável (U+00A0), que varia
  // entre versões do ICU — normalizamos para espaço comum antes de comparar.
  const NBSP = String.fromCharCode(0xa0);
  const normalize = (value: string) => value.split(NBSP).join(" ");

  it("formata em BRL", () => {
    expect(normalize(formatCurrency(1234.5))).toBe("R$ 1.234,50");
  });

  it("formata zero", () => {
    expect(normalize(formatCurrency(0))).toBe("R$ 0,00");
  });

  it("formata valores negativos", () => {
    expect(normalize(formatCurrency(-99.9))).toBe("-R$ 99,90");
  });
});
