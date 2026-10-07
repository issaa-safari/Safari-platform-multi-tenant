import Link from "next/link";
import { localeOf, messages, dateTime } from "@/lib/i18n";
import { requireCompany } from "@/lib/workspace";
import { canManageClients } from "@/lib/validation";
import Notice from "@/components/notice";
import SubmitButton from "@/components/submit-button";
import { saveClient } from "../../actions";
type Client = {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  notes: string;
  updated_at: string;
};
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<{ notice?: string; edit?: string }>;
}) {
  const { locale: raw, slug } = await params;
  const locale = localeOf(raw);
  const t = messages(locale);
  const { db, company, role } = await requireCompany(locale, slug);
  const query = await searchParams;
  if (!canManageClients(role))
    return <p className="notice">{t.memberReadOnly}</p>;
  const { data, error } = await db
    .from("company_clients")
    .select("id,full_name,email,phone,notes,updated_at")
    .eq("company_id", company.id)
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw new Error("Client list failed");
  const clients = data as Client[];
  const edit = clients.find((c) => c.id === query.edit);
  return (
    <>
      <p className="eyebrow">{company.name}</p>
      <h1>{t.clients}</h1>
      <p className="lede">{t.clientIntro}</p>
      <Notice code={query.notice} locale={locale} />
      <div className="client-layout">
        <div>
          {clients.length ? (
            <div className="client-list">
              {clients.map((c) => (
                <article className="panel client-row" key={c.id}>
                  <div className="client-row-title">
                    <h3>{c.full_name}</h3>
                    <Link
                      className="text-link"
                      href={`?edit=${c.id}#client-form`}
                    >
                      {t.edit}
                    </Link>
                  </div>
                  {c.email && <p>{c.email}</p>}
                  {c.phone && <p>{c.phone}</p>}
                  {c.notes && <p className="client-notes">{c.notes}</p>}
                  <small>
                    {t.updated}:{" "}
                    {dateTime(c.updated_at, locale, company.time_zone)}
                  </small>
                </article>
              ))}
            </div>
          ) : (
            <div className="panel empty">
              <span className="feature-number">+</span>
              <p>{t.noClients}</p>
            </div>
          )}
        </div>
        <div className="panel" id="client-form">
          <h2>{edit ? t.editClient : t.addClient}</h2>
          <form className="form" action={saveClient} key={edit?.id || "new"}>
            <input type="hidden" name="locale" value={locale} />
            <input type="hidden" name="slug" value={company.slug} />
            {edit && <input type="hidden" name="id" value={edit.id} />}
            <label>
              {t.name}
              <input
                name="name"
                required
                minLength={2}
                maxLength={160}
                defaultValue={edit?.full_name}
              />
            </label>
            <label>
              {t.email}
              <input
                name="email"
                type="email"
                maxLength={254}
                defaultValue={edit?.email || ""}
              />
            </label>
            <label>
              {t.phone}
              <input
                name="phone"
                type="tel"
                maxLength={26}
                placeholder="+254…"
                pattern="\+[1-9][0-9 \(\)\-]{5,24}"
                defaultValue={edit?.phone || ""}
              />
            </label>
            <label>
              {t.notes}
              <textarea
                name="notes"
                rows={4}
                maxLength={4000}
                defaultValue={edit?.notes}
              />
            </label>
            <SubmitButton pending={t.loading}>{t.saveClient}</SubmitButton>
            {edit && (
              <Link
                className="text-link"
                href={`/${locale}/workspace/${slug}/clients`}
              >
                {t.cancel}
              </Link>
            )}
          </form>
        </div>
      </div>
    </>
  );
}
