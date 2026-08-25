import { describe, expect, it } from "vitest";
import {
  maskCEP,
  maskDocument,
  maskPhone,
  maskPlate,
  normalizeNumber,
} from "./masks";

describe("normalizeNumber", () => {
  it("mantém apenas dígitos", () => {
    expect(normalizeNumber("(11) 98765-4321")).toBe("11987654321");
    expect(normalizeNumber("abc123def")).toBe("123");
  });

  it("devolve string vazia para entrada indefinida", () => {
    expect(normalizeNumber(undefined)).toBe("");
    expect(normalizeNumber("")).toBe("");
  });
});

describe("maskPhone", () => {
  it("formata telefone fixo (10 dígitos)", () => {
    expect(maskPhone("1133334444")).toBe("(11) 3333-4444");
  });

  it("formata celular (11 dígitos)", () => {
    expect(maskPhone("11987654321")).toBe("(11) 98765-4321");
  });

  it("formata parcialmente enquanto o usuário digita", () => {
    expect(maskPhone("11")).toBe("11");
    expect(maskPhone("119")).toBe("(11) 9");
    expect(maskPhone("119876")).toBe("(11) 9876");
  });

  it("ignora caracteres não numéricos já presentes", () => {
    expect(maskPhone("(11) 98765-4321")).toBe("(11) 98765-4321");
  });

  it("devolve string vazia para entrada indefinida", () => {
    expect(maskPhone(undefined)).toBe("");
  });
});

describe("maskDocument", () => {
  it("formata CPF quando tem até 11 dígitos", () => {
    expect(maskDocument("52998224725")).toBe("529.982.247-25");
  });

  it("formata CNPJ quando passa de 11 dígitos", () => {
    expect(maskDocument("11222333000181")).toBe("11.222.333/0001-81");
  });

  it("formata parcialmente enquanto o usuário digita", () => {
    expect(maskDocument("529")).toBe("529");
    expect(maskDocument("5299")).toBe("529.9");
  });

  it("devolve string vazia para entrada indefinida", () => {
    expect(maskDocument(undefined)).toBe("");
  });
});

describe("maskCEP", () => {
  it("formata CEP completo", () => {
    expect(maskCEP("01310100")).toBe("01310-100");
  });

  it("não insere o hífen antes da hora", () => {
    expect(maskCEP("01310")).toBe("01310");
  });

  it("trunca em 9 caracteres", () => {
    expect(maskCEP("013101009999")).toHaveLength(9);
  });

  it("devolve string vazia para entrada indefinida", () => {
    expect(maskCEP(undefined)).toBe("");
  });
});

describe("maskPlate", () => {
  it("insere hífen no padrão antigo", () => {
    expect(maskPlate("abc1234")).toBe("ABC-1234");
  });

  it("mantém o padrão Mercosul sem hífen", () => {
    expect(maskPlate("abc1d23")).toBe("ABC1D23");
  });

  it("limita a 7 caracteres alfanuméricos", () => {
    expect(maskPlate("ABC1234567")).toBe("ABC-1234");
  });

  it("devolve string vazia para entrada indefinida", () => {
    expect(maskPlate(undefined)).toBe("");
  });
});
