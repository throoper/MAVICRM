# Engineer Handoff — MAVI CRM

## About This Document

This document provides the engineering team with the context needed to build the production MAVI CRM based on the demo prototype. The demo is a fully clickable React/TypeScript prototype with fake data. No real backend, auth, or integrations exist — all state is local React state that resets on refresh.

---

## 1. Product Overview

MAVI is a talent marketplace that connects global accountants with US-based clients. The CRM is an internal tool used by Customer Success Managers and company leadership to manage client relationships, track contracts and talent placements, handle issues, generate reports, and coordinate client communications.

### Core Users
- **Customer Success Managers** — Day-to-day usage: updating company info, managing issues, producing reports, coordinating check-ins
- **Leadership** — Viewing critical issues, reports, MRR data, and churn analysis

---

## 2. Entity Relationships

### Overview
- A **Company** has one or more **Contacts** (POCs) and one or more **Contracts**
- A **Contract** links exactly one **Company** to one **Talent** — it represents a single placement
- A **Talent** can be on multiple **Contracts** across multiple **Companies** (e.g., part-time engagements)
- An **Issue** is tied to one **Company**, one **Talent**, and one **Contract**
- An **Upsell** is tied to one **Contract** (and by extension one Company + one Talent)
- **Internal Team Members** (Dave, Kath, Molly) are assigned to issues, upsells, and author action log entries
- **Email Templates** are scheduled against **Companies** for recurring check-ins
- **Replacement Events** record when one talent is swapped for another on a contract

### Entity Relationship Summary
```
Company  1──* Contract *──1 Talent
Company  1──* Contact
Company  1──* Issue
Contract 1──* Issue
Contract 1──0..1 Upsell
Talent   1──* Issue
Issue    1──* ActionLogEntry
Upsell   1──* ActionLogEntry          (reuses same ActionLog component as Issues)
Company  1──* ScheduledEmail *──1 EmailTemplate
Contract 1──* ReplacementEvent
Contract 1──* UtilizationRecord
Talent   1──* TalentSurvey
Talent   1──* PerformanceReview
Company  1──* ClientInteraction
Company  1──* JobOpening
```

### Notes for Schema Design
- Contracts are the central linking table between Companies and Talent
- A Company can have multiple active contracts with different talent
- A Talent can appear on contracts for different companies simultaneously
- Issues always reference a specific contract (and by extension, a company + talent)
- Contracts can be "Ended" — ended contracts are hidden from company/talent detail pages but accessible via the Contracts list page and Churn report
- Contracts are permanent (no renewal cycle). The dashboard tracks 1-year anniversaries of long-term start dates as informational milestones, not formal renewals
- The `ActionLog` component is shared between Issues and Upsells — same data structure (`ActionEntry`: id, date, author, note)

---

## 3. Features

### 3.1 Dashboard
**[Demo Finalized]**

What it does: Landing page with four summary cards (Total Companies, Active Contracts, Open Issues, Upcoming Anniversaries), a two-column section showing Open Issues by Severity and Account Health distribution, and an Upcoming Contract Anniversaries table (contracts approaching 1 year from long-term start within next 30 days).
Data points needed: Company count, contract count (active), open issue count by severity, company health distribution, contract anniversary dates
How it gets data: Aggregates from Companies, Contracts, and Issues APIs
Integrations required: None beyond core entity APIs

---

### 3.2 Companies — List View
**[Demo Finalized]**

What it does: Searchable, filterable table of all companies. Search by name or industry, filter by account health (Healthy / Needs Attention / At Risk). Clicking a row navigates to the company detail view.
Data points needed: Company name, industry, account health, primary contact name, active contract count, open issue count
How it gets data: Company list; derives counts from related Contracts and Issues
Integrations required: Company API, Contracts API (for counts), Issues API (for counts)

---

### 3.3 Companies — Detail View
**[Demo Finalized]**

What it does: Full company profile with the following sections:
- **Company info** — name, description, website, industry, headquarters, country, specialties, LinkedIn, employee count. All fields inline-editable.
- **Classification** — company type (High Value / Strategic / Standard), account health, revenue tier (Enterprise / Mid-Market / SMB), strategic flag
- **Contacts** — primary contact card + additional POCs (name, title, email, phone). Editable with add/remove.
- **CSAT & NPS** — latest scores displayed prominently with expandable history
- **Account Summary** — freeform text block (yellow card) for high-level account notes. Editable.
- **Client Notes Log** — timestamped notes with type (Call / Email / Meeting / Internal), author, optional tag, and freeform content. Filterable by type and searchable. Notes longer than 2 lines are truncated with a "Show more" toggle that expands inline.
- **Contracts** — section header shows active count with `+ N ended` link (red text) that navigates to the Contracts list page filtered to ended. Only active contracts render as full ContractCard components. See 3.4 for ContractCard details.
- **Issues** — table of all issues for this company with links to issue detail
- **Job Openings** — table of open roles for this company
- **CS Metrics** — interaction stats (proactive/reactive split, response rate, ignored follow-ups) and replacement stats

Data points needed: All company fields, related contracts, issues, job openings, interactions, replacements, upsells
How it gets data: Company by ID, related entities filtered by companyId
Integrations required: Company API, Contracts API, Issues API, Interactions API, Replacements API, Upsells API

---

### 3.4 Contract Card (sub-component)
**[Demo Finalized]**

What it does: Renders within company and talent detail pages. Displays one contract's full details:
- **Header row** — talent/company name (linked), contract importance label (percentile-based: Top 5%, Top 10%, etc.), plus inline badges for active upsell (green, links to upsell detail) and open issue count (red, links to issues)
- **Key fields** — rates (talent rate, contract rate), job description, role type, expected/minimum hours per week, trial dates, long-term start date, account owner, platform team owner, primary POC
- **Utilization bars** — horizontal progress bars for hours used (last week / month / quarter / year) color-coded by threshold (green 80%+, yellow 50-79%, red <50%)
- **Performance & Satisfaction** — latest scores prominently displayed with expandable history
- **MRR Panel** — isolated sub-component (see 3.5)
- **Update Contract** — form to adjust rates and hours with reason, author, and notes. Creates an audit trail entry in `updateHistory`.
- **Pipeline Data** — modal showing original job description and sales notes timeline (only for contracts that came through the pipeline)
- **Risk flags** — human input risk flag with confidence level and notes (CS metrics integration)
- **Attachment** — simulated file upload for contract PDFs

Props: `contract`, `allContracts` (for percentile ranking), `headerLabel` ("talent" or "company" depending on parent page), `contactNames`, `upsell` (optional), `issueCount` (optional), `onSave`, `onUploadAttachment`

**Design note:** The ContractCard is the same component on both CompanyDetail (showing talent name in header) and TalentDetail (showing company name in header), controlled by the `headerLabel` prop.

---

### 3.5 MRR Panel (sub-component of Contract Card)
**[Demo Finalized]**

What it does: Isolated component displaying Base MRR, Expected MRR, Actual MRR, and Variance (color-coded green/red). Built as a standalone `<MrrPanel />` so it can be wrapped in a role-based permission check.
Data points needed: Base MRR, Expected MRR, Actual MRR
How it gets data: Passed as props from contract data
Integrations required: Billing/revenue system for real MRR values; role-based access control system to conditionally render

**Design decision:** MRR variance display was discussed with three options: (A) simple text with up/down arrows, (B) horizontal bar chart, (C) color intensity with tooltip. The demo uses option A. Option C (color intensity mapping + tooltip for detail) was identified as a strong alternative for the production build — worth discussing with leadership. Note this in sprint planning.

---

### 3.6 Contracts — List View
**[Demo Finalized]**

What it does: Centralized table of all contracts across the system. Filterable by status (All / Trial / Active / At Risk / Ended) and searchable by company, talent, or role type. Summary bar shows total, active, and ended counts. Table columns: Company, Talent, Role, Status, Hours/wk, Rate, MRR (Actual), Start Date, End Date, End Reason.

This page serves two purposes: (1) portfolio-wide contract visibility that doesn't exist elsewhere, and (2) access to ended contracts which are hidden from company/talent detail pages to keep those views clean.

Data points needed: All contract fields
How it gets data: Full contracts list
Integrations required: Contracts API

**Design alternative considered:** Ended contracts could have been shown inline on company/talent detail pages (collapsed section). We chose to hide them and link via `+ N ended` to keep the detail pages focused on active work. The Contracts list page provides the full historical view.

---

### 3.7 Talent — List View
**[Demo Finalized]**

What it does: Searchable table of all talent. Search by name, location, or specialization. Columns: Name, Location, Specialization, Active Contract Count. Clicking a row navigates to talent detail.
Data points needed: Talent name, location, specialization, contract count
How it gets data: Talent list; derives contract count from Contracts
Integrations required: Talent API, Contracts API

---

### 3.8 Talent — Detail View
**[Demo Finalized]**

What it does: Full talent profile with sections:
- **Basic info** — name, email, phone, location, specialization, start date (platform tenure)
- **CS Metrics** — tenure in months, attrition risk (Low / Medium / High), volatility flag (flagged if multiple reassignments or issues)
- **Active Contracts** — rendered using the same ContractCard component as company detail, with `headerLabel="company"`. Section header includes `+ N ended` link when applicable. Each contract shows its upsell badge and issue count badge.
- **Satisfaction Surveys** — grouped by contract, showing sent/completed dates, scores (1-10), and flags (complaints, replacement risk)
- **Performance Reviews** — grouped by contract, showing client reviewer, scores (1-10), and flags (underperformance, exceptional work)
- **Replacement History** — table of replacement events involving this talent (as previous or new talent)

Data points needed: All talent fields, related contracts, surveys, reviews, replacements, upsells, issues
How it gets data: Talent by ID, related entities by talentId
Integrations required: Talent API, Contracts API, Surveys API, Reviews API, Replacements API

---

### 3.9 Issues — List View
**[Demo Finalized]**

What it does: Filterable table of all issues. Six independent filter dimensions: Status (Open / In Progress / Monitoring Solution / Resolved), Severity (Low / Medium / High / Critical), Priority (Low / Medium / High), Type (7 types), Category (Performance / Utilization / Communication / Billing / Replacement), Assigned To (team member). Plus a "New Issue" button. Clicking a row navigates to issue detail.
Data points needed: All issue fields
How it gets data: Issues list
Integrations required: Issues API

---

### 3.10 Issues — Detail View
**[Demo Finalized]**

What it does: Full issue view with:
- **Header** — title, linked company/talent/contract, creation/update dates
- **Status Stepper** — visual 4-step workflow (Open → In Progress → Monitoring Solution → Resolved). Clickable to change status.
- **Editable fields** — status, severity, priority, type, categories (multi-select), assigned owner. All inline-editable via dropdowns.
- **Summary** — freeform editable text describing the issue
- **Resolution Notes** — separate editable text for resolution documentation
- **Monetary Concession** — editable dollar amount tracking financial concessions given
- **Attachments** — list of attached files with metadata (simulated upload)
- **Action Log** — chronological log of actions taken. Uses the shared `ActionLog` component (author selector, text input, timestamped entries displayed newest-first).
- **CS Metrics** — average time between actions (calculated from action log dates)

Data points needed: All issue fields, action log entries
How it gets data: Issue by ID
Integrations required: Issues API, Issues Action Log API

**Component reuse:** The `ActionLog` component (`src/components/issues/ActionLog.tsx`) is a shared component also used by Upsell Detail. It accepts `entries: ActionEntry[]` and `onAddEntry` callback. The `ActionEntry` type (id, date, author, note) is defined in the shared types file.

---

### 3.11 Issues — Create
**[Demo Finalized]**

What it does: Form to create a new issue. Fields: Title, Type (dropdown), Severity (dropdown), Priority (dropdown), Categories (multi-checkbox), Company (dropdown, auto-populates available contracts), Contract (dropdown, auto-populates talent), Assigned To (team member dropdown), Summary (textarea). On submit, creates the issue and navigates to the new issue's detail page.
Data points needed: Companies list (for dropdown), contracts per company, talent per contract, team members
How it gets data: Companies and Contracts APIs to populate cascading dropdowns
Integrations required: Issues API (POST)

---

### 3.12 Upsells — List View
**[Demo Finalized]**

What it does: Pipeline view of all upsells (contract hour expansions, typically part-time to full-time conversions). Summary bar shows total count, open pipeline count, and pipeline value (monthly). Table columns: Company, Talent, Status, Hours (current → proposed), Value/mo, Target Close, Owner. Clicking company name navigates to upsell detail.
Data points needed: All upsell fields
How it gets data: Upsells list
Integrations required: Upsells API

**Business context:** An "upsell" at MAVI specifically means increasing contracted hours on an existing placement. Other types of expansion (new roles, new placements) are tracked as Job Openings and managed in sales tooling, not here.

---

### 3.13 Upsells — Detail View
**[Demo Finalized]**

What it does: Full upsell view with:
- **Status bar** — current status badge, linked company/talent, status dropdown to change status
- **Expansion Details** — current hours, proposed hours, hour increase, monthly expansion value, date identified, target close date, owner (editable dropdown)
- **Notes** — freeform editable textarea for general context
- **Action Log** — reuses the same `ActionLog` component from Issues (see 3.10)

Status lifecycle: Identified → Proposed → Accepted → Closed-Won / Closed-Lost

Data points needed: All upsell fields, action log entries
How it gets data: Upsell by ID
Integrations required: Upsells API

---

### 3.14 Reports Hub
**[Demo Finalized]**

What it does: Tabbed report interface with a timespan filter (Daily / Weekly / Monthly / Quarterly / Yearly / Custom date range). Seven report tabs, each rendering a dedicated report component. All reports include a CSV export button.

The timespan filter UI is built but the individual reports currently compute over the full dataset (not filtered by timespan). In production, each report should accept the selected timespan and filter accordingly.

---

### 3.15 Reports — CS Metrics
**[Demo Finalized]**

What it does: Four metric sections: (1) Replacement metrics — avg time between replacements, % clients affected, reason distribution, success rate at 3 months. (2) Revenue health — % contracts below minimum/expected hours, revenue variance, total concessions. (3) Engagement — avg response time, check-in completion rate, proactive/reactive split, ignored follow-ups. (4) Talent — average tenure, attrition risk distribution, satisfaction scores, survey completion rate.
Data points needed: Contracts, replacements, issues, interactions, talent, surveys
How it gets data: Aggregated from multiple entity APIs via utility functions in `src/utils/csMetrics.ts`
Integrations required: All core entity APIs

---

### 3.16 Reports — MRR Actual vs Expected
**[Demo Finalized]**

What it does: Per-contract MRR breakdown showing Base, Expected, Actual, and Variance. Monthly trend (Jan-Dec) with color-coded variance cells. Sortable columns. Summary totals row.
Data points needed: All contract MRR data
How it gets data: Contracts API
Integrations required: Billing/revenue integration for real MRR values

---

### 3.17 Reports — Utilization
**[Demo Finalized]**

What it does: Contract-level utilization analysis. Shows % of expected hours used per contract, health scoring (Healthy 80%+, Medium 50-79%, At Risk <50%), and trend indicators (up/down/stable based on recent vs historical).
Data points needed: Utilization records (weekly expected vs actual hours per contract)
How it gets data: Utilization records by contract
Integrations required: Time tracking integration

---

### 3.18 Reports — Client Engagement
**[Demo Finalized]**

What it does: Interaction analytics per company. Metrics: total interactions, proactive vs reactive split, response rates, ignored follow-ups, average days between interactions.
Data points needed: Client interaction records
How it gets data: Interactions API filtered by company
Integrations required: Interactions API (may integrate with email/calendar for automated logging)

---

### 3.19 Reports — Talent Health
**[Demo Finalized]**

What it does: Talent portfolio health overview. Attrition risk distribution, satisfaction score averages and trends, tenure analysis, survey/review completion rates, flags for complaints and replacement risk.
Data points needed: Talent records, surveys, performance reviews
How it gets data: Talent, Surveys, and Reviews APIs
Integrations required: Survey system, performance review system

---

### 3.20 Reports — Issue Summary
**[Demo Finalized]**

What it does: Issue analytics. Summary cards: open issue count, avg days to solution, avg days to resolution, total concessions. Open issues by type (grid). Detail table of all issues with severity, concession amounts, and resolution time. Totals row for concessions.
Data points needed: All issue fields
How it gets data: Issues API
Integrations required: Issues API

---

### 3.21 Reports — Churn Analysis
**[Demo Finalized]**

What it does: Contract churn/loss analysis. Summary cards: churned contract count, total lost MRR, average contract duration before churn, related monetary concessions. Churn by reason breakdown (grid showing count and lost MRR per reason). Detail table of all ended contracts with company, talent, end date, reason, duration, lost MRR, and related concessions. Totals row. CSV export.

End reasons tracked: Performance Issue, Talent Left Voluntarily, Client Business Change, Budget, Role Change, Contract Not Renewed.

Data points needed: Contracts with status "Ended", related issues (for concession amounts)
How it gets data: Contracts API (filtered to ended), Issues API (for concession cross-reference)
Integrations required: Contracts API, Issues API

---

### 3.22 Email Check-Ins — Template Management
**[Demo Finalized]**

What it does: Two-tab interface. Templates tab shows all email templates in a card grid. Each template has: name, recipient type (Client / Talent / Internal / Both), trigger timing (X days from trial start / long-term start / previous check-in), recurring flag, subject line, and body with variable placeholders ({{talentName}}, {{contactName}}, {{companyName}}). Templates can be clicked to open the template editor for modification.
Data points needed: All template fields
How it gets data: Email Templates API
Integrations required: Email Templates API (CRUD)

---

### 3.23 Email Check-Ins — Scheduling
**[Demo Finalized]**

What it does: Scheduled Emails tab shows active/paused email schedules per company. Columns: company, template name, next send date, last sent date, status (Active / Paused). Status can be toggled.
Data points needed: Scheduled email records, template references
How it gets data: Scheduled Emails API, Templates API
Integrations required: Scheduled Emails API, email delivery integration (provider TBD), cron/scheduler for automated sends

---

### 3.24 Email Check-Ins — Template Editor
**[Demo Finalized]**

What it does: Full editor for a single email template. Editable fields: name, recipient type, trigger days, trigger reference event, recurring toggle, subject, body. Body supports variable placeholders that would be substituted at send time.
Data points needed: Template fields
How it gets data: Template by ID
Integrations required: Email Templates API (PUT)

---

## 4. Shared Components

### 4.1 ActionLog
**File:** `src/components/issues/ActionLog.tsx`
**Used by:** Issue Detail, Upsell Detail

Reusable component for chronological action tracking. Displays a list of timestamped entries (newest first) with author and note. Includes an input form with team member dropdown, text field, and "Add" button. Uses the shared `ActionEntry` type (id, date, author, note).

Any future entity that needs a simple activity/note trail should reuse this component.

### 4.2 StatusBadge
**File:** `src/components/shared/StatusBadge.tsx`
**Used by:** Most list and detail views

Color-coded pill badge. Accepts `label` (display text) and `variant` (determines color scheme). Variants cover health statuses, issue lifecycle, priorities, and upsell statuses.

### 4.3 ExportButton
**File:** `src/components/shared/ExportButton.tsx`
**Used by:** All report components

Client-side CSV export. Accepts `filename`, `headers`, and `rows`. In production, consider server-side export for large datasets.

### 4.4 ContractCard
**File:** `src/components/companies/ContractCard.tsx`
**Used by:** Company Detail, Talent Detail

The same component renders in both contexts. The `headerLabel` prop controls whether the header shows the talent name (on company pages) or company name (on talent pages). Also receives optional `upsell` and `issueCount` props to display inline badges.

### 4.5 PageLayout
**File:** `src/components/layout/PageLayout.tsx`
**Used by:** All pages

Standard page wrapper with title.

### 4.6 ExpandableText
**Defined inline in:** `src/components/companies/CompanyDetail.tsx`
**Used by:** Company note log entries

Truncates text to 2 lines with CSS line-clamp. Shows "Show more" / "Show less" toggle when content overflows. If promoted to a shared component, could be reused anywhere long text needs truncation.

---

## 5. API Endpoints (Suggested)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/companies` | List all companies |
| GET | `/api/companies/:id` | Company detail |
| PUT | `/api/companies/:id` | Update company fields, notes |
| POST | `/api/companies/:id/notes` | Add note log entry |
| GET | `/api/contracts` | List all contracts (supports `?status=` filter) |
| GET | `/api/contracts/:id` | Contract detail |
| PUT | `/api/contracts/:id` | Update contract (rates, hours, status) |
| POST | `/api/contracts/:id/updates` | Add contract update history entry |
| GET | `/api/talent` | List all talent |
| GET | `/api/talent/:id` | Talent detail |
| GET | `/api/issues` | List issues (supports filters: status, severity, priority, type, category, assignedTo) |
| GET | `/api/issues/:id` | Issue detail |
| POST | `/api/issues` | Create issue |
| PUT | `/api/issues/:id` | Update issue fields |
| POST | `/api/issues/:id/actions` | Add action log entry |
| GET | `/api/upsells` | List all upsells |
| GET | `/api/upsells/:id` | Upsell detail |
| PUT | `/api/upsells/:id` | Update upsell (status, owner, notes) |
| POST | `/api/upsells/:id/actions` | Add action log entry |
| GET | `/api/reports/mrr` | MRR report data |
| GET | `/api/reports/utilization` | Utilization report data |
| GET | `/api/reports/issues` | Issue summary report data |
| GET | `/api/reports/churn` | Churn analysis data |
| GET | `/api/reports/cs-metrics` | CS metrics aggregate data |
| GET | `/api/reports/engagement` | Client engagement report data |
| GET | `/api/reports/talent-health` | Talent health report data |
| GET | `/api/email-templates` | List templates |
| GET | `/api/email-templates/:id` | Template detail |
| PUT | `/api/email-templates/:id` | Update template |
| GET | `/api/scheduled-emails` | List scheduled emails |
| PUT | `/api/scheduled-emails/:id` | Toggle status (Active/Paused) |
| GET | `/api/interactions` | List client interactions |
| GET | `/api/replacements` | List replacement events |
| GET | `/api/utilization` | List utilization records |
| GET | `/api/surveys` | List talent surveys |
| GET | `/api/reviews` | List performance reviews |
| GET | `/api/job-openings` | List job openings |

---

## 6. Roles & Permissions

### Known Requirements
- **MRR Data** — Base MRR, Expected MRR, and Actual MRR fields must be gated behind a permission check. Leadership may restrict this to leadership-only access. Build the MRR panel as a discrete component that can be shown/hidden based on user role.
- **Issue Creation** — Currently internal team only. Future: client-facing issue reporting (out of scope for MVP but design with this in mind).

### Roles (Preliminary)
| Role | Access |
|------|--------|
| Customer Success Manager | All features except potentially MRR data |
| Leadership | All features including MRR data, reports |

**[To be finalized with leadership]**

---

## 7. Assumptions & Open Questions

Items that were placeholdered in the demo and need real decisions for production:

| Item | Demo Approach | What Engineers Need |
|------|--------------|-------------------|
| Account Health metric | Hardcoded values (Healthy / Needs Attention / At Risk) | Define the calculation logic — what inputs determine health? |
| Authentication | None | Auth system selection and integration |
| Data persistence | Local React state, resets on refresh | Database selection, schema design |
| Email sending | UI mockup only | Integration with email tooling (provider TBD) |
| Hours tracking data | Static percentages | Integration with time tracking software to pull actual hours |
| CSAT / NPS scores | Static demo data | How are these collected? Manual entry or integration? |
| Report scheduling | UI only, no actual automation | Cron/scheduler for auto-generating reports on intervals |
| CSV export | Client-side CSV generation | Server-side report generation if needed for larger datasets |
| Report timespan filter | UI built but reports use full dataset | Each report API should accept date range parameters |
| Admin-managed issue types | Hardcoded enum in TypeScript types | Needs admin configuration UI — see section 8.6 |
| Contract importance ranking | Percentile-based on expected MRR across all contracts | Confirm this is the right ranking logic for production |

---

## 8. Priority / Phasing Guidance

Suggested build order for production, based on stakeholder priorities:

### Phase 1 — Core Data & Company Management
- Database schema and API for Companies, Contacts, Contracts, Talent
- Company list and detail views with full CRUD
- Contract management within companies
- Contracts list page with status filtering

### Phase 2 — Issue Management
- Issue CRUD with full lifecycle (Open → In Progress → Monitoring Solution → Resolved)
- Action log functionality (shared component — build generically for reuse by Upsells)
- Issue assignment to team members
- Issue badges on contract cards

### Phase 3 — Reports & Analytics
- MRR actual vs expected report
- Issue summary report
- Churn analysis report
- CS metrics, utilization, engagement, talent health reports
- Export functionality
- Timespan filtering

### Phase 4 — Upsells & Pipeline
- Upsell CRUD with lifecycle (Identified → Proposed → Accepted → Closed-Won / Closed-Lost)
- Upsell badges on contract cards
- Upsell action log (reuse ActionLog component)

### Phase 5 — Communications & Polish
- Email template management
- Scheduled email check-ins with external email integration
- Role-based access control (MRR gating)
- Account health metric (once logic is defined)

**[To be adjusted based on leadership feedback from demo review]**

---

## 9. Future Iteration Roadmap

Items identified during demo review that should be scoped as the CRM evolves over the first year. These are not MVP blockers but will become important as the team works with real data at scale.

### 9.1 Unified Activity Timeline per Company
Currently notes, interactions, issues, and upsells are tracked in separate sections within the company detail page. A combined chronological feed ("what happened with this account recently?") would give CS managers a single view of all recent activity without switching between sections. This is one of the most-used views in production CRMs.

**Engineering consideration:** Requires a polymorphic feed that pulls from multiple entity types and sorts by date. Consider a shared `ActivityEvent` abstraction or a denormalized feed table.

### 9.2 Alerting / Task Generation
The data model already captures signals that should drive proactive action — utilization dropping below thresholds, CSAT declining, upsells stalling past target close dates. Currently there is no notification or task system to surface these.

**Engineering consideration:** Start with rule-based triggers (e.g., "if utilization < 50% for 2 consecutive weeks, create a task for the account owner"). Design the alert system to be extensible so new trigger types can be added without code changes — ideally admin-configurable.

### 9.3 Role-Based Access Control
The MRR panel was deliberately built as a separable sub-component to support future role-gating. The permission model should be designed early — it's significantly harder to retrofit. Known requirements:
- MRR data restricted to leadership roles
- Issue creation currently internal-only, but future client-facing issue reporting is planned
- Consider field-level permissions (e.g., talent rates visible to leadership only)

**Engineering consideration:** Design the RBAC system before building features on top of it. A role → permission mapping with both page-level and component-level checks is recommended.

### 9.4 Bulk Operations
All current interactions are single-record. At production scale the team will need:
- Bulk reassign issues (e.g., when a team member goes on leave)
- Bulk pause/resume email schedules
- Bulk update contract ownership
- Bulk export filtered views

**Engineering consideration:** Build bulk select + action patterns into list view components from the start. Retrofitting selection state and batch API endpoints is expensive.

### 9.5 Global Search
No global search exists in the demo. At scale a CS manager needs to quickly pull up any company, talent, issue, or contract from anywhere in the app.

**Engineering consideration:** A command-palette style search (Ctrl+K) that queries across all entity types. Consider a search index (Elasticsearch, Typesense, or PostgreSQL full-text search) rather than querying each table independently.

### 9.6 Admin-Managed Configuration
Issue types, categories, severities, and contract end reasons are currently hardcoded enums. In production these should be admin-configurable so the CS team can add/modify values without engineering involvement. This extends to other enum-like fields throughout the system.

**Engineering consideration:** Build a lightweight admin config system with a key-value or list-of-options pattern. Each configurable field references a config key rather than a hardcoded enum. Admin UI to manage these lists.
