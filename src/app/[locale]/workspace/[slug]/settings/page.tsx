import { localeOf, messages } from "@/lib/i18n";
import { requireCompany } from "@/lib/workspace";
import { canManageSettings } from "@/lib/validation";
import Notice from "@/components/notice";
import RegionalFields from "@/components/regional-fields";
import SubmitButton from "@/components/submit-button";
import { saveSettings } from "../../actions";
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<{ notice?: string }>;
}) {
  const { locale: raw, slug } = await params;
  const locale = localeOf(raw);
  const t = messages(locale);
  const { company, role } = await requireCompany(locale, slug);
  if (!canManageSettings(role)) return <p className="notice">{t.denied}</p>;
  return (
    <>
      <p className="eyebrow">{company.name}</p>
      <h1>{t.settings}</h1>
      <p className="lede">{t.settingsIntro}</p>
      <div className="panel">
        <Notice code={(await searchParams).notice} locale={locale} />
        <form className="form" action={saveSettings}>
          <input type="hidden" name="locale" value={locale} />
          <input type="hidden" name="slug" value={company.slug} />
          <label>
            {t.companyName}
            <input
              name="name"
              required
              minLength={2}
              maxLength={120}
              defaultValue={company.name}
            />
          </label>
          <RegionalFields locale={locale} company={company} />
          <SubmitButton pending={t.loading}>{t.saveSettings}</SubmitButton>
        </form>
      </div>
    </>
  );
}
