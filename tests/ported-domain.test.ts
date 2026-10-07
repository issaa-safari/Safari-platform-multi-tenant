import { test } from "node:test";
import assert from "node:assert/strict";
import {
  resolveRate,
  RateGapError,
  priceAccommodationStay,
  priceVehicleHire,
  pricePark,
  applyAgeBand,
  nightsBetween,
  vehicleDaysInclusive,
  type RateCardRow,
  type SupplierRateRow,
} from "../packages/pricing/src/rate-resolution.ts";
import { parseMoney, sellingTotal } from "../packages/pricing/src/money.ts";
import { computeBalance } from "../packages/pricing/src/balance.ts";
import { validQuote } from "../src/lib/quote-drafts.ts";
import { resolveStatusFilter, QUOTE_GROUPS } from "../src/lib/status-groups.ts";
const row = (extra: Partial<SupplierRateRow> = {}): SupplierRateRow => ({
  id: "rate",
  traveller_category: null,
  room_category: null,
  residency: "all",
  pricing_unit: "night",
  amount: 100,
  min_group_size: null,
  max_group_size: null,
  sort_order: 0,
  ...extra,
});
const card = (extra: Partial<RateCardRow> = {}): RateCardRow => ({
  id: "card",
  name: "Season",
  entity_type: "accommodation",
  entity_id: "lodge",
  cost_category: "accommodation",
  valid_from: "2026-01-01",
  valid_to: "2026-12-31",
  currency: "USD",
  is_active: true,
  supplier_rates: [row()],
  ...extra,
});
const fx = {
  currency: "EUR",
  rates: { USD: 0.9, EUR: 1 },
  asOf: "2026-10-07T00:00:00Z",
};
const params = {
  entityType: "accommodation",
  entityId: "lodge",
  serviceDate: "2026-06-01",
};
test("ported rate resolver uses service dates and explicit quote-currency FX", () => {
  const r = resolveRate(params, [card()], fx);
  assert.equal(r.unitCost, 90);
  assert.equal(r.quoteCurrency, "EUR");
  assert.equal(r.sourceUnitCost, 100);
  assert.throws(
    () => resolveRate({ ...params, serviceDate: "2027-01-01" }, [card()], fx),
    RateGapError,
  );
  assert.throws(
    () => resolveRate(params, [card()], { ...fx, rates: { EUR: 1 } }),
    /exchange rate/,
  );
});
test("ported residency, age and room specificity selects the matching rate", () => {
  const r = resolveRate(
    {
      ...params,
      residency: "resident",
      travellerCategory: "child",
      roomCategory: "family",
    },
    [
      card({
        supplier_rates: [
          row(),
          row({
            id: "child",
            amount: 30,
            residency: "resident",
            traveller_category: "child",
            room_category: "family",
          }),
        ],
      }),
    ],
    fx,
  );
  assert.equal(r.supplierRateId, "child");
  assert.equal(
    applyAgeBand(r, {
      code: "child",
      pricingMethod: "percentage",
      percentage: 50,
      fixedAmount: null,
    }).unitCost,
    27,
  );
});
test("missing or malformed supplier amounts are blocked, explicit zero is allowed", () => {
  for (const amount of [null, "", "invalid", -1])
    assert.throws(() =>
      resolveRate(params, [card({ supplier_rates: [row({ amount })] })], fx),
    );
  assert.equal(
    resolveRate(params, [card({ supplier_rates: [row({ amount: 0 })] })], fx)
      .unitCost,
    0,
  );
});
test("child percentage derives from adult rate and missing base is blocked", () => {
  const child = row({
    id: "child",
    traveller_category: "child",
    amount: null,
    percent_of_adult: 50,
  });
  assert.equal(
    resolveRate(
      { ...params, travellerCategory: "child" },
      [card({ supplier_rates: [row({ traveller_category: "adult" }), child] })],
      fx,
    ).unitCost,
    45,
  );
  assert.throws(
    () =>
      resolveRate(
        { ...params, travellerCategory: "child" },
        [card({ supplier_rates: [child] })],
        fx,
      ),
    /adult rate/,
  );
});
test("accommodation seasons split by each service night", () => {
  const segments = priceAccommodationStay(
    {
      accommodationId: "lodge",
      checkIn: "2026-06-30",
      checkOut: "2026-07-02",
      unitsPerNight: 2,
    },
    [
      card({ valid_to: "2026-06-30" }),
      card({
        id: "high",
        valid_from: "2026-07-01",
        supplier_rates: [row({ id: "high-rate", amount: 200 })],
      }),
    ],
    fx,
  );
  assert.equal(segments.length, 2);
  assert.deepEqual(
    segments.map((s) => [s.units, s.resolved.unitCost]),
    [
      [2, 90],
      [2, 180],
    ],
  );
});
test("vehicle dates are inclusive and park tickets use residency rate", () => {
  assert.equal(
    priceVehicleHire(
      {
        vehicleId: "car",
        startDate: "2026-06-01",
        endDate: "2026-06-03",
        vehicleCount: 1,
      },
      [card({ entity_type: "vehicle", entity_id: "car" })],
      fx,
    )[0].units,
    3,
  );
  assert.equal(
    pricePark(
      {
        parkId: "park",
        entryDate: "2026-06-01",
        tickets: 2,
        residency: "citizen",
      },
      [card({ entity_type: "park_fee", entity_id: "park" })],
      fx,
    ).units,
    2,
  );
});
test("date-only arithmetic rejects impossible dates and reversed ranges", () => {
  assert.equal(nightsBetween("2026-03-28", "2026-03-30"), 2);
  assert.equal(vehicleDaysInclusive("2026-03-28", "2026-03-28"), 1);
  assert.throws(() => nightsBetween("2026-02-30", "2026-03-02"));
  assert.throws(() => vehicleDaysInclusive("2026-03-30", "2026-03-28"));
});
test("international minor units support zero, two and three decimals", () => {
  assert.equal(parseMoney("12.34", "EUR"), 1234);
  assert.equal(parseMoney("12", "JPY"), 12);
  assert.equal(parseMoney("12.345", "KWD"), 12345);
  assert.throws(() => parseMoney("12.3", "JPY"));
  assert.throws(() => parseMoney("1.001", "USD"));
  assert.equal(
    resolveRate(params, [card()], {
      ...fx,
      currency: "JPY",
      rates: { USD: 1.234 },
    }).unitCost,
    123,
  );
  assert.equal(
    resolveRate(
      params,
      [card({ supplier_rates: [row({ amount: 1.23456 })] })],
      { ...fx, currency: "KWD", rates: { USD: 1 } },
    ).unitCost,
    1.235,
  );
});
test("selling totals use integer arithmetic and reject overflow", () => {
  assert.equal(
    sellingTotal([{ description: "Safari", quantity: 3, unitMinor: 101 }]),
    303,
  );
  assert.throws(() =>
    sellingTotal([
      { description: "Safari", quantity: 1000, unitMinor: 1_000_000_000_000 },
    ]),
  );
});
test("ported balance subtracts refunds, computes deposit and keeps drafts unsettled", () => {
  const b = computeBalance(
    10000,
    [
      { amountMinor: 5000, paymentType: "deposit" },
      { amountMinor: 1000, paymentType: "refund" },
    ],
    50,
  );
  assert.equal(b.receivedMinor, 4000);
  assert.equal(b.balanceMinor, 6000);
  assert.equal(b.depositDueMinor, 1000);
  assert.equal(computeBalance(0, []).isSettled, false);
});
test("quote validation requires one day per date and positive selling total", () => {
  const q = {
    title: "Private safari",
    clientId: "11111111-1111-4111-8111-111111111111",
    currency: "EUR",
    startDate: "2026-11-01",
    endDate: "2026-11-01",
    travelers: 2,
    days: [{ title: "Arrival", description: "Meet your guide" }],
    lines: [{ description: "Safari", quantity: 1, unitMinor: 100 }],
    inclusions: "",
    exclusions: "",
  };
  assert.equal(validQuote(q), true);
  assert.equal(validQuote({ ...q, endDate: "2026-11-02" }), false);
  assert.equal(
    validQuote({ ...q, lines: [{ ...q.lines[0], unitMinor: 0 }] }),
    false,
  );
});
test("ported status groups keep exact proposal filters", () => {
  assert.deepEqual(resolveStatusFilter(QUOTE_GROUPS, "viewed"), {
    groupKey: "with_client",
    statuses: ["viewed"],
    exactStatus: "viewed",
  });
});
