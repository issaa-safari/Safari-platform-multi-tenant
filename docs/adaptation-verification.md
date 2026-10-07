# Existing-system adaptation verification

Source pinned at Safari-duplicate `b8e860942bb85a6bff8fab8c07fdfc2e3d434c84`.

Implemented: tenant-private quote drafts, company-client composite foreign key, date-aligned narrative itinerary, selling price lines and database-generated integer totals, explicit quote currency, includes/excludes, live role checks, metadata audit, and optimistic revision updates. Creation and editing each persist one record atomically. No public draft access, delivery tokens or booking acceptance are enabled.

Verified during implementation:

- 94 tests from five copied source-domain suites passed in an isolated runner.
- 20 tests in the new repository passed, including 12 port/adaptation checks.
- TypeScript validation and production build passed.
- 23 new database quote checks passed: cross-company reads/writes and client attachment denied, role boundaries/revocation, malformed/unpriced totals rejected, totals derived, revision guard and cascade cleanup.
- Original 28 database foundation checks passed again. All SQL fixtures rolled back.

All three browser journeys passed: localized public catalogue/mobile route, unauthenticated private access, and confirmed account → company → client create/edit → two-day quote create/edit → stale-tab conflict → company settings → sign-out. The quote retained revision 2, EUR 300.03, and exactly one client/quote; changing the company base currency to GBP did not change the saved quote's EUR currency. The private editor also passed the 390px overflow check and desktop/mobile visual inspection. The synthetic account, sessions and company were removed afterward; cleanup query confirmed zero test users/companies and no remaining quote drafts.

The browser test uses an isolated confirmed synthetic account in the new pilot project, not a real email-registration flow. Saved desktop/mobile screenshots and failure traces remain ignored local artifacts, not repository data.

GitHub main is the source for the new Vercel project. The updated pilot preview is [safari-platform-multi-tenant-preview.vercel.app](https://safari-platform-multi-tenant-preview.vercel.app/en). Preview/development use the new database; production remains without database configuration. Hosting verification checks the final deployment state, source commit, localized public pages, sign-in form and private-route redirect after publication.

Security advisor: no table/function/storage findings. Existing warning: [leaked password protection is disabled](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection). Auth site/redirect URLs and email delivery remain onboarding setup; this release does not change those settings.

Limitations: the reusable rate/balance package is tested, but supplier-rate fetching and a payment ledger UI are not connected yet. The editor currently takes selling prices entered by staff. Private drafts are editable; immutable sent proposal snapshots will be introduced as a separate workflow. Draft deletion/archiving is not exposed. Client/quote selectors show the first 100 records; search/pagination is a later workspace task.
