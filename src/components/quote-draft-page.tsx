import { randomUUID } from "node:crypto";
import Link from "next/link";
import { notFound } from "next/navigation";
import { localeOf, messages } from "@/lib/i18n";
import { quoteMessages } from "@/lib/quote-messages";
import { requireCompany } from "@/lib/workspace";
import { canManageClients } from "@/lib/validation";
import type { QuoteInput, ItineraryDay } from "@/lib/quote-drafts";
import {
  quoteCurrencies,
  type SellingLine,
} from "../../packages/pricing/src/money.ts";
import QuoteEditor from "./quote-editor";
import Notice from "./notice";
export default async function QuoteDraftPage({
  rawLocale,
  slug,
  id,
  notice,
}: {
  rawLocale: string;
  slug: string;
  id?: string;
  notice?: string;
}) {
  const locale = localeOf(rawLocale);
  const t = quoteMessages(locale);
  const { db, company, role } = await requireCompany(locale, slug);
  if (!canManageClients(role))
    return <p className="notice">{messages(locale).memberReadOnly}</p>;
  const base = `/${locale}/workspace/${company.slug}`;
  const { data: clients, error: clientError } = await db
    .from("company_clients")
    .select("id,full_name")
    .eq("company_id", company.id)
    .order("full_name")
    .limit(100);
  if (clientError) throw new Error("Client options failed");
  let revision = 0;
  let initial: QuoteInput = {
    title: "",
    clientId: "",
    currency: (quoteCurrencies as readonly string[]).includes(
      company.base_currency,
    )
      ? company.base_currency
      : "USD",
    startDate: "",
    endDate: "",
    travelers: 2,
    days: [{ title: "", description: "" }],
    lines: [{ description: "", quantity: 1, unitMinor: 0 }],
    inclusions: "",
    exclusions: "",
  };
  if (id) {
    if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
    const { data: q, error } = await db
      .from("company_quote_drafts")
      .select("*")
      .eq("company_id", company.id)
      .eq("id", id)
      .maybeSingle();
    if (error) throw new Error("Quote draft lookup failed");
    if (!q) notFound();
    revision = q.revision;
    initial = {
      title: q.title,
      clientId: q.client_id,
      currency: q.currency,
      startDate: q.start_date,
      endDate: q.end_date,
      travelers: q.travelers,
      days: q.days as unknown as ItineraryDay[],
      lines: q.lines as unknown as SellingLine[],
      inclusions: q.inclusions,
      exclusions: q.exclusions,
    };
    if (!clients?.some((c) => c.id === q.client_id)) {
      const { data: attached, error: attachedError } = await db
        .from("company_clients")
        .select("id,full_name")
        .eq("company_id", company.id)
        .eq("id", q.client_id)
        .maybeSingle();
      if (attachedError) throw new Error("Attached client lookup failed");
      if (attached) clients?.push(attached);
    }
  }
  return (
    <>
      <Link className="text-link" href={`${base}/quotes`}>
        {t.back}
      </Link>
      <p className="eyebrow">
        {company.name} · {t.draft}
        {revision ? ` · ${t.revision} ${revision}` : ""}
      </p>
      <h1>{id ? t.editQuote : t.newQuote}</h1>
      <p className="notice">{t.draftNotice}</p>
      <Notice code={notice} locale={locale} />
      {notice === "conflict" || notice === "clientMissing" ? (
        <p className="notice" role="alert">
          {t[notice]}
        </p>
      ) : null}
      {clients?.length ? (
        <QuoteEditor
          key={`${id || "new"}:${revision}`}
          locale={locale}
          slug={company.slug}
          id={id || randomUUID()}
          revision={revision}
          clients={clients}
          initial={initial}
        />
      ) : (
        <div className="panel">
          <p>{t.noClients}</p>
          <Link className="button" href={`${base}/clients`}>
            {messages(locale).addClient}
          </Link>
        </div>
      )}
    </>
  );
}
