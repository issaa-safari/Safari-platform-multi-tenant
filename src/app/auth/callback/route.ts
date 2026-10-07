import { NextResponse, type NextRequest } from "next/server";
import { database } from "@/lib/supabase";
import { localeOf } from "@/lib/i18n";
export async function GET(request: NextRequest) {
  const locale = localeOf(request.cookies.get("locale")?.value);
  const code = request.nextUrl.searchParams.get("code");
  if (code) {
    const db = await database();
    const { error } = await db.auth.exchangeCodeForSession(code);
    if (!error)
      return NextResponse.redirect(
        new URL(`/${locale}/workspace`, request.url),
      );
  }
  return NextResponse.redirect(
    new URL(`/${locale}/login?notice=invalidCredentials`, request.url),
  );
}
