import Link from "next/link";
import { localeOf, messages } from "@/lib/i18n";
import { requireCompany } from "@/lib/workspace";
import { canManageClients } from "@/lib/validation";
export default async function Page({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: raw, slug } = await params;
  const locale = localeOf(raw);
  const t = messages(locale);
  const { db, company, role } = await requireCompany(locale, slug);
  const { count: members, error: memberError } = await db
    .from("company_memberships")
    .select("user_id", { count: "exact", head: true })
    .eq("company_id", company.id)
    .eq("active", true);
  if (memberError) throw new Error("Member count failed");
  let clients: number | null = null;
  if (canManageClients(role)) {
    const result = await db
      .from("company_clients")
      .select("id", { count: "exact", head: true })
      .eq("company_id", company.id);
    if (result.error) throw new Error("Client count failed");
    clients = result.count;
  }
  return (
    <>
      <p className="eyebrow">{t.workspaceId}</p>
      <h1>{t.dashboard}</h1>
      <p className="lede">{t.manageIntro}</p>
      <div className="stat-grid">
        {clients !== null && (
          <article className="panel">
            <p>{t.clientCount}</p>
            <strong>{new Intl.NumberFormat(locale).format(clients)}</strong>
          </article>
        )}
        <article className="panel">
          <p>{t.members}</p>
          <strong>{members || 0}</strong>
        </article>
        <article className="panel">
          <p>{t.baseCurrency}</p>
          <strong>{company.base_currency}</strong>
        </article>
      </div>
      {canManageClients(role) && (
        <div className="panel next-step">
          <h2>{t.clients}</h2>
          <p>{t.clientIntro}</p>
          <Link
            className="button"
            href={`/${locale}/workspace/${slug}/clients`}
          >
            {t.addClient} ↗︎
          </Link>
        </div>
      )}
    </>
  );
}
