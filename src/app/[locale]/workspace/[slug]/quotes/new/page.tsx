import QuoteDraftPage from "@/components/quote-draft-page";
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<{ notice?: string }>;
}) {
  const { locale, slug } = await params;
  return (
    <QuoteDraftPage
      rawLocale={locale}
      slug={slug}
      notice={(await searchParams).notice}
    />
  );
}
