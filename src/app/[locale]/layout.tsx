import { notFound } from "next/navigation";
import { locales, localeOf, messages } from "@/lib/i18n";
import Header from "@/components/header";
export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!locales.includes(raw as (typeof locales)[number])) notFound();
  const locale = localeOf(raw);
  const t = messages(locale);
  return (
    <>
      <a className="skip" href="#main">
        {t.skip}
      </a>
      <Header locale={locale} />
      <main id="main">{children}</main>
      <footer className="footer wrap">
        <a className="brand" href={`/${locale}`}>
          Safari<span>Platform</span>
        </a>
        <p>{t.footer}</p>
        <span className="pill">{t.firstRelease}</span>
      </footer>
    </>
  );
}
