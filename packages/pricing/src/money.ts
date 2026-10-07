// Integer money complements the cost/markup rules inherited from Safari-duplicate.
export const quoteCurrencies = [
  "USD",
  "EUR",
  "GBP",
  "KES",
  "TZS",
  "ZAR",
  "CAD",
  "AUD",
  "JPY",
  "CHF",
  "KWD",
  "BHD",
  "OMR",
  "INR",
  "AED",
  "UGX",
  "RWF",
] as const;
export function currencyDigits(currency: string): number {
  if (!(quoteCurrencies as readonly string[]).includes(currency))
    throw new Error("Unsupported quote currency.");
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency,
  }).resolvedOptions().maximumFractionDigits!;
}
export function parseMoney(value: string, currency: string): number {
  const digits = currencyDigits(currency);
  if (!/^\d{1,10}(\.\d{1,3})?$/.test(value)) throw new Error("Invalid amount.");
  const [whole, fraction = ""] = value.split(".");
  if (fraction.length > digits)
    throw new Error("Amount exceeds currency precision.");
  const minor =
    Number(whole) * 10 ** digits + Number(fraction.padEnd(digits, "0"));
  if (!Number.isSafeInteger(minor) || minor > 1_000_000_000_000)
    throw new Error("Amount too large.");
  return minor;
}
export function moneyInput(minor: number, currency: string): string {
  const digits = currencyDigits(currency);
  const text = String(minor).padStart(digits + 1, "0");
  return digits ? `${text.slice(0, -digits)}.${text.slice(-digits)}` : text;
}
export type SellingLine = {
  description: string;
  quantity: number;
  unitMinor: number;
};
export function sellingTotal(lines: SellingLine[]): number {
  const total = lines.reduce((sum, line) => {
    if (
      !Number.isInteger(line.quantity) ||
      line.quantity < 1 ||
      line.quantity > 1000 ||
      !Number.isSafeInteger(line.unitMinor) ||
      line.unitMinor < 0
    )
      throw new Error("Invalid price line.");
    return sum + line.quantity * line.unitMinor;
  }, 0);
  if (!Number.isSafeInteger(total) || total > 1_000_000_000_000)
    throw new Error("Quote total too large.");
  return total;
}
