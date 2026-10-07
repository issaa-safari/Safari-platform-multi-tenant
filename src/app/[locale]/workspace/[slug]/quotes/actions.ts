"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { localeOf } from "@/lib/i18n";
import { requireCompany } from "@/lib/workspace";
import { canManageClients } from "@/lib/validation";
import { validQuote, type QuoteInput } from "@/lib/quote-drafts";
import { parseMoney } from "../../../../../../packages/pricing/src/money.ts";
const field = (form: FormData, key: string) =>
  String(form.get(key) || "").trim();
export async function saveQuote(form: FormData) {
  const locale = localeOf(form.get("locale"));
  const { db, company, role } = await requireCompany(
    locale,
    field(form, "slug"),
  );
  const base = `/${locale}/workspace/${company.slug}/quotes`;
  if (!canManageClients(role)) redirect(`${base}?notice=denied`);
  const id = field(form, "id");
  const revision = Number(field(form, "revision"));
  if (
    !/^[0-9a-f-]{36}$/i.test(id) ||
    !Number.isInteger(revision) ||
    revision < 0
  )
    redirect(`${base}?notice=invalidForm`);
  const path = revision ? `${base}/${id}` : `${base}/new`;
  const currency = field(form, "currency");
  let input: QuoteInput;
  try {
    const titles = form.getAll("dayTitle");
    const narratives = form.getAll("dayDescription");
    const descriptions = form.getAll("lineDescription");
    const quantities = form.getAll("quantity");
    const amounts = form.getAll("amount");
    if (
      titles.length !== narratives.length ||
      descriptions.length !== quantities.length ||
      descriptions.length !== amounts.length
    )
      throw new Error("Malformed quote");
    input = {
      title: field(form, "title"),
      clientId: field(form, "clientId"),
      currency,
      startDate: field(form, "startDate"),
      endDate: field(form, "endDate"),
      travelers: Number(field(form, "travelers")),
      days: titles.map((title, i) => ({
        title: String(title).trim(),
        description: String(narratives[i]).trim(),
      })),
      lines: descriptions.map((description, i) => ({
        description: String(description).trim(),
        quantity: Number(quantities[i]),
        unitMinor: parseMoney(String(amounts[i]), currency),
      })),
      inclusions: field(form, "inclusions"),
      exclusions: field(form, "exclusions"),
    };
  } catch {
    redirect(`${path}?notice=invalidForm`);
  }
  if (!validQuote(input)) redirect(`${path}?notice=invalidForm`);
  const payload = {
    client_id: input.clientId,
    title: input.title,
    currency,
    start_date: input.startDate,
    end_date: input.endDate,
    travelers: input.travelers,
    days: input.days,
    lines: input.lines,
    inclusions: input.inclusions,
    exclusions: input.exclusions,
  };
  const result = revision
    ? await db
        .from("company_quote_drafts")
        .update({ ...payload, revision: revision + 1 })
        .eq("company_id", company.id)
        .eq("id", id)
        .eq("revision", revision)
        .select("id")
    : await db
        .from("company_quote_drafts")
        .insert({ ...payload, id, company_id: company.id })
        .select("id");
  if (result.error)
    redirect(
      `${path}?notice=${result.error.code === "23503" ? "clientMissing" : result.error.code === "40001" ? "conflict" : "failed"}`,
    );
  if (!result.data?.length) redirect(`${path}?notice=conflict`);
  revalidatePath(base);
  revalidatePath(`${base}/${id}`);
  redirect(`${base}/${id}?notice=saved`);
}
