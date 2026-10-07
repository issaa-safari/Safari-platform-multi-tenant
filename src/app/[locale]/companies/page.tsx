import Link from "next/link";
import { localeOf, messages } from "@/lib/i18n";
export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const locale = localeOf((await params).locale);
  const t = messages(locale);
  return (
    <section className="section wrap">
      <div className="company-hero">
        <p className="eyebrow">{t.companyEyebrow}</p>
        <h1>{t.companyTitle}</h1>
        <p className="lede">{t.companyIntro}</p>
        <Link className="button" href={`/${locale}/workspace/new`}>
          {t.companyCta} ↗︎
        </Link>
      </div>
      <div className="feature-grid">
        {([1, 2, 3] as const).map((i) => (
          <article className="panel" key={i}>
            <span className="feature-number">0{i}</span>
            <h3>{t[`feature${i}`]}</h3>
            <p>{t[`feature${i}body`]}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
