import { notFound } from "next/navigation";
import Link from "next/link";
import { samples } from "@/lib/samples";
import { localeOf, messages } from "@/lib/i18n";
export default async function Page({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale: raw, id } = await params;
  const locale = localeOf(raw);
  const t = messages(locale);
  const trip = samples.find((x) => x.id === id);
  if (!trip) notFound();
  return (
    <>
      <div
        className="detail-image"
        style={{ backgroundImage: `url('${trip.image}')` }}
      />
      <section className="wrap section detail">
        <Link className="text-link" href={`/${locale}/safaris`}>
          ← {t.back}
        </Link>
        <p className="eyebrow">
          {t[trip.country]} · {trip.days} {t.days}
        </p>
        <h1>{t[trip.title]}</h1>
        <p className="lede">{t[trip.description]}</p>
        <p className="notice">{t.previewNote}</p>
        <h2>{t.route}</h2>
        <div className="route-list">
          {trip.route.map((place, i) => (
            <article key={place}>
              <span className="feature-number">0{i + 1}</span>
              <div>
                <h3>{place}</h3>
                <p>{t.sampleDay}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
