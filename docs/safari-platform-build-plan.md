# Safari platform: implementation plan

Prepared 7 October 2026. Planning baseline for a **new product**, informed by the [repository review](./safari-platform-review-and-plan.md), [existing backlog](./safari-platform-backlog.md), and [Tukio research](./tukio-research-and-upgrade-recommendations.md).

## 1. Product and first-release boundary

Build a subscription product for tour companies, connected to a shared traveler marketplace. Travelers discover operators and customize approved safari templates. Companies manage enquiries, proposals, bookings and basic finance. Invited service suppliers confirm the services assigned to them.

Create a new repository and separate database, storage, authentication configuration, integration credentials and deployment environments. Do not edit the original repository or connect the new application's writes to its production services. Initial pilot data is synthetic or explicitly provided for the new product; historical migration is a separate task.

Confirmed direction: international travelers, tour companies and service suppliers; configurable languages and regional settings, with LTR/RTL support. Safari destinations remain the initial product focus, while launch countries and translated languages will be selected separately. Working assumptions: company subscriptions; operator-managed traveler payments; curated safari templates; private safaris on-request. Product name, subscription prices, merchant/provider eligibility and final branding remain configurable commercial decisions. These do not block the foundation sprint.

### First public release

| Audience | Included |
|---|---|
| Companies | Onboarding, staff invites and fixed roles, branding/settings, CRM, enquiry inbox, tour/template authoring, private supplier rates, quote versions, bookings, invoices, manual payments, basic supplier payables, subscription management |
| Travelers | Destination/duration/budget/style search, approved operator profiles and tours, guided template customization, estimated prices, favorites, saved/shared drafts, enquiries, proposals, acceptance, bookings/documents and booking-linked reviews |
| Suppliers | Invitation to limited service requests, availability/price response, company-approved response history, relevant voucher access |
| Platform staff | Company verification, listing publication, review moderation, subscription oversight, reference data, audit and controlled support access |

Post-launch scope: free-form AI assembly, affiliate commissions, custom company domains, company-connected WhatsApp, universal live inventory, platform-held traveler payments and automated payouts. Existing motorbike-specific operations become optional modules when a pilot needs them.

Subscriptions purchase software access; marketplace approval is a separate process. Service suppliers do not automatically become paying tour-company tenants.

## 2. Architecture and repository structure

Use one modular Next.js/TypeScript application, with Supabase Postgres, Auth and Storage. Keep the reviewed React/Tailwind approach, but verify supported versions and pin dependencies when bootstrapping. Start with Postgres search and a durable database outbox for notifications; add specialized infrastructure only for a measured need.

```text
apps/web/
  app/                   public, traveler, workspace, supplier, platform routes
  components/            accessible locale-aware components and domain screens
  modules/
    identity/            accounts, companies, memberships, invitations
    catalogue/           reference data, private tours, approved publication
    planning/            templates, allowed options, drafts, selling estimates
    sales/               CRM, enquiries, conversations, quote versions
    bookings/            acceptance, capacity, travelers, documents
    suppliers/           private contracts/rates, requests, limited grants
    finance/             invoices, payments, balances, payables
    subscriptions/       plans, entitlements, signed billing events
    platform/            verification, moderation, support grants
    notifications/       outbox, deliveries, retries
packages/domain/         pure pricing/accounting rules and their tests
supabase/                reproducible migrations, DB tests, synthetic seeds
tests/e2e/               complete actor journeys
docs/                    architecture decisions, operations, product rules
```

Route families: public `/safaris`, `/operators`, `/destinations`; traveler `/account`; company `/workspace/[companySlug]`; supplier `/supplier`; platform `/platform`. A route slug selects context, but grants no access. One account can have several company memberships or supplier grants; authorization checks the requested action and current grant.

Resolve actor identity on the server. Most company services use the caller's database session and explicit company scope. Privileged jobs have narrow input contracts, tenant checks and audit records. Never turn the application's service-role client into the default query path.

Separate local/development, staging and production databases and credentials. Preview deployments use synthetic data or a dedicated preview database, not production. Keep migrations, environment-variable names and seed instructions in version control; keep secret values out.

## International requirements

International is a product requirement, not a fixed two-language interface. Build the following into the foundation:

- **Languages:** locale-keyed message catalogues, explicit language selection, saved account/company preferences and fallback rules. Browser language may suggest a locale but must not override a saved selection. Launch translation coverage is a separate market decision; do not claim every language is translated.
- **Content:** translated listing/proposal fields keyed by locale, rather than fixed English/Arabic columns. Track translation completeness and review status. Keep interface language separate from guide/service languages. Legal terms and confirmed offers preserve their accepted language/version.
- **Currencies:** separate company base currency, supplier contract currency, proposal/invoice currency and traveler display currency. Store monetary values with currency-aware precision; label indicative FX conversions with rate/time. Do not add different currencies without an explicit conversion, and do not silently alter accepted contract totals.
- **Regional formats:** locale-aware dates, numbers and addresses; international telephone country codes; Unicode names. Keep nationality, residency, interface language and billing country separate, including where park-fee eligibility depends on residency.
- **Time zones:** store event timestamps in UTC, use IANA time zones for businesses and service locations, and preserve local trip dates as dates. Date-only seasons must not shift when a traveler changes time zone.
- **Countries and compliance:** country-configurable invoicing/tax fields, operator verification requirements, payment-provider eligibility and commercial policies. Activate markets after validating their requirements; international architecture does not mean universal payment availability.
- **Search and SEO:** locale-specific URLs and correct alternate-language/canonical metadata for published translations; multilingual search and translated destination labels; indexing only for available public content.

Add international acceptance cases to each milestone: locale fallback and switching, translated-content gaps, long strings and RTL, differing currency precision, cross-zone dates, international phone/address formats and country-specific invoice configuration. Full translation production and country-by-country commercial expansion are separately scoped; revise estimates once launch markets/languages are selected.

## 3. Data ownership and domain contracts

| Ownership | Main records | Rule |
|---|---|---|
| Platform reference | Destinations, parks, canonical accommodation identities | Approved shared facts; negotiated rates stay private |
| Company private | Clients, supplier contracts, rates, tours/drafts, quotes, bookings, invoices, payments | Non-null company ID, live membership/action permissions, tenant-bound relationships |
| Traveler owned | Saved trip drafts, preferences, favorites | Owner controls access; sharing uses revocable, expiring grants |
| Deliberately shared | Enquiry recipient, proposal access, booking account access, supplier request access | Explicit participants and limited fields; no broad company membership implied |
| Public | Approved operator and listing snapshots, published reviews | Allowlisted fields only; drafts/costs/verification evidence excluded |
| Platform private | Verification evidence, billing events, moderation, support grants | Dedicated roles; audited access |

Use composite foreign keys to keep children and parents in the same company. Scope client email uniqueness, document numbers and private slugs to the company. Use atomic per-company numbering. Membership revocation must affect subsequent requests without depending on stale role claims.

Enable RLS and explicit grants for exposed tables; test allowed and denied operations. Bind storage access to record ownership and explicit grants. Index membership lookups, tenant filters and referencing foreign keys; verify query plans on representative seed volumes.

Key service contracts:

- **Estimate:** server takes template/version, dates, party ages, rooms and allowed option IDs; returns selling-price breakdown, currency, assumptions, validity and availability status. No supplier-cost or markup fields in the response.
- **Publication:** approval creates a specific public version. Editing private content does not silently change it. Withdrawal invalidates listing caches and prevents new requests.
- **Enquiry:** creates one company recipient/conversation per selected operator; stores the draft and advertised-price context; queues notifications after commit.
- **Proposal:** a sent version has a stable price, expiry, terms and authorized recipient. Revisions create a new version.
- **Acceptance:** validates actor, version, expiry, status and capacity in one transaction; retry cannot create a duplicate booking.
- **Supplier response:** records available/unavailable, price, currency and validity for the assigned service; company approval is required before updating the customer proposal.
- **Subscription:** signed events are deduplicated and ordered by provider state/version where available; server-side entitlements enforce the resulting plan. SaaS invoices remain separate from safari invoices.

## 4. Build milestones and dependencies

Estimates below are **person-weeks**, not calendar promises. They assume selective reuse of existing domain logic, a small curated catalogue, and routine QA. The revised scope includes a configurator and limited supplier portal, so it replaces the earlier estimate for delivery planning.

| Milestone | Work and deliverable | Dependency | Effort | Exit gate |
|---|---|---|---|---|
| B0 — Reproducible foundation | New project; audit reusable code; reconstruct required schema; synthetic fixtures; CI; locale-aware application shell | None | 1–2 | Fresh database setup and build work; core pricing examples reproduce |
| B1 — Tenancy and identity | Companies, memberships, invites, fixed permissions, settings, counters, private files, audit; actor context | B0 | 5–7 | Company A cannot read/write/export Company B records or files; revoke and role tests pass |
| B2 — Company sales vertical | CRM, requests, template/quote authoring, private rates, booking services, invoice/manual-payment basics | B1 | 4–6 | Two companies each complete enquiry → proposal → booking → invoice independently |
| B3 — Marketplace publication | Operator verification, submissions, public snapshots, search, tour/profile pages, favorites and moderation | B1; template schema from B2 | 5–7 | Approved listings searchable; drafts and private rates absent; withdrawal takes effect |
| B4 — Guided configurator | Approved template options, route constraints, server estimates, saved/shared drafts, structured enquiry handoff | B2/B3 | 3–5 | Traveler changes allowed options and correct company receives a reproducible request |
| B5 — Traveler journey | Explicit account access, conversations, versioned offers, acceptance, booking/documents, review eligibility | B2/B4 | 4–6 | Traveler accepts the intended version once; group access and review ownership enforced |
| B6 — Supplier collaboration | Request invitations, limited supplier view, responses, company approval, relevant vouchers | B2/B5 | 2–3 | Supplier sees only granted services; response cannot silently change a sent offer |
| B7 — Paid workspace | Plans, seats/usage entitlements, selected billing provider, signed events, grace/export rules | B1/B2; merchant eligibility | 3–4 | Replay/out-of-order billing tests and plan enforcement pass; cancellation preserves data |
| B8 — Pilot and launch readiness | Full journey/concurrency tests, mobile/RTL/accessibility, abuse controls, performance, restore drill, operator training | B3–B7 | 3–4 | Pilot acceptance, release/rollback procedure and all launch blockers resolved |

Total: **30–44 person-weeks**. Rough calendar planning: **7–11 months for one full-time experienced developer**, or **5–7 months with two experienced developers and part-time design/QA**, allowing for integration, review and operator feedback. Team estimates are not simple effort division. Hosting, provider charges, content production and extensive historical cleanup are additional costs.

After B1, company workflows and marketplace publication can overlap once their shared interfaces are fixed. Billing work can overlap later milestones. Critical path is foundation → tenancy → templates/quotes → configurator → traveler acceptance → pilot verification.

A private company pilot begins after B2. A traveler beta follows B5 with curated operators; suppliers can be handled manually until B6. Public paid launch waits for B7/B8 and moderation readiness. Do not label the company pilot as the completed marketplace product.

## 5. First two implementation sprints

Use two-week sprints. The first sprint starts with B0; completion depends on resolving the previously identified incomplete baseline schema and unavailable runtime validation.

### Sprint 1: make the new project reproducible

| Task | Concrete output | Acceptance |
|---|---|---|
| S1.1 Isolated project | New project skeleton, pinned dependencies, env example, setup guide | Original repo/services untouched; clean install/build in new environment |
| S1.2 Schema reconstruction | Minimal required schema and forward migrations, reconciliation against reviewed migrations | Empty database builds without undocumented tables/functions |
| S1.3 Domain reuse | Selected pricing, rate-resolution, balance and invoice modules | Existing meaningful arithmetic tests run; known party/date scenarios match expected results |
| S1.4 UI foundation | translation catalogue, locale routing, language selector, direction handling, form/error/loading primitives | Locale switching, fallback behavior, regional formatting and keyboard navigation demonstrated |
| S1.5 Identity design | Ownership map, role permissions, core entity diagram and service contracts | Every initial entity has an owner and each shared relationship has an explicit grant |
| S1.6 CI and fixtures | Lint/type checks, unit tests, DB setup/test job; two-company synthetic seed | Reproducible local/CI results recorded; no real customer data used |

Demo: boot the fresh project, switch configured locales, run known pricing examples and show the initial data/permission design. Log unresolved reproduction issues before importing more screens.

### Sprint 2: establish company access

Implement account registration/session handling, company creation with owner membership, company switcher, invitations, consultant/finance/admin/owner permissions, settings and tenant-scoped CRM as the first complete slice.

Demo: the same account belongs to two companies; each company has a separate client record using the same email. A consultant is denied staff/billing actions. Direct database/API attempts to access the other company fail. Revoking membership removes access. Continue B1 in subsequent sprints until its database, storage and server-action gates pass.

## 6. UI and operational design work

Design the primary paths before expanding screens: traveler search → tour → configure → request; consultant inbox → quote → send; traveler offer → accept → booking; supplier invite → respond; moderator submission → publish.

Use one accessible component system with distinct navigation for each audience. Prototype mobile, long translated text and LTR/RTL layouts alongside desktop. Include empty, pending, expired, unavailable, denied and retry states in each flow. State whether prices are per person/group, what's included, who operates the safari, and whether availability is pending.

Seed a small catalogue of authorized routes and supplier options with explicit rate assumptions. Assign people to verification, listing review, complaints and review moderation before public launch. Do not seed fictional ratings or copy competitor content.

## 7. Verification and launch criteria

Prioritize tests for financial rules, authorization and transactional behavior, rather than tests that duplicate trivial rendering.

- Database: fresh migration replay; all tenant-private tables tested for allow/deny across read/write; cross-company relationship rejection; unauthorized storage access denied.
- Booking: concurrent duplicate acceptance creates one booking; capacity cannot oversell; expired or superseded offers cannot be accepted; immutable issued invoice rules hold.
- Pricing: season boundaries, child ages, room-sharing, group size, missing/expired rates, currency rounding and permitted option combinations.
- Sharing: token expiry/revocation, account claim, lead/traveler permissions, supplier fields and separate operator conversations.
- Publication: only approved fields visible; suspended operators/listings removed; public caches cannot contain private responses.
- Billing: signature verification, retries, delayed/out-of-order events, seat limits, downgrades and grace/export behavior.
- End-to-end: traveler customization → request → operator proposal → supplier response → approved revision → traveler acceptance → invoice/payment status → documents → eligible review, using two companies.
- Operations: notification retries observable; backup restored into isolation; secrets/customer fields redacted from logs; release migrations and rollback limits documented.

Provisional performance target: search API p95 under 1 second on a stated staging dataset/load; no unbounded workspace queries; core mobile tasks reviewed under realistic network conditions. Measure and refine the target during B3, rather than claiming untested production capacity.

Invite 2–3 pilot companies with a small authorized catalogue and several service suppliers. Gate launch on zero unresolved critical access, booking, finance or billing failures. Track enquiry conversion, proposal turnaround, supplier response time and company time saved. Production deployment is a separate action from preparing this plan.

## 8. Decisions, risks and continuity

| Item | Planned handling |
|---|---|
| Original baseline does not recreate the schema | B0 reconstructs required schema and proves fresh setup; do not clone all legacy migrations blindly |
| Existing code uses broad privileged clients | Rebuild service authorization/tenant boundaries before reusing screens |
| Supplier rates/inventory can be incomplete | Controlled template choices; request quote when unpriced; explicit on-request status |
| Billing merchant availability varies | Verify business-country/provider eligibility during B0; use an adapter; no unverified provider promise |
| Product name/brand unspecified | Temporary internal name and replaceable brand tokens; finalize before public content/domain setup |
| Existing runtime tests were not executable in review | B0 must establish a runnable toolchain and database before reuse assumptions become accepted evidence |
| Original data may be needed later | Separate import specification, company mapping, dry run and reconciliation; no automatic production migration |

Backlog continuity: retain the prior F/T/W/P/C/B/Q ticket acceptance rules where relevant. Add **N01 template option/routing model, N02 public estimate service, N03 saved/shared draft grants, N04 configurator UI/enquiry handoff, N05 supplier request grants, N06 supplier responses/approval, N07 supplier voucher view**. N01–N04 belong to B4; N05–N07 belong to B6. The formerly later supplier portal is now deliberately limited first-release scope. AI, affiliates and payouts remain separately estimated projects.

This plan defines implementation scope; it does not claim that code, tests, hosted services or deployments have been created. The next build task is Sprint 1 in the new project.
