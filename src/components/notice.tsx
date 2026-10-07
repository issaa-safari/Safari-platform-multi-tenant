import {messages,type Locale,type MessageKey} from "@/lib/i18n";
const allowed=["saved","duplicate","denied","failed","invalidForm","unavailable","confirmEmail","invalidCredentials","authFailed"];
export default function Notice({code,locale}:{code?:string;locale:Locale}){if(!code||!allowed.includes(code))return null;return <p role="status" className={`notice ${["saved","confirmEmail"].includes(code)?"success":""}`}>{messages(locale)[code as MessageKey]}</p>;}
