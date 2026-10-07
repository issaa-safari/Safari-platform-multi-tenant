import {
  quoteCurrencies,
  sellingTotal,
  type SellingLine,
} from "../../packages/pricing/src/money.ts";
import { vehicleDaysInclusive } from "../../packages/pricing/src/rate-resolution.ts";
export type ItineraryDay = { title: string; description: string };
export type QuoteInput = {
  title: string;
  clientId: string;
  currency: string;
  startDate: string;
  endDate: string;
  travelers: number;
  days: ItineraryDay[];
  lines: SellingLine[];
  inclusions: string;
  exclusions: string;
};
export function validQuote(input: QuoteInput): boolean {
  try {
    const days = vehicleDaysInclusive(input.startDate, input.endDate);
    return (
      input.title.trim().length >= 2 &&
      input.title.length <= 160 &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        input.clientId,
      ) &&
      (quoteCurrencies as readonly string[]).includes(input.currency) &&
      Number.isInteger(input.travelers) &&
      input.travelers >= 1 &&
      input.travelers <= 1000 &&
      days >= 1 &&
      days <= 60 &&
      input.days.length === days &&
      input.days.every(
        (d) =>
          d.title.trim().length >= 2 &&
          d.title.length <= 160 &&
          d.description.length <= 4000,
      ) &&
      input.lines.length >= 1 &&
      input.lines.length <= 100 &&
      input.lines.every(
        (l) => l.description.trim().length >= 2 && l.description.length <= 240,
      ) &&
      sellingTotal(input.lines) > 0 &&
      input.inclusions.length <= 4000 &&
      input.exclusions.length <= 4000
    );
  } catch {
    return false;
  }
}
