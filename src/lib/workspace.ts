import "server-only";
import { cache } from "react";
import { redirect, notFound } from "next/navigation";
import { configured, database } from "./supabase";
import type { Role } from "./validation";
export type Company = {id:string;slug:string;name:string;country_code:string;base_currency:string;default_locale:string;time_zone:string;created_at:string};
export const requireUser = cache(async (locale: string) => {
  if (!configured()) redirect(`/${locale}/login?notice=unavailable`);
  const db = await database();
  const {data,error}=await db.auth.getUser();
  if(error || !data.user) redirect(`/${locale}/login`);
  return {db,user:data.user};
});
export const requireCompany = cache(async (locale:string, slug:string) => {
  const {db,user}=await requireUser(locale);
  const {data:company,error}=await db.from("companies").select("id,slug,name,country_code,base_currency,default_locale,time_zone,created_at").eq("slug",slug).maybeSingle();
  if(error) throw new Error("Company lookup failed");
  if(!company) notFound();
  const {data:membership,error:membershipError}=await db.from("company_memberships").select("role").eq("company_id",company.id).eq("user_id",user.id).eq("active",true).maybeSingle();
  if(membershipError || !membership) notFound();
  return {db,user,company:company as Company,role:membership.role as Role};
});
