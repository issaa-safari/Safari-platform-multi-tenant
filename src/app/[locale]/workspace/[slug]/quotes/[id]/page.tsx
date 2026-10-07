import QuoteDraftPage from "@/components/quote-draft-page";
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; slug: string; id: string }>;
  searchParams: Promise<{ notice?: string }>;
}) {
  const { locale, slug, id } = await params;
  return (
    <QuoteDraftPage
      rawLocale={locale}
      slug={slug}
      id={id}
      notice={(await searchParams).notice}
    />
  );
}
