import Link from "next/link";
import { cookies } from "next/headers";
import { localeOf, messages } from "@/lib/i18n";
export default async function NotFound() {
  const locale = localeOf((await cookies()).get("locale")?.value);
  const t = messages(locale);
  return (
    <section className="wrap section">
      <h1>{t.notFound}</h1>
      <Link className="button" href={`/${locale}`}>
        {t.home}
      </Link>
    </section>
  );
}
