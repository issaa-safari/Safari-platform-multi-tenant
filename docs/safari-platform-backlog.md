# Safari Platform — implementation backlog

Companion to [review and architecture plan](safari-platform-review-and-plan.md). All tickets apply to a new repository and separate services. The original application is unchanged.

Priority: P0 = prerequisite for the pilot or public launch identified below; P1 = needed for the full initial commercial release; P2 = subsequent release. Milestones and effort ranges are in the companion plan. A ticket is done only when its stated acceptance evidence exists.

## M0 — establish a reproducible starting point

| Ticket | Deliverable | Dependencies | Acceptance |
|---|---|---|---|
| F01 · P0 | Isolated repository/services and source provenance | None | New Git history/project ownership defined; original untouched; synthetic data and separate credentials; dev/staging/prod separated |
| F02 · P0 | Complete current-schema reconstruction and clean new baseline | F01 | All required tables/functions/indexes/policies/triggers present; fresh database replay succeeds with stop-on-error; generated types match schema |
| F03 · P0 | Verify current enquiry/quote/booking/finance vertical slice | F02 | Real DB, synthetic users and departure; quote acceptance creates consistent booking; invoice/balance calculations reconcile; report observed failures |
| F04 · P0 | Pilot requirements and commercial rules | F03 | Interview 3–5 target tour companies; document mandatory workflows, seats, currencies, retention, support, verification responsibility; finalize first-release scope |

## M1 — tenant foundation

| Ticket | Deliverable | Dependencies | Acceptance |
|---|---|---|---|
| T01 · P0 | Companies and membership lifecycle | F02 | Account creates company/owner atomically; owner/admin/consultant/finance roles; revoked members denied; last owner protected |
| T02 · P0 | Invitation and company switching | T01 | Expiring hashed invite, one-time acceptance, revocation; user can belong to two companies; active switch does not grant missing permissions |
| T03 · P0 | Ownership constraints and scoped uniqueness | T01 | Every private entity has company ownership; cross-company parent linkage fails in DB; same email/name/slug can safely occur in different companies |
| T04 · P0 | RLS, grants, action permissions, and RPC authorization | T03 | A/B allow/deny tests for read/create/update/delete; direct API calls cannot bypass UI; privileged operations constrain company and actor; no client secret keys |
| T05 · P0 | Company settings and document counters | T03/T04 | Independent currencies, defaults, bank instructions, branding; concurrent invoice/quote numbering is unique within company and correct on output |
| T06 · P0 | Company-private/public storage | T04 | Unauthorized access/upload/reassignment denied; private documents use short-lived links; public assets tied to approved ownership; file metadata company-bound |
| T07 · P0 | Audit and platform support access | T04 | Actor/company/action/entity/time captured; moderation role lacks CRM access; time-bound support grant and expiry audited |
| T08 · P0 | Tenant boundary regression suite | T02–T07 | Test guessed IDs, two memberships, revoked user, wrong role, cross-company references, files, aggregates, RPCs, and exports; CI blocks failures |

## M2 — private company SaaS pilot

| Ticket | Deliverable | Dependencies | Acceptance |
|---|---|---|---|
| W01 · P0 | Company CRM, enquiry intake, assignments, and tasks | T08 | Company-scoped client dedupe; same-email clients do not merge across companies; retried intake does not duplicate request; consultant sees authorized work |
| W02 · P0 | Tour and content library authoring | T08 | Company-owned drafts/templates/rates; authorized canonical destination lookup; copy operations cannot reference another company's resources |
| W03 · P0 | Quote builder and selling-price approval | W01/W02 | Day-by-day locale-keyed translations, supplier-rate resolution, room/age/residency pricing, inclusions; missing cost/date/price shown correctly; no private costs in client view |
| W04 · P0 | Versioned delivery and acceptance | W03 | Expiring/revocable proposal token bound to correct company/version; immutable accepted version; repeated acceptance cannot duplicate booking |
| W05 · P0 | Departures, manual/direct bookings, and capacity | W02/W04 | Actual DB concurrency test for final seats; dates/room types/prices validated; booking snapshots retained; retries safe |
| W06 · P0 | Invoices, payment records, balances, and suppliers | W04/W05/T05 | Own-company finance permissions; immutable issued invoices; refund/add-on/unallocated payment cases reconcile; no aggregate cross-company totals |
| W07 · P0 | Reliable notifications and background jobs | W01/W04 | Outbox created with transaction; notifications routed to correct company; retry causes no duplicate business action; per-company retention/follow-up settings |
| W08 · P1 | Booking operational tools | W05/W06 | Tenant-safe traveler details, rooming, staff/vehicle assignment, agreements/vouchers/trip packs; motorbike capability optional |
| W09 · P0 | Pilot workflow validation | W01–W07 | Two unrelated companies complete enquiry→quote→booking→invoice with separate staff/data; critical pilot issues resolved before public marketplace |

## M3 — public marketplace

| Ticket | Deliverable | Dependencies | Acceptance |
|---|---|---|---|
| P01 · P0 | Operator profiles and verification queue | T06/T07/F04 | Private document upload; reviewed decision/expiry/history; only reviewed public claims; subscription does not automatically verify operator |
| P02 · P0 | Listing versions, completeness, and moderation | W02/P01 | Draft/submitted/changes-requested/approved/published/withdrawn lifecycle; review exact version; private edit cannot silently alter approved public listing |
| P03 · P0 | Public selling rates and eligibility | W02/W03 | Season/party/age/room/currency rules; public price separate from private cost; unavailable configurations have honest state; accepted proposal preserves price |
| P04 · P0 | Availability contracts | W05/P03 | Available/unavailable/on-request modeled; fixed departure seats correct; no claim of live lodge inventory without integration; lead-time rules applied |
| P05 · P0 | Approved search projection and filters | P02–P04 | Indexed/paginated normalized facets; consistent URLs; rejected/suspended tours removed; unknown price/rating handled; no private fields in response |
| P06 · P0 | Marketplace home, detail, and operator pages | P05 | Mobile/localized search→detail→operator flow; itinerary/rates/inclusions visible; operator and conditions clear; accessible quote action |
| P07 · P1 | Favorites and tour comparison | P06 | Tour/operator saves persist by account; guest-to-account merge safe; compare up to three with same date/party/currency assumptions and visible differences |
| P08 · P0 | Selected-operator enquiry routing | W01/W07/P06 | Validated request maps to actual published operator; explicit consent for additional recipients; retries isolated by recipient; delivery snapshot recorded |
| P09 · P1 | Original destination content and SEO | P06 | Reviewed/authorized content, canonical and alternate-language links; filtered pages avoid uncontrolled index expansion; no private URLs in sitemap |

## M4 — client experience and paid launch

| Ticket | Deliverable | Dependencies | Acceptance |
|---|---|---|---|
| C01 · P0 | Traveler identity and explicit booking/proposal access | T04/W04/W05/P08 | Verified account claim/invite; auth ID access model; email matching removed as authority; own-only views; group travelers cannot see each other's sensitive details |
| C02 · P1 | Conversations, attachments, and traveler inbox | C01/T06/W07 | Company A never sees B messages; only authorized participants; private files; safe retries; notifications carry correct sender/company context |
| C03 · P1 | Proposal comparison and booking document view | C01/C02 | Traveler compares own operator proposals; consistent currency/inclusions/dates; one acceptance creates one booking; accepted snapshot and operator contacts clear |
| C04 · P0 | Booking-linked reviews and moderation | C01/W05/P01 | Eligible completed trip; invite dedupe; pending reviews not in ratings; operator can respond but not edit/delete review; report/appeal recorded |
| B01 · P0 | Plans and company subscription lifecycle | F04/T01 | Final tiers, seats/storage/usage policies, grace/export rules; billing role enforced; cancel does not silently delete records |
| B02 · P0 | Subscription provider and signed webhooks | B01/T07 | Provider merchant setup confirmed; signatures verified; replay/out-of-order handling tested; separate ledger from customer safari finance |
| B03 · P0 | Server entitlement enforcement and billing UI | B02 | API/actions enforce caps, company context explicit, downgrade doesn't lose existing data; pending provider states handled; invoice links company-safe |

## M5 — launch verification and operations

| Ticket | Deliverable | Dependencies | Acceptance |
|---|---|---|---|
| Q01 · P0 | Real DB integration and full client/company journeys | T08/W09/P08/C01/B03 | Cross-tenant/role/token/publication/booking/invoice/subscription tests in CI; failure injection and concurrent final-seat scenarios pass |
| Q02 · P0 | Internationalization, mobile, keyboard, and accessibility validation | P06/C02/C03 | Critical tasks work in selected launch locales and both directions; currency precision, regional formatting, locale fallback and cross-zone trip dates validated; readable contrast; keyboard/focus/error states verified; mobile filters and quotes usable |
| Q03 · P0 | Search load and distributed abuse controls | P05/P08 | Distributed rate limits and quotas; agreed p95/query budgets measured; tenant indexes and pagination; no public endpoint causes unbounded scan |
| Q04 · P0 | Backup/restore, logging, monitoring, and incident ownership | F02/T07/W07/B02 | Restore to isolated environment demonstrated; private data/tokens redacted; job/outbox failures visible; support and incident owner assigned |
| Q05 · P0 | Moderation and commercial readiness | P01/P02/C04/B03/F04 | Reviewers trained; verification/complaint/subscription policies published; truthful badges; operator/traveler responsibilities clear |
| Q06 · P0 | Pilot acceptance and public launch | Q01–Q05 | All launch gates met; explicit remaining limitations recorded; rollout/rollback plan prepared; production release handled as separate authorized action |

## P2 — separately scoped later releases

| Ticket | Deliverable | Prerequisite |
|---|---|---|
| L01 | Company custom domains and branded websites | Reliable SaaS/marketplace pilot; domain ownership and canonical-host rules |
| L02 | Company-connected WhatsApp/email ingestion | Scoped connection credentials, validated account routing, outbox and abuse controls |
| L03 | Independent lodge/guide/transport supplier portals | Supplier-specific access/product requirements; company approval of shared records |
| L04 | Online safari payments, refunds, commissions, payouts | Merchant/contracting/provider/country decisions; reconciliation and operational support |
| L05 | Company-scoped AI/MCP intake | Per-company credentials/quotas, restricted tool permissions, company-bound library matching |
| L06 | External proof-of-travel reviews and widgets | Moderation operations and evidence-handling policy |
| L07 | Advanced ranking, promoted listings, lead credits | Real traffic/performance data, transparent disclosure, separate lead-budget ledger |
| L08 | Bulk import and advanced reporting | Data mapping/reconciliation, tenant-safe exports, real pilot demand |

## Pilot scope and launch gates

Private SaaS pilot: F01–F04, T01–T08, W01–W07, W09. Public marketplace: P01–P06, P08, C01, C04 and relevant Q gates. Full initial commercial release includes the listed P1 tickets and B01–B03. Optional operations W08 can follow pilot needs without blocking the entire platform.

Do not start marketplace ingestion before company isolation is proven. Do not charge subscriptions until commercial entitlements/provider behavior is defined and tested. Do not offer traveler payment collection by merely displaying manual payment records.

## Suggested first implementation sprint

Work on F01–F03: make the new project reproducible, rebuild the current schema in isolation, preserve useful pricing/accounting tests, and demonstrate one actual enquiry-to-invoice flow. Then T01–T04 establish ownership and permissions before importing further admin screens.

## International scope correction — 7 October 2026

The product targets international companies, suppliers and travelers. English/Arabic describes the original system, not the new product boundary. Apply the international requirements in `safari-platform-build-plan.md`.

| Ticket | Deliverable | Acceptance |
|---|---|---|
| I01 · P0 | Locale infrastructure and translated content model | Configurable locale catalogues/routes, selector/preferences, fallback, LTR/RTL, reviewed content translations; no fixed two-language columns |
| I02 · P0 | Currency and regional formatting | Separate base/contract/display currencies, currency-aware precision, labeled FX, international phone/address formats |
| I03 · P0 | Time zones and local service dates | UTC event timestamps, IANA business/service zones, stable date-only trip/season values |
| I04 · P0 | Country-specific commercial configuration | Invoice/tax fields, verification requirements, merchant eligibility and activated markets are explicit; no universal payment claim |
| I05 · P1 | Multilingual discovery and SEO | Translated destination labels, language-aware search, alternate-language/canonical metadata; only published translations indexed |

I01–I03 begin in the foundation; I04 spans company settings/billing; I05 belongs to marketplace publication. Translation and country expansion costs require a chosen launch scope.
