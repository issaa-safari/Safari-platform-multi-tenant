import Link from "next/link";
import { localeOf, messages, dateTime } from "@/lib/i18n";
import { quoteMessages } from "@/lib/quote-messages";
import { requireCompany } from "@/lib/workspace";
import { canManageClients } from "@/lib/validation";
import Notice from "@/components/notice";
import { currencyDigits } from "../../../../../../packages/pricing/src/money.ts";
import { countByGroup, QUOTE_GROUPS } from "@/lib/status-groups";
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<{ notice?: string }>;
}) {
  const { locale: raw, slug } = await params;
  const locale = localeOf(raw);
  const t = quoteMessages(locale);
  const { db, company, role } = await requireCompany(locale, slug);
  if (!canManageClients(role))
    return <p className="notice">{messages(locale).memberReadOnly}</p>;
  const { data, error } = await db
    .from("company_quote_drafts")
    .select(
      "id,title,currency,total_minor,revision,updated_at,start_date,end_date",
    )
    .eq("company_id", company.id)
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw new Error("Quote list failed");
  const quotes = data || [];
  const base = `/${locale}/workspace/${company.slug}/quotes`;
  const count = countByGroup(
    QUOTE_GROUPS,
    quotes.map(() => ({ status: "draft" })),
  ).draft;
  return (
    <>
      <p className="eyebrow">{company.name}</p>
      <h1>{t.quotes}</h1>
      <p className="lede">{t.intro}</p>
      <Notice code={(await searchParams).notice} locale={locale} />
      <div className="quote-toolbar">
        <span className="pill">
          {t.draft} · {count}
        </span>
        <Link href={`${base}/new`} className="button">
          {t.newQuote}
        </Link>
      </div>
      <p className="notice">{t.draftNotice}</p>
      {quotes.length ? (
        <div className="client-list">
          {quotes.map((q) => (
            <article className="panel" key={q.id}>
              <div className="client-row-title">
                <h2>{q.title}</h2>
                <Link className="text-link" href={`${base}/${q.id}`}>
                  {t.edit}
                </Link>
              </div>
              <p>
                {q.start_date} → {q.end_date}
              </p>
              <p>
                {t.total}:{" "}
                <strong>
                  {new Intl.NumberFormat(locale, {
                    style: "currency",
                    currency: q.currency,
                  }).format(
                    (q.total_minor ??
                      (() => {
                        throw new Error("Quote total missing");
                      })()) /
                      10 ** currencyDigits(q.currency),
                  )}
                </strong>
              </p>
              <small>
                {t.revision} {q.revision} ·{" "}
                {dateTime(q.updated_at, locale, company.time_zone)}
              </small>
            </article>
          ))}
        </div>
      ) : (
        <div className="panel empty">
          <p>{t.noQuotes}</p>
        </div>
      )}
    </>
  );
}
