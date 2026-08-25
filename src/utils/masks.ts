export const normalizeNumber = (value: string | undefined) => {
  if (!value) return "";
  return value.replace(/[\D]/g, "");
};

export const maskPhone = (value: string | undefined) => {
  if (!value) return "";
  const numeric = normalizeNumber(value);

  if (numeric.length <= 10) {
    return numeric
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  }
  return numeric
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2")
    .slice(0, 15);
};

export const maskDocument = (value: string | undefined) => {
  if (!value) return "";
  const numeric = normalizeNumber(value);

  if (numeric.length <= 11) {
    return numeric
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})/, "$1-$2")
      .replace(/(-\d{2})\d+?$/, "$1");
  }
  return numeric
    .replace(/(\d{2})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2")
    .replace(/(-\d{2})\d+?$/, "$1");
};

export const maskCEP = (value: string | undefined) => {
  if (!value) return "";
  return normalizeNumber(value)
    .replace(/^(\d{5})(\d)/, "$1-$2")
    .slice(0, 9);
};

export const maskPlate = (value: string | undefined) => {
  if (!value) return "";
  const clean = value.toUpperCase().replace(/[^A-Z0-9]/g, "");

  // Mercosul: AAA0A00 (7 chars)
  // Old: AAA-0000 (8 chars with hyphen)

  // Limit to 7 alphanumeric chars
  const limited = clean.slice(0, 7);

  // Check if it's potentially Old format (AAA00...)
  // 4th char is digit, 5th char is digit -> Old
  const isOldFormat = /^[A-Z]{3}\d{2}/.test(limited);

  if (isOldFormat) {
    return limited.replace(/^([A-Z]{3})(\d)/, "$1-$2");
  }

  return limited;
};
