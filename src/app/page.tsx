import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { localeOf } from "@/lib/i18n";
export default async function Page() {
  redirect(`/${localeOf((await cookies()).get("locale")?.value)}`);
}
