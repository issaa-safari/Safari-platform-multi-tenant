"use client";
import Link from "next/link";
import {usePathname,useRouter,useSearchParams} from "next/navigation";
import {languageNames,locales,messages,type Locale} from "@/lib/i18n";
export default function Header({locale}:{locale:Locale}) {
 const path=usePathname();const router=useRouter();const t=messages(locale);
 return <header className="header"><div className="wrap header-inner"><Link className="brand" href={`/${locale}`} aria-label="Safari Platform">Safari<span>Platform</span></Link><nav aria-label="Main"><Link className={path.includes("safaris")?"active":""} href={`/${locale}/safaris`}>{t.explore}</Link><Link className={path.includes("companies")?"active":""} href={`/${locale}/companies`}>{t.companies}</Link></nav><div className="header-actions"><label className="sr-only" htmlFor="language">{t.language}</label><select id="language" aria-label={t.language} value={locale} onChange={e=>{const next=e.target.value;document.cookie=`locale=${next}; path=/; max-age=31536000; SameSite=Lax`;router.push(path.replace(/^\/(en|fr|es)(?=\/|$)/,`/${next}`));}}>{locales.map(l=><option key={l} value={l}>{languageNames[l]}</option>)}</select><Link className="button small outline" href={`/${locale}/workspace`}>{t.workspace}<span aria-hidden="true">↗</span></Link></div></div></header>;
}
