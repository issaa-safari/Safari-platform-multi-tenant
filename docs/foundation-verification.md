# Foundation verification — 7 October 2026

## What is built

This is the first implementation slice: public sample catalogue, locale infrastructure, sign-in/registration UI, atomic company creation, company switching, regional settings and tenant-isolated client create/edit workflows. It is not the completed marketplace or booking product.

## Evidence

| Check | Result |
|---|---|
| Unit tests | 8 passed: locale fallback/dictionary coverage, currency precision, time-zone display, extensible direction handling, role permissions and input validation |
| TypeScript | `npm run typecheck` passed |
| Local production build | `npm run build` passed; validation remains enabled |
| Real database tests | 28 checks passed against the new Supabase project; two-company access, CRUD denial, role boundaries, storage access, live revocation, atomic owner creation, normalized email uniqueness and audit cleanup |
| Browser catalogue | English → French navigation, HTML language, destination filter, route detail, sample notice and mobile overflow check passed |
| Browser unauthenticated access | Spanish workspace redirects to Spanish sign-in |
| Browser authenticated journey | Confirmed synthetic account → company creation → client create → edit existing client → settings update → sign-out → private page denied |
| Database reconciliation | Browser-created company retained GBP and Europe/Paris settings, with exactly one client after editing |
| Synthetic data cleanup | Test accounts and companies removed; database cleanup query confirmed zero remaining fixtures |
| Migration history | Local filenames aligned with the provider's recorded versions after application; three migrations in order |

Initial browser failures found stale HTML language on client navigation, an accessible password label containing its hint, and overly fast test interaction with an unfinished route transition. These were resolved; the client-edit scenario explicitly waits for the edit form and asserts that the record count remains one. A real audit-trigger issue during company cascade deletion was fixed with a separate migration and regression check.

## Deployment boundaries

- GitHub: `issaa-safari/Safari-platform-multi-tenant`.
- Vercel project: `safari-platform-multi-tenant`, in `kssas-projects`.
- Supabase project: `dswaejtrpobsrapczscg`, `eu-west-1`, new development/pilot database.
- Supabase config is bound to preview/local development; production has no database credentials yet.
- No service-role key is used by the application. Original operator source and production services remain untouched.

## Remaining setup and verification

Public registration/email confirmation delivery has not been verified. Before onboarding users, configure the new project's Auth Site URL to `https://safari-platform-multi-tenant-preview.vercel.app` and allow `https://safari-platform-multi-tenant-preview.vercel.app/auth/callback`. The connected tools do not expose Auth configuration updates. The default email sender has restrictions; configure a suitable SMTP provider before broad onboarding.

The final security-advisor check reports **leaked password protection disabled**. Review [Supabase's password-security guidance](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection) and available plan support before public onboarding. No paid upgrade was performed. No table/function/storage security findings were reported by that check.

Browser tests used an isolated, confirmed synthetic account created administratively in the development project; they do not establish that a real registration email was delivered. Browser visual inspection covered the public landing page, and interaction tests covered a mobile route detail; this is not a complete accessibility or device certification.

Next implementation: staff invitations and membership administration, followed by tenant-safe itinerary/quote authoring and enquiry-to-booking workflows. Supplier and traveler sharing grants need their own policies before those portals are enabled.
