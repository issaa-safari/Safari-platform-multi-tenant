import Link from "next/link";
import { localeOf, messages } from "@/lib/i18n";
import { requireUser, type Company } from "@/lib/workspace";
import { logout } from "../login/actions";
import SubmitButton from "@/components/submit-button";
export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const locale = localeOf((await params).locale);
  const t = messages(locale);
  const { db, user } = await requireUser(locale);
  const { data: companies, error } = await db
    .from("companies")
    .select(
      "id,slug,name,country_code,base_currency,default_locale,time_zone,created_at",
    )
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw new Error("Workspace list failed");
  return (
    <section className="wrap section">
      <div className="page-heading">
        <div>
          <p className="eyebrow">{user.email}</p>
          <h1>{t.yourCompanies}</h1>
          <p className="lede">{t.companyListIntro}</p>
        </div>
        <form action={logout}>
          <input type="hidden" name="locale" value={locale} />
          <SubmitButton>{t.logout}</SubmitButton>
        </form>
      </div>
      <div className="workspace-grid">
        {(companies as Company[]).map((company) => (
          <Link
            className="panel workspace-card"
            key={company.id}
            href={`/${locale}/workspace/${company.slug}`}
          >
            <div className="avatar">{company.name.charAt(0)}</div>
            <h2>{company.name}</h2>
            <p>
              {company.country_code} · {company.base_currency} ·{" "}
              {company.time_zone}
            </p>
            <span className="text-link">{t.open} ↗︎</span>
          </Link>
        ))}
        <Link
          className="panel workspace-card create-card"
          href={`/${locale}/workspace/new`}
        >
          <span className="feature-number">+</span>
          <h2>{t.createCompany}</h2>
          <p>{companies?.length ? t.newCompany : t.noCompanies}</p>
        </Link>
      </div>
    </section>
  );
}
