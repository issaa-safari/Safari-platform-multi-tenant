import { localeOf, messages } from "@/lib/i18n";
import { configured } from "@/lib/supabase";
import Notice from "@/components/notice";
import SubmitButton from "@/components/submit-button";
import { login, signup } from "./actions";
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ notice?: string }>;
}) {
  const locale = localeOf((await params).locale);
  const t = messages(locale);
  const { notice } = await searchParams;
  return (
    <section className="auth-section wrap">
      <div className="auth-story">
        <p className="eyebrow">{t.account}</p>
        <h1>{t.authTitle}</h1>
        <p className="lede">{t.authIntro}</p>
        <div className="auth-photo" />
      </div>
      <div className="panel auth-panel">
        <h2>{t.login}</h2>
        <Notice code={configured() ? notice : "unavailable"} locale={locale} />
        <form action={login} className="form">
          <input type="hidden" name="locale" value={locale} />
          <label>
            {t.email}
            <input
              type="email"
              name="email"
              autoComplete="email"
              required
              maxLength={254}
            />
          </label>
          <div>
            <label htmlFor="password">
              {t.password}
              <input
                id="password"
                type="password"
                name="password"
                autoComplete="current-password"
                required
                maxLength={256}
                aria-describedby="password-hint"
              />
            </label>
            <small id="password-hint">{t.passwordHint}</small>
          </div>
          <SubmitButton pending={t.loading}>{t.login} ↗︎</SubmitButton>
          <SubmitButton action={signup} pending={t.loading}>
            {t.signup}
          </SubmitButton>
        </form>
      </div>
    </section>
  );
}
