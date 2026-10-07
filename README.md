# Safari Platform

A new international safari marketplace and multi-tenant workspace for tour companies. This repository is independent of `Safari-duplicate`; no original production services are reused.

## Foundation release

- Public preview catalogue with clearly labeled sample routes; no bookable offers or fabricated reviews.
- Locale routing and message catalogues for English, French and Spanish, with extensible locale and direction handling.
- Supabase account sign-in/registration and company creation/switching.
- Company-specific language, currency, country and IANA time-zone settings.
- Private client records with database-enforced company and role permissions.
- Private storage access policies, audit events and real database isolation checks.

Quotes, bookings, operator publication, configurator, traveler/supplier portals and subscriptions are planned next. International architecture does not imply that every language is translated or every country supports payments.

## Development

Use Node.js 22 or later. Run `npm ci`, copy `.env.example` to `.env.local`, and configure the URL and **publishable** key of a development Supabase project. No service-role key is required by this application.

Link your own Vercel development project and verify environment configuration before running database migrations or `npm run dev`. Never connect local or preview writes to an unrelated production database.

```sh
npm test
npm run typecheck
npm run build
npm run dev
```

Apply the tracked foundation migration to an empty Supabase database. The SQL test under `supabase/tests/` uses a transaction and rolls back its synthetic fixtures. It must run against a disposable development database as an administrative test runner, not from browser code.

### Authentication configuration

Set Supabase Auth's Site URL and allowed redirect URL to the deployment URL and `/auth/callback`. Keep email confirmation enabled. The default Supabase mail sender has restrictions; configure a production SMTP provider before broad user onboarding. Never disable email confirmation as a workaround for delivery failures.

### Access model

Company membership is stored in the database, not editable user metadata. Caller-scoped server clients respect RLS. Owner/admin roles manage settings; owner/admin/consultant roles manage CRM; finance does not have blanket CRM access. No direct membership mutation grants exist. Company creation is an atomic authorized RPC implemented through a narrowly scoped private function. The application does not use a service-role key.

### Deployment

GitHub `main` is the source for the new Vercel project. Public Supabase config belongs in Vercel environment variables. Production and preview databases must be separately configured before a public release; previews should not share production customer data.
