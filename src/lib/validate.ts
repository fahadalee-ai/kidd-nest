export function digits(value: string) {
  return value.replace(/\D/g, "");
}

export function formatPhone(input: string) {
  let d = digits(input);
  if (d.startsWith("1")) d = d.slice(1);
  d = d.slice(0, 10);
  if (!d) return "";
  if (d.length < 4) return `+1 (${d}`;
  if (d.length < 7) return `+1 (${d.slice(0, 3)}) ${d.slice(3)}`;
  return `+1 (${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}

export function validPhone(value: string) {
  let d = digits(value);
  if (d.startsWith("1")) d = d.slice(1);
  return d.length === 10;
}

export function validEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function validEmailOrPhone(value: string) {
  return validEmail(value) || validPhone(value);
}

export const PASSWORD_RULES = [
  { id: "len", en: "At least 8 characters", es: "Al menos 8 caracteres", test: (v: string) => v.length >= 8 },
  { id: "upper", en: "One uppercase letter", es: "Una letra mayúscula", test: (v: string) => /[A-Z]/.test(v) },
  { id: "num", en: "One number", es: "Un número", test: (v: string) => /\d/.test(v) },
  { id: "sym", en: "One symbol", es: "Un símbolo", test: (v: string) => /[^A-Za-z0-9]/.test(v) },
] as const;

export function passwordScore(value: string) {
  return PASSWORD_RULES.filter((rule) => rule.test(value)).length;
}

export function validPassword(value: string) {
  return passwordScore(value) === PASSWORD_RULES.length;
}

export function validZip(value: string) {
  return /^\d{5}$/.test(value);
}

export const ZIP_DIRECTORY: Record<string, { city: string; state: string }> = {
  "78704": { city: "Austin", state: "TX" },
  "78701": { city: "Austin", state: "TX" },
  "78702": { city: "Austin", state: "TX" },
  "78703": { city: "Austin", state: "TX" },
  "78741": { city: "Austin", state: "TX" },
  "78745": { city: "Austin", state: "TX" },
  "78751": { city: "Austin", state: "TX" },
  "78756": { city: "Austin", state: "TX" },
  "78757": { city: "Austin", state: "TX" },
  "78681": { city: "Round Rock", state: "TX" },
  "10001": { city: "New York", state: "NY" },
  "11201": { city: "Brooklyn", state: "NY" },
  "90210": { city: "Beverly Hills", state: "CA" },
  "94110": { city: "San Francisco", state: "CA" },
  "60614": { city: "Chicago", state: "IL" },
  "98101": { city: "Seattle", state: "WA" },
  "33139": { city: "Miami Beach", state: "FL" },
  "02139": { city: "Cambridge", state: "MA" },
  "20001": { city: "Washington", state: "DC" },
  "30308": { city: "Atlanta", state: "GA" },
  "97205": { city: "Portland", state: "OR" },
  "80203": { city: "Denver", state: "CO" },
};

export function lookupZip(zip: string) {
  if (ZIP_DIRECTORY[zip]) return ZIP_DIRECTORY[zip];
  if (zip.startsWith("787") || zip.startsWith("786")) return { city: "Austin", state: "TX" };
  return null;
}

export function formatCard(input: string) {
  const d = digits(input).slice(0, 16);
  return d.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
}

export function cardBrand(input: string) {
  const d = digits(input);
  if (d.startsWith("4")) return "Visa";
  if (d.startsWith("5")) return "Mastercard";
  if (d.startsWith("3")) return "Amex";
  if (d.startsWith("6")) return "Discover";
  return "Card";
}

export function usd(amount: number) {
  return amount.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

export function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}
