export const validateEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validateCPF = (cpf: string): boolean => {
  cpf = cpf.replace(/[^\d]+/g, "");
  if (cpf.length !== 11 || !!cpf.match(/(\d)\1{10}/)) return false;

  let soma = 0;
  for (let i = 1; i <= 9; i++) soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);
  let resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.substring(9, 10))) return false;

  soma = 0;
  for (let i = 1; i <= 10; i++) soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.substring(10, 11))) return false;

  return true;
};

export const validateCNPJ = (cnpj: string): boolean => {
  cnpj = cnpj.replace(/[^\d]+/g, "");
  if (cnpj.length !== 14) return false;

  // Quick check for repeated digits
  if (/^(\d)\1+$/.test(cnpj)) return false;

  let tamanho = cnpj.length - 2;
  let numeros = cnpj.substring(0, tamanho);
  let digitos = cnpj.substring(tamanho);
  let soma = 0;
  let pos = tamanho - 7;

  for (let i = tamanho; i >= 1; i--) {
    soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  let outcome = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (outcome !== parseInt(digitos.charAt(0))) return false;

  tamanho = tamanho + 1;
  numeros = cnpj.substring(0, tamanho);
  soma = 0;
  pos = tamanho - 7;

  for (let i = tamanho; i >= 1; i--) {
    soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  outcome = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (outcome !== parseInt(digitos.charAt(1))) return false;

  return true;
};

export const validateDocument = (doc: string): boolean => {
  const cleanDoc = doc.replace(/[^\d]+/g, "");
  if (cleanDoc.length === 11) return validateCPF(cleanDoc);
  if (cleanDoc.length === 14) return validateCNPJ(cleanDoc);
  return false;
};

export const validatePlate = (plate: string): boolean => {
  // Remove non-alphanumeric and uppercase
  const clean = plate.toUpperCase().replace(/[^A-Z0-9]/g, "");

  // Old: AAA9999 (3 letters, 4 numbers)
  const oldPattern = /^[A-Z]{3}\d{4}$/;

  // Mercosul: AAA9A99 (3 letters, 1 number, 1 letter, 2 numbers)
  const mercosulPattern = /^[A-Z]{3}\d[A-Z]\d{2}$/;

  return oldPattern.test(clean) || mercosulPattern.test(clean);
};
