export const roles = ["owner", "admin", "consultant", "finance"] as const;
export type Role = (typeof roles)[number];
export function canManageClients(role: Role) {
  return ["owner", "admin", "consultant"].includes(role);
}
export function canManageSettings(role: Role) {
  return ["owner", "admin"].includes(role);
}
export function validSlug(value: string) {
  return /^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$/.test(value);
}
export function validEmail(value: string) {
  return value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
export function validCompany(input: {
  name: string;
  slug: string;
  country: string;
  currency: string;
  locale: string;
  timeZone: string;
}) {
  if (
    input.name.trim().length < 2 ||
    input.name.length > 120 ||
    !validSlug(input.slug) ||
    !/^[A-Z]{2}$/.test(input.country) ||
    !/^[A-Z]{3}$/.test(input.currency) ||
    !/^[a-z]{2,3}(-[A-Za-z0-9]{2,8})*$/.test(input.locale)
  )
    return false;
  try {
    new Intl.DateTimeFormat("en", { timeZone: input.timeZone });
    return true;
  } catch {
    return false;
  }
}
export function validClient(input: {
  name: string;
  email: string;
  phone: string;
  notes: string;
}) {
  return (
    input.name.trim().length >= 2 &&
    input.name.length <= 160 &&
    (!input.email || validEmail(input.email)) &&
    (!input.phone || /^\+[1-9][0-9 ()-]{5,24}$/.test(input.phone)) &&
    input.notes.length <= 4000
  );
}
export function safePath(path: string | null, fallback: string) {
  return path?.startsWith("/") && !path.startsWith("//") && !path.includes("\\")
    ? path
    : fallback;
}
