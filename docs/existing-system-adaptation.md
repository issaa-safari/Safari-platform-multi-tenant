# Step 0: existing system audit and adaptation

Reviewed 7 October 2026. Source: [Safari-duplicate](https://github.com/issaa-safari/Safari-duplicate), pinned at **b8e860942bb85a6bff8fab8c07fdfc2e3d434c84**. A full Git clone exists in a separate local reference directory. No commits, configuration, migrations or data writes were made to the original repository or its services. Its local reference checkout remained clean.

The [user's attached requirements](requirements/domains-admin-and-process.md) are retained as a product brief. Their competitor figures and regulatory statements are supplied research, not newly verified facts. Their embedded planning-only prompt does not describe this implementation release.

## Verified existing features

| Area | Evidence in source | Adaptation decision |
| --- | --- | --- |
| Operator workspace | `app/admin/`, `PRODUCT.md` | Treat this as the company workspace. Build a separate platform-owner console; company owner is not platform owner. |
| Client and enquiry management | `lib/server/clients.ts`, `app/admin/requests/`, `lib/server/enquiry-intake.ts` | Keep the workflow; every record and relation needs a company boundary. Client create/edit already implemented in the new app. |
| Day-by-day quote authoring | `app/admin/trip-builder/actions.ts`, `app/api/admin/save-quote-itinerary/route.ts` | First adaptation implemented: private quote drafts, ordered narrative days, selling lines, inclusions/exclusions and revision checks. |
| Seasonal supplier pricing | `lib/rate-resolution.ts` | Ported pure rules into `packages/pricing`; retains per-service-date seasons, residency/category matching, child percentage rates, stay/hire segmentation. |
| Price arithmetic | `lib/pricing.ts` | Carry over the single shared pricing-engine principle. New entered selling amounts use integer minor units; no supplier-cost/markup UI yet. |
| Payment balances | `lib/balance.ts`, `lib/server/accounting.ts` | Refund-aware balance arithmetic ported into the pure package; fetching and ledger integration deferred. |
| Invoices | `lib/invoice.ts`, `app/admin/finance/invoices/`, migrations `group_76`, `group_77` | Carry over derived paid status, allocation and immutable issuance concepts; needs tenant-bound tables and transactions before enabling. |
| Proposal delivery and acceptance | `app/quote/[token]/`, `lib/server/quote-booking.ts`, `group_95_transactional_booking_quote_acceptance.sql` | Reuse transaction/state concepts; build recipient, expiry, revocation, immutable versions, idempotency and same-company checks. Not enabled by draft editor. |
| Bookings and departures | `app/admin/bookings/`, `app/admin/departures/`, `lib/server/create-booking.ts` | Next port after proposals; retain transactional capacity control. |
| Supplier directory and payables | `app/admin/suppliers/`, `app/admin/finance/payables/` | Adapt company-private supplier relationships; new supplier portal requires per-service grants, not company membership. |
| Vouchers, travelers and readiness | `app/admin/vouchers/`, `lib/server/vouchers.ts`, `lib/trip-readiness.ts` | Reuse checklists and voucher concepts; minimize personal data and add recipient-specific access. |
| Activities, parks, lodges, vehicles and rates | `app/admin/content/`, original migrations | Separate canonical platform content from private company contracts and approved public snapshots. No historical catalogue imported. |
| Automation and communication | `lib/automation.ts`, `app/api/cron/daily-automation/`, WhatsApp routes | Rebuild around an outbox, retryable jobs, tenant-scoped credentials and signed webhooks. Company WhatsApp deferred per brief. |
| International rendering | `lib/i18n.ts`, original `PRODUCT.md` EN/AR approach | Keep direction-aware principles, replace fixed bilingual records with extensible locale catalogues. New UI has EN/FR/ES; more translations are future work. |
| Pipeline grouping | `lib/status-groups.ts` | Utility ported with provenance; labels translated in the UI. Current quote release exposes only drafts. |

The reference includes 214 files under `app/admin`, 26 under `app/api`, and 104 migration/seed files; these counts are files, not completed features or pages.

## What cannot be copied unchanged

The source uses `createAdminClient()` with `SUPABASE_SERVICE_ROLE_KEY`, including its trip-builder actions. That is a broad privilege boundary suitable only behind carefully checked authorization; it is not the default query path for the new tenant product. The source's active-admin gate in `group_56_admin_active_rls.sql` checks an active admin by email; it does not itself provide company isolation.

Original source and migration files establish intended structure, not the current state of the original production database. No original database, Auth settings, storage objects, integration secrets or real customer records were inspected or migrated. This is a scoped reuse audit, not a full security audit of the original system.

The original rate resolver returned zero for a matched rate with neither amount nor percentage. The port blocks that missing price, validates amounts and impossible dates, and supports quote currencies with zero/two/three fractional digits. Its FX snapshot names the quote currency and timestamp instead of assuming USD. Contract precision and a full FX/source policy still need implementation before automatic quotes are enabled.

## Source tests and new verification

Five original pure test suites were executed on copied source modules in an isolated runner using Vitest 4.1.9: pricing, rate resolution, balance, invoices and status groups. **94 tests passed.** This does not claim the original repository's entire test suite or deployment passed. The runner needed the status-color dependency for the grouping suite; no original integration credentials were used.

New CI runs the foundation and adapted-domain tests. See [adaptation verification](adaptation-verification.md) for current database/browser results. Future ports must bring their corresponding original tests and add cross-company allow/deny tests; simply copying a route is not sufficient.

## Requirements carried forward

| Requirement | Default and remaining work |
| --- | --- |
| Business model | Workspace subscriptions first; operators remain responsible for traveler payments at launch. No platform custody or automated payout implementation. |
| Hosts | Plan `www`, `app`, `supplier`, `admin`, `auth`, `api`, `help`, `status`; use path families in this preview. Brand/domain not yet selected, so no DNS or paid domain changes made. |
| Host security | Host selects audience, grants no permission. Implement host-local sessions and allowlisted sign-in return URLs before domain split; admin requires MFA and privileged-action audit. |
| Public content | Approved allowlisted snapshots only. Private drafts are not public listings or traveler proposals. |
| Admin | Platform roles distinct from company staff. Verification/expiry, moderation, subscriptions, reference data, operations and controlled support grants are separate milestones. |
| Data | One tenant database with RLS, company-bound foreign keys, explicit grants, private documents and audit metadata without personal payloads. Separate production infrastructure before real onboarding. |
| International | Locale catalogues, explicit choice, RTL support path, date-only seasons, IANA zones and contractual currencies. Initial quote currencies are an explicit supported set, not all global currencies. |
| Validation | Legal role, launch-country licensing, payment provider eligibility, pilot operators and acquisition plan remain to be verified. No supplied competitor prices used as pricing commitments. |

## Port sequence and gates

1. **Completed first port:** private client-linked day-by-day quote drafts, pure seasonal rate and refund-aware balance rules, revision protection and tenant tests.
2. **Team + commercial policy:** invite/revoke staff, supplier rate editor, approved cost/markup pricing, deposit/payment schedules and cancellation policy snapshots. Gate: multi-company relation tests and currency boundaries.
3. **Proposals → bookings:** immutable sent versions, authorized recipient links, expiry/revocation, transactional acceptance and capacity, amendments/cancellations, invoice/payment recording. Gate: replay/concurrency tests and two-company browser journey.
4. **Verification + storefront:** company documents/expiry and real platform-admin MFA/roles, moderation and approved listing snapshots. Gate: unpublished/private data unavailable publicly.
5. **Marketplace + traveler journey:** search, approved-option configurator using the same pricing engine, limited enquiry fan-out, traveler account, documents and reviews. Gate: operator/traveler authorization and acceptance lifecycle.
6. **Supplier collaboration:** scoped requests/responses, operator approval, minimal voucher fields. Gate: suppliers cannot read CRM or competitors' services.
7. **Paid workspace + operations:** server entitlements, signed billing events, outbox/expiry jobs, observability, backup/restore and pilot launch gates.

The attached 37–54 engineering person-week estimate is a planning range for the whole product, not a promise that cloning source finishes it. Reuse reduces re-invention, but tenancy, marketplace publishing and platform administration are substantial new work.
