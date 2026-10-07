import {localeOf,messages} from "@/lib/i18n";
import {requireUser} from "@/lib/workspace";
import RegionalFields from "@/components/regional-fields";
import Notice from "@/components/notice";
import SubmitButton from "@/components/submit-button";
import {createCompany} from "../actions";
export default async function Page({params,searchParams}:{params:Promise<{locale:string}>;searchParams:Promise<{notice?:string}>}){const locale=localeOf((await params).locale);const t=messages(locale);await requireUser(locale);return <section className="section wrap narrow"><p className="eyebrow">{t.workspace}</p><h1>{t.createCompany}</h1><p className="lede">{t.feature2body}</p><div className="panel"><Notice code={(await searchParams).notice} locale={locale}/><form action={createCompany} className="form"><input type="hidden" name="locale" value={locale}/><label>{t.companyName}<input name="name" required minLength={2} maxLength={120} autoComplete="organization"/></label><label>{t.slug}<input name="slug" required pattern="[a-z0-9][a-z0-9-]{1,61}[a-z0-9]" minLength={3} maxLength={63} placeholder="your-company"/><small>{t.slugHint}</small></label><RegionalFields locale={locale}/><SubmitButton pending={t.loading}>{t.create} ↗</SubmitButton></form></div></section>;}
