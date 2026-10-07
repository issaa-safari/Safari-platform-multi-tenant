# Tukio research and recommended upgrades

Research date: 7 October 2026. Assumed reference: **Tukio at gotukio.com**.

This extends [the existing system review](./safari-platform-review-and-plan.md). Recommendations are for a separate product; the original GitHub repository and production services remain unchanged.

## What the public research establishes

| Area | Public evidence | What remains unverified |
|---|---|---|
| Guided trip planning | [Planner](https://trip.gotukio.com/) starts with destination, dates, budget and travelers; describes itinerary generation and customization | Generated itinerary quality, calculation correctness and actual checkout behavior |
| Customization | [Official builder announcement](https://gotukio.com/blog/new-create-your-safari-itinerary-with-tukio) describes changing accommodation, activities and transportation with changing totals, plus saving and sharing | Current execution of those features; announcement dates from August 2024 |
| Ready-made itineraries | [Trips catalogue](https://gotukio.com/trips) presents routes, duration and starting prices, with customization as the next step | Price coverage, available dates and inventory accuracy |
| AI assistance | [Safari assistant](https://trip.gotukio.com/safari-chat) exposes a prompt field and suggested trip requests | Response accuracy, booking integration and underlying architecture |
| Supplier participation | [Supplier page](https://gotukio.com/become-a-supplier) invites accommodation, transport and activity businesses to apply | Authenticated supplier tools, inventory integrations, rate editing and permissions |
| Agent sales | [Travel-agent page](https://gotukio.com/travel-agents) advertises local supplier access, support and referral commissions | Private agent workspace and its accounting/reporting capabilities |
| Affiliate acquisition | [Affiliate page](https://gotukio.com/affiliates) advertises referral tracking, commissions and a dashboard | Actual dashboard behavior and commission settlement |
| Booking confirmation | [Terms](https://gotukio.com/terms-and-conditions), dated May 2024, describe host acceptance and provisional bookings pending final references | Current operational implementation and whether all booking paths follow those terms |

Research inspected public page content and official descriptions. No account was created, form submitted, AI conversation initiated or booking purchased. Public marketing does not establish that Tukio offers a subscription-based, isolated multi-tenant business system of the kind you want to sell.

## Recommended product direction

Combine three capabilities: SafariBookings-style operator discovery and trust, Tukio-style traveler customization, and your existing company sales and operations tools. Companies should be able to buy a private workspace and optionally apply to publish selected offers on the shared marketplace.

Keep three business identities distinct:

- **Tour company tenant:** subscribes to the software, manages staff, clients, quotes, bookings and finance.
- **Service supplier:** provides a lodge, vehicle, guide or activity; receives access only to relevant requests and services.
- **Traveler:** discovers safaris, customizes an itinerary, requests a proposal and manages their booking.

A supplier may also run a tour company, but that requires explicit memberships and permissions. Shared supplier catalogue content must not reveal one company's negotiated rates or another company's customer records.

## Upgrade priorities

| Priority | Upgrade | Fit with your reviewed system | First usable release |
|---|---|---|---|
| P0 | Multi-tenant company workspaces | Current settings, CRM lookup, finance queries and integrations assume one business | Company memberships, permissions, isolated data/files, company branding and settings; tested cross-company access denial |
| P1 | Public safari configurator | Reuse quote/day/item concepts and pricing calculations | Customize an approved itinerary template: dates, party, accommodation tier and selected extras; show estimated selling price and request confirmation |
| P1 | Searchable marketplace | Existing public catalogue needs cross-operator discovery | Destination, duration, budget and travel-style filters; approved operator profiles, comparable price assumptions, saved tours and enquiry routing |
| P1 | Publishable itinerary templates | Existing itineraries and versioned quotes provide a foundation | Companies publish reviewed templates and permitted alternatives; private costing and internal notes stay private |
| P1 | Saved trips and client portal | Existing client ownership needs explicit account access | Save/share a draft, compare proposal versions, accept a confirmed offer, view payment status and retrieve documents |
| P2 | Supplier request portal | Existing supplier records, rates and payables are useful foundations | Invite a supplier to acknowledge availability, return a rate and receive a voucher for a specific service; no general access to the company's CRM |
| P2 | Rate and availability management | Existing seasonal pricing can support configuration | Supplier rate submissions, company approval, currency/tax rules, expiry, blackout dates and clearly labeled availability status |
| P2 | Agent and referral sales | A separate distribution channel adds reach | Agent-specific leads and proposals, referral attribution, commission rules and statements; prevent duplicate commission claims |
| P3 | AI safari assistant | Existing intake automation can help capture preferences | Suggest approved routes/templates and explain options using structured catalogue data; pricing and confirmation remain server-controlled |

The largest customer-facing opportunity is the configurator. The most important prerequisite is tenant isolation.

## How the configurator should work

Start with a small set of operator-approved routes rather than unrestricted trip assembly. Each template defines permitted lodges, transport and activities, minimum stays, start/end points and realistic transfer times.

1. Traveler chooses destination, dates, travelers, children's ages, budget and interests.
2. The platform suggests eligible templates from approved operators.
3. Traveler selects allowed accommodation and extras; the server recalculates the public selling estimate.
4. The draft is saved and can be shared with companions through controlled access.
5. A request goes to the responsible company with the full structured itinerary and preferences.
6. The company checks supplier availability, revises the proposal if needed and sends a versioned offer.
7. Acceptance creates the booking and operational tasks through the existing transactional booking approach, adapted for tenancy.

Example: a traveler selects a seven-day Tanzania route for two adults, then changes accommodation tier and adds a balloon activity. The displayed estimate updates, the changed services are visible, and the request reaches the correct company's quote builder. Supplier availability remains pending until acknowledged.

Do not expose raw supplier cost rates to generate those estimates. Use approved public selling rules with explicit currency, party assumptions, room arrangement, inclusions and exclusions. If a rate is missing or expired, ask for a quote instead of inventing a total. Final acceptance must reference the exact proposal version and expiry.

## Supplier workflow to add

The first supplier portal should solve service confirmation before attempting universal live inventory. A lodge sees the dates, room needs and request it is allowed to handle; a transport provider sees the assigned transport service. Each responds with available/unavailable, price, validity and conditions. The company approves that response before it affects a customer offer.

Later, add allotments or supplier integrations where contracts and reliable inventory support them. Availability must distinguish on-request, held, confirmed and unavailable. A calendar entry alone is not a reservation guarantee. Private negotiated rates require company-specific agreements even when the supplier's public identity is shared.

## What to postpone

- Unrestricted AI-created routes: require curated routes, transfer constraints and authoritative pricing first.
- Instant confirmation for every service: enable only where inventory and reservation guarantees actually support it.
- Platform collection and automatic supplier payouts: first decide merchant responsibilities, refunds, settlement and payment-provider support; retain the earlier operator-managed payment launch approach.
- Full affiliate networks and multi-country expansion: establish accurate booking attribution and a dependable pilot supply base first.

## Revised delivery order and acceptance

**Release 1 — Company foundation:** separate project/database; reproducible schema; company identity, memberships, settings, storage and query isolation. Reuse core quote and booking logic selectively. Acceptance: two companies can independently manage the same traveler email without seeing each other's records, financial totals or documents.

**Release 2 — Marketplace and guided customization:** approved operator profiles and templates, filters, price assumptions, saved drafts and routed requests. Acceptance: a traveler completes a template customization and the correct company receives a reproducible estimate and structured request.

**Release 3 — Proposal-to-booking and supplier confirmation:** versioned customer offers, explicit customer access, limited supplier invitations, acknowledgments, vouchers and payment status. Acceptance: a supplier confirms only its service, a customer accepts the intended offer version, and one booking is created without cross-company exposure.

**Release 4 — Distribution and assistance:** agent/referral tracking, approved supplier rate submissions and an AI assistant constrained to structured offers. Acceptance: conversions and commissions can be traced to bookings; AI cannot fabricate an approved price or confirm inventory.

These additions change the scope of the earlier plan. Its 22–35 person-week estimate is not an estimate for all the new supplier, agent and AI capabilities. Re-estimate after specifying the configurator and running a pilot with a small number of companies and suppliers.

Measure draft-to-enquiry conversion, enquiry-to-confirmed-booking conversion, proposal turnaround, supplier response time and operator time saved. These establish whether customization improves sales before committing to more automation.
