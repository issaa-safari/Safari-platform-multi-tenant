// Adapted from Safari-duplicate/lib/balance.ts at b8e8609: one refund-aware balance rule.
// Amounts are now integer minor units in ONE currency. Conversion happens before entry.
export type Payment = {
  amountMinor: number;
  paymentType: "deposit" | "balance" | "full" | "partial" | "refund";
};
export function computeBalance(
  invoicedMinor: number,
  payments: Payment[],
  depositPercent = 0,
) {
  if (
    !Number.isSafeInteger(invoicedMinor) ||
    invoicedMinor < 0 ||
    !Number.isFinite(depositPercent) ||
    depositPercent < 0 ||
    depositPercent > 100
  )
    throw new Error("Invalid invoice or deposit.");
  const receivedMinor = payments.reduce((sum, p) => {
    if (!Number.isSafeInteger(p.amountMinor) || p.amountMinor < 0)
      throw new Error("Invalid payment.");
    return sum + (p.paymentType === "refund" ? -p.amountMinor : p.amountMinor);
  }, 0);
  if (!Number.isSafeInteger(receivedMinor))
    throw new Error("Balance overflow.");
  const balanceMinor = Math.max(invoicedMinor - receivedMinor, 0);
  return {
    invoicedMinor,
    receivedMinor,
    balanceMinor,
    depositDueMinor: Math.max(
      Math.round((invoicedMinor * depositPercent) / 100) - receivedMinor,
      0,
    ),
    isSettled: invoicedMinor > 0 && balanceMinor === 0,
  };
}
