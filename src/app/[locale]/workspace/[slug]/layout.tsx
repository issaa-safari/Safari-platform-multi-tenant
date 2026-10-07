import Link from "next/link";
import { localeOf, messages } from "@/lib/i18n";
import { requireCompany } from "@/lib/workspace";
import { canManageClients, canManageSettings } from "@/lib/validation";
import { quoteMessages } from "@/lib/quote-messages";
export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: raw, slug } = await params;
  const locale = localeOf(raw);
  const t = messages(locale);
  const { company, role } = await requireCompany(locale, slug);
  const base = `/${locale}/workspace/${company.slug}`;
  return (
    <div className="workspace-shell wrap">
      <aside className="sidebar">
        <Link className="text-link" href={`/${locale}/workspace`}>
          <span aria-hidden="true">←</span> {t.yourCompanies}
        </Link>
        <div className="company-label">
          <span className="avatar">{company.name.charAt(0)}</span>
          <h2>{company.name}</h2>
          <span className="pill">{role}</span>
        </div>
        <nav aria-label={t.workspace}>
          <Link href={base}>{t.dashboard}</Link>
          {canManageClients(role) && (
            <Link href={`${base}/clients`}>{t.clients}</Link>
          )}
          {canManageClients(role) && (
            <Link href={`${base}/quotes`}>{quoteMessages(locale).quotes}</Link>
          )}
          {canManageSettings(role) && (
            <Link href={`${base}/settings`}>{t.settings}</Link>
          )}
        </nav>
        <div className="sidebar-meta">
          <p>
            {company.country_code} · {company.base_currency}
          </p>
          <p>{company.time_zone}</p>
        </div>
      </aside>
      <div className="workspace-main">{children}</div>
    </div>
  );
}
