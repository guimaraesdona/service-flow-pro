import { describe, expect, it } from "vitest";
import {
  validateCNPJ,
  validateCPF,
  validateDocument,
  validateEmail,
  validatePlate,
} from "./validations";

describe("validateEmail", () => {
  it.each(["ana@exemplo.com", "a.b+tag@sub.dominio.com.br"])(
    "aceita %s",
    (email) => {
      expect(validateEmail(email)).toBe(true);
    },
  );

  it.each(["", "ana", "ana@", "@exemplo.com", "ana@exemplo", "a na@x.com"])(
    "rejeita %s",
    (email) => {
      expect(validateEmail(email)).toBe(false);
    },
  );
});

describe("validateCPF", () => {
  it("aceita CPF válido sem formatação", () => {
    expect(validateCPF("52998224725")).toBe(true);
  });

  it("aceita CPF válido formatado", () => {
    expect(validateCPF("529.982.247-25")).toBe(true);
  });

  it("rejeita CPF com dígito verificador errado", () => {
    expect(validateCPF("52998224726")).toBe(false);
  });

  it("rejeita CPF com todos os dígitos iguais", () => {
    expect(validateCPF("111.111.111-11")).toBe(false);
  });

  it("rejeita CPF com tamanho inválido", () => {
    expect(validateCPF("5299822472")).toBe(false);
    expect(validateCPF("529982247251")).toBe(false);
  });
});

describe("validateCNPJ", () => {
  it("aceita CNPJ válido sem formatação", () => {
    expect(validateCNPJ("11222333000181")).toBe(true);
  });

  it("aceita CNPJ válido formatado", () => {
    expect(validateCNPJ("11.222.333/0001-81")).toBe(true);
  });

  it("rejeita CNPJ com dígito verificador errado", () => {
    expect(validateCNPJ("11222333000182")).toBe(false);
  });

  it("rejeita CNPJ com todos os dígitos iguais", () => {
    expect(validateCNPJ("11111111111111")).toBe(false);
  });

  it("rejeita CNPJ com tamanho inválido", () => {
    expect(validateCNPJ("1122233300018")).toBe(false);
  });
});

describe("validateDocument", () => {
  it("roteia 11 dígitos para CPF", () => {
    expect(validateDocument("529.982.247-25")).toBe(true);
    expect(validateDocument("529.982.247-26")).toBe(false);
  });

  it("roteia 14 dígitos para CNPJ", () => {
    expect(validateDocument("11.222.333/0001-81")).toBe(true);
    expect(validateDocument("11.222.333/0001-82")).toBe(false);
  });

  it("rejeita qualquer outro tamanho", () => {
    expect(validateDocument("")).toBe(false);
    expect(validateDocument("123")).toBe(false);
    expect(validateDocument("529982247251")).toBe(false);
  });
});

describe("validatePlate", () => {
  it("aceita placa no padrão antigo", () => {
    expect(validatePlate("ABC1234")).toBe(true);
    expect(validatePlate("abc-1234")).toBe(true);
  });

  it("aceita placa no padrão Mercosul", () => {
    expect(validatePlate("ABC1D23")).toBe(true);
    expect(validatePlate("abc1d23")).toBe(true);
  });

  it("rejeita formatos fora dos dois padrões", () => {
    expect(validatePlate("")).toBe(false);
    expect(validatePlate("AB1234")).toBe(false);
    expect(validatePlate("ABCD123")).toBe(false);
    expect(validatePlate("ABC12345")).toBe(false);
    expect(validatePlate("1234ABC")).toBe(false);
  });
});
