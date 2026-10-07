"use server";
import { redirect } from "next/navigation";
import { database,configured } from "@/lib/supabase";
import {localeOf} from "@/lib/i18n";
import {validEmail} from "@/lib/validation";
function input(form:FormData){return {locale:localeOf(form.get("locale")),email:String(form.get("email")||"").trim().toLowerCase(),password:String(form.get("password")||"")};}
export async function login(form:FormData){const {locale,email,password}=input(form);if(!configured())redirect(`/${locale}/login?notice=unavailable`);if(!validEmail(email)||!password||password.length>256)redirect(`/${locale}/login?notice=invalidForm`);const db=await database();const {error}=await db.auth.signInWithPassword({email,password});if(error)redirect(`/${locale}/login?notice=invalidCredentials`);redirect(`/${locale}/workspace`);}
export async function signup(form:FormData){const {locale,email,password}=input(form);if(!configured())redirect(`/${locale}/login?notice=unavailable`);if(!validEmail(email)||password.length<12||password.length>256)redirect(`/${locale}/login?notice=invalidForm`);const db=await database();const site=process.env.NEXT_PUBLIC_SITE_URL;const {error,data}=await db.auth.signUp({email,password,options:site?{emailRedirectTo:`${site}/auth/callback`}:undefined});if(error)redirect(`/${locale}/login?notice=authFailed`);if(data.session)redirect(`/${locale}/workspace`);redirect(`/${locale}/login?notice=confirmEmail`);}
export async function logout(form:FormData){const locale=localeOf(form.get("locale"));const db=await database();await db.auth.signOut();redirect(`/${locale}/login`);}
