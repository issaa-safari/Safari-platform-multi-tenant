import type { Metadata } from "next";
import { headers } from "next/headers";
import { directionOf, localeOf } from "@/lib/i18n";
import "./globals.css";
export const metadata: Metadata = {
  title: {
    default: "Safari Platform — Your next horizon",
    template: "%s | Safari Platform",
  },
  description:
    "An international safari marketplace and private workspace for tour companies.",
};
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const h = await headers();
  const locale = localeOf(h.get("x-app-locale"));
  return (
    <html data-scroll-behavior="smooth" lang={locale} dir={directionOf(locale)}>
      <body>{children}</body>
    </html>
  );
}
