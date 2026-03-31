# MAVI CRM — Data Collection & Calculation Assumptions

This document catalogs **every data point** in the MAVI CRM demo: how primary data would be collected in a production system, and how every derived/calculated metric is computed.

---

## Section 1: Primary Data Points

### Company

| Field | Type | Collection Method | Notes |
|-------|------|-------------------|-------|
| id | string | System Generated | Unique identifier, auto-assigned on creation |
| name | string | Manual Entry | CS team enters when onboarding a new client |
| description | string | Manual Entry | Brief description of the company |
| website | string | Manual Entry | Company website URL |
| industry | string | Manual Entry | Industry vertical (e.g., "Accounting", "Legal") |
| headquarters | string | Manual Entry | City/region of HQ |
| country | string | Manual Entry | Country of HQ |
| specialties | string | Manual Entry | Comma-separated list of specialties |
| linkedIn | string | Manual Entry | LinkedIn company page URL |
| employeeCount | number or null | Manual Entry | Approximate employee count; null if unknown |
| companyType | "High Value" / "Strategic" / "Standard" | Manual Entry | CS team classifies based on revenue and strategic importance |
| accountHealth | "Healthy" / "Needs Attention" / "At Risk" | Manual Entry | CS team sets and updates based on overall assessment; could be system-assisted in the future |
| revenueTier | "Enterprise" / "Mid-Market" / "SMB" | Contract/Agreement | Derived from contract value thresholds; may be manually overridden |
| strategicFlag | boolean | Manual Entry | CS/leadership marks accounts with strategic importance beyond revenue |
| primaryContact.name | string | Manual Entry | Main point of contact at the client |
| primaryContact.title | string | Manual Entry | Contact's job title |
| primaryContact.email | string | Manual Entry | Contact's email |
| primaryContact.phone | string | Manual Entry | Contact's phone number |
| additionalContacts[] | Contact[] | Manual Entry | Array of additional contacts, same fields as primaryContact |
| lastContactDate | string (ISO date) | System Generated | Auto-updated when a ClientInteraction is logged for this company |
| lastContactReason | string | Manual Entry | Brief reason for the last contact; entered when logging interaction |
| csatScores[] | ScoredEntry[] (date + score) | Survey Integration | Collected via periodic client satisfaction surveys |
| npsScores[] | ScoredEntry[] (date + score) | Survey Integration | Collected via periodic NPS surveys |
| numberOfReplacements | number | System Generated | Count of ReplacementEvents linked to this company |
| raisesGiven | number | Manual Entry | Number of raises given to talent on this account |
| raisesRequested | number | Manual Entry | Number of raises requested by talent on this account |
| contracts[] | string[] (contract IDs) | System Generated | Auto-populated as contracts are created under this company |
| notes | string | Manual Entry | Legacy free-text notes field |
| noteLog[] | NoteEntry[] | Manual Entry | Structured note log (see NoteEntry below) |

### NoteEntry

| Field | Type | Collection Method | Notes |
|-------|------|-------------------|-------|
| id | string | System Generated | Unique identifier |
| date | string (ISO date) | System Generated | Timestamp of when the note was created |
| author | string | System Generated | Auto-set to the logged-in CS team member |
| type | "Call" / "Email" / "Meeting" / "Internal" | Manual Entry | CS team selects the note type |
| tag | string | Manual Entry | Free-text tag for categorization |
| content | string | Manual Entry | The note body |

### Contract

| Field | Type | Collection Method | Notes |
|-------|------|-------------------|-------|
| id | string | System Generated | Unique identifier |
| companyId | string | System Generated | Link to parent company |
| companyName | string | System Generated | Denormalized from company for display convenience |
| talentId | string | Manual Entry | Selected when assigning talent to the contract |
| talentName | string | System Generated | Denormalized from talent record |
| talentRate | number | Contract/Agreement | Rate paid to the talent (per hour) |
| contractRate | number | Contract/Agreement | Rate billed to the client (per hour) |
| jobDescription | string | Contract/Agreement | Description of the role/work |
| roleType | string | Contract/Agreement | Category of work: "Tax", "Bookkeeping", "Audit", "Payroll", "Financial Reporting", etc. |
| expectedHoursPerWeek | number | Contract/Agreement | Agreed expected weekly hours |
| minimumHoursPerWeek | number | Contract/Agreement | Contractual minimum weekly hours |
| trialStartDate | string (ISO date) | Contract/Agreement | Start date of the trial period |
| trialEndDate | string or null | System Generated | Date the trial period ended; null if still in trial |
| trialOutcome | "Converted" / "Extended" / "Ended" / null | Manual Entry | CS team records outcome at end of trial; null if trial still active |
| longTermStartDate | string or null | System Generated | Date long-term contract began (after trial conversion); null if never converted |
| endDate | string or null | Manual Entry | Date the contract ended; null if still active |
| endReason | ContractEndReason or null | Manual Entry | Reason for contract end; null if still active. Options: "Performance Issue", "Talent Left Voluntarily", "Client Business Change", "Budget", "Role Change", "Contract Not Renewed" |
| status | "Trial" / "Active" / "At Risk" / "Ended" | Manual Entry | CS team manages contract lifecycle status |
| hoursUsed.lastWeek | number | Time Tracking Integration | Actual hours logged in the last week |
| hoursUsed.lastMonth | number | Time Tracking Integration | Actual hours logged in the last month |
| hoursUsed.lastQuarter | number | Time Tracking Integration | Actual hours logged in the last quarter |
| hoursUsed.lastYear | number | Time Tracking Integration | Actual hours logged in the last year |
| talentPerformanceScores[] | ScoredEntry[] | Survey Integration | Client-rated performance scores over time |
| talentSatisfactionScores[] | ScoredEntry[] | Survey Integration | Client-rated satisfaction with talent over time |
| mrr.base | number | Contract/Agreement | Base monthly recurring revenue (contractRate * minimumHoursPerWeek * ~4.33) |
| mrr.expected | number | Contract/Agreement | Expected MRR (contractRate * expectedHoursPerWeek * ~4.33) |
| mrr.actual | number | Billing Integration | Actual MRR billed in the current/most recent month |
| mrr.monthlyActual[] | (number or null)[] | Billing Integration | 12-element array (Jan-Dec) of actual monthly revenue; null for future months or months with no data |
| accountOwner | string | Manual Entry | CS team member who owns the account relationship |
| platformTeamOwner | string | Manual Entry | MAVI platform team member managing the contract |
| primaryPoc | string | Manual Entry | Primary point of contact for the contract |
| attachmentFileName | string or null | Manual Entry | Uploaded contract document filename; null if no attachment |
| timeToFirstIssue | number or null | System Generated | Days from trialStartDate to the first issue's createdDate; null if no issues exist |
| humanInputRiskFlag | boolean | Manual Entry | CS team flags contracts they believe are at risk based on qualitative judgment |
| humanInputRiskConfidence | "Low" / "Medium" / "High" / null | Manual Entry | CS team's confidence level in their risk assessment; null if no flag set |
| humanInputRiskNotes | string | Manual Entry | Free-text explanation of risk assessment |
| replacementEventIds[] | string[] | System Generated | Auto-populated when ReplacementEvents are created for this contract |

### Talent

| Field | Type | Collection Method | Notes |
|-------|------|-------------------|-------|
| id | string | System Generated | Unique identifier |
| name | string | Manual Entry | Talent's full name |
| email | string | Manual Entry | Talent's email address |
| phone | string | Manual Entry | Talent's phone number |
| location | string | Manual Entry | Talent's location/timezone |
| specialization | string | Manual Entry | Primary skill area (e.g., "Tax", "Bookkeeping") |
| contractIds[] | string[] | System Generated | Auto-populated as contracts are assigned |
| startDate | string (ISO date) | Manual Entry | Date the talent joined the MAVI platform |
| attritionRisk | "Low" / "Medium" / "High" | Manual Entry | CS/platform team assesses attrition risk based on signals |
| volatilityFlag | boolean | System Generated | Auto-set when talent has multiple reassignments or issues |

### Issue

| Field | Type | Collection Method | Notes |
|-------|------|-------------------|-------|
| id | string | System Generated | Unique identifier |
| title | string | Manual Entry | Short descriptive title for the issue |
| type | IssueType | Manual Entry | One of: "Talent Underperformance", "Talent Resignation", "Talent Raise Requested", "Talent Over-Reported Hours", "Trial Period Extension Requested", "Talent Underutilization", "Client Communication" |
| status | "Open" / "In Progress" / "Monitoring Solution" / "Resolved" | Manual Entry | CS team updates as work progresses |
| severity | "Low" / "Medium" / "High" / "Critical" | Manual Entry | CS team assesses severity at creation |
| priority | "Low" / "Medium" / "High" | Manual Entry | CS team sets priority |
| categories[] | IssueCategory[] | Manual Entry | One or more of: "Performance", "Utilization", "Communication", "Billing", "Replacement" |
| assignedTo | string | Manual Entry | CS team member responsible for resolution |
| companyId | string | System Generated | Link to company (set at creation) |
| companyName | string | System Generated | Denormalized from company |
| talentId | string | Manual Entry | Link to related talent |
| talentName | string | System Generated | Denormalized from talent |
| contractId | string | Manual Entry | Link to related contract |
| summary | string | Manual Entry | Detailed description of the issue |
| attachments[] | IssueAttachment[] | Manual Entry | Uploaded files (see below) |
| monetaryConcession | number | Manual Entry | Dollar amount of any concession given to client for this issue |
| resolutionNotes | string | Manual Entry | Notes on how the issue was resolved |
| createdDate | string (ISO date) | System Generated | Auto-set at issue creation |
| updatedDate | string (ISO date) | System Generated | Auto-updated on any change |
| actionLog[] | ActionEntry[] | Manual Entry | Chronological log of actions taken (see below) |

### IssueAttachment

| Field | Type | Collection Method | Notes |
|-------|------|-------------------|-------|
| id | string | System Generated | Unique identifier |
| fileName | string | System Generated | Name of the uploaded file |
| fileType | string | System Generated | File extension (e.g., "pdf", "png", "docx") |
| uploadedBy | string | System Generated | Auto-set to the user who uploaded |
| uploadedDate | string (ISO date) | System Generated | Auto-set on upload |

### ActionEntry

| Field | Type | Collection Method | Notes |
|-------|------|-------------------|-------|
| id | string | System Generated | Unique identifier |
| date | string (ISO date) | System Generated | Auto-set when action is logged |
| author | string | System Generated | Auto-set to the logged-in CS team member |
| note | string | Manual Entry | Description of the action taken |

### ReplacementEvent

| Field | Type | Collection Method | Notes |
|-------|------|-------------------|-------|
| id | string | System Generated | Unique identifier |
| contractId | string | System Generated | Link to the contract where the replacement occurred |
| companyId | string | System Generated | Link to the company |
| companyName | string | System Generated | Denormalized from company |
| previousTalentId | string | System Generated | The talent being replaced (auto-set from contract's current talent) |
| previousTalentName | string | System Generated | Denormalized from talent |
| newTalentId | string | Manual Entry | CS/platform team selects the replacement talent |
| newTalentName | string | System Generated | Denormalized from talent |
| reason | "Underperformance" / "Resignation" / "Client Request" / "Talent Unavailable" / "Other" | Manual Entry | CS team selects the reason for replacement |
| date | string (ISO date) | System Generated | Date the replacement was executed |
| successfulAt3Months | boolean or null | Manual Entry | CS team evaluates 3 months after replacement; null if too early to assess |
| notes | string | Manual Entry | Additional context about the replacement |

### ClientInteraction

| Field | Type | Collection Method | Notes |
|-------|------|-------------------|-------|
| id | string | System Generated | Unique identifier |
| companyId | string | System Generated | Link to the company |
| companyName | string | System Generated | Denormalized from company |
| date | string (ISO date) | Manual Entry / System Generated | Date of the interaction; auto-set on creation or pulled from email timestamp |
| type | "Check-In" / "QBR" / "Outreach" / "Escalation Response" / "Ad Hoc" | Manual Entry | CS team classifies the interaction type |
| initiatedBy | "CS" / "Client" | Manual Entry | Whether MAVI or the client initiated the interaction |
| medium | "Email" / "Call" / "Meeting" | Manual Entry | Communication channel used |
| author | string | System Generated | CS team member who logged it |
| responseReceived | boolean | Manual Entry / Email Integration | Whether the client responded; could be auto-detected from email platform |
| responseDate | string or null | Manual Entry / Email Integration | Date of client response; null if no response received |
| meetingHeld | boolean | Manual Entry | Whether a meeting actually took place |
| notes | string | Manual Entry | Summary of the interaction |

### UtilizationRecord

| Field | Type | Collection Method | Notes |
|-------|------|-------------------|-------|
| contractId | string | System Generated | Link to the contract |
| companyId | string | System Generated | Link to the company |
| talentId | string | System Generated | Link to the talent |
| weekStartDate | string (ISO date) | System Generated | Monday of the week this record covers |
| expectedHours | number | Contract/Agreement | Pulled from contract's expectedHoursPerWeek |
| minimumHours | number | Contract/Agreement | Pulled from contract's minimumHoursPerWeek |
| actualHours | number | Time Tracking Integration | Actual hours logged by the talent that week (from Clockify or similar) |

### TalentSurvey

| Field | Type | Collection Method | Notes |
|-------|------|-------------------|-------|
| id | string | System Generated | Unique identifier |
| talentId | string | System Generated | Link to the talent being surveyed |
| talentName | string | System Generated | Denormalized from talent |
| contractId | string | System Generated | Link to the relevant contract |
| companyId | string | System Generated | Link to the relevant company |
| sentDate | string (ISO date) | System Generated | Date the survey was sent to the talent |
| completedDate | string or null | Survey Integration | Date the talent completed the survey; null if not yet completed |
| satisfactionScore | number (1-10) or null | Survey Integration | Talent's self-reported satisfaction; null if survey not completed |
| flagComplaints | boolean | Survey Integration | Whether the survey response flagged complaints |
| flagReplacementRisk | boolean | Survey Integration | Whether the survey response indicates the talent may want to leave |
| notes | string | Survey Integration / Manual Entry | Survey free-text responses or CS team notes |

### EmailTemplate

| Field | Type | Collection Method | Notes |
|-------|------|-------------------|-------|
| id | string | System Generated | Unique identifier |
| name | string | Manual Entry | Template name for CS team reference |
| recipient | "Client" / "Internal" / "Both" | Manual Entry | Who receives emails from this template |
| triggerDays | number | Manual Entry | Number of days after triggerFrom event to send |
| triggerFrom | string | Manual Entry | The event that starts the timer (e.g., "trial start", "contract start") |
| recurring | boolean | Manual Entry | Whether the email should recur on a schedule |
| subject | string | Manual Entry | Email subject line (may contain template variables like `{{companyName}}`) |
| body | string | Manual Entry | Email body (may contain template variables like `{{talentName}}`, `{{avgUtilization}}`) |

### ScheduledEmail

| Field | Type | Collection Method | Notes |
|-------|------|-------------------|-------|
| id | string | System Generated | Unique identifier |
| templateId | string | System Generated | Link to the EmailTemplate being used |
| companyId | string | System Generated | Link to the target company |
| companyName | string | System Generated | Denormalized from company |
| nextSendDate | string (ISO date) | System Generated | Computed from template trigger rules |
| lastSentDate | string or null | System Generated | Date the last email was sent; null if never sent |
| status | "Active" / "Paused" | Manual Entry | CS team can pause/resume scheduled emails |

### JobOpening

| Field | Type | Collection Method | Notes |
|-------|------|-------------------|-------|
| id | string | System Generated | Unique identifier |
| companyId | string | Manual Entry | Link to the company the opening is for |
| role | string | Manual Entry | Role title / description |
| status | "New Lead" / "Sourcing" / "Interviewing" / "Offer" / "Filled" / "On Hold" | Manual Entry | CS/platform team updates as pipeline progresses |
| owner | string | Manual Entry | MAVI team member managing this opening |
| talent | string or null | Manual Entry | Talent assigned if status reaches "Offer" or "Filled"; null otherwise |
| priority | "Low" / "Medium" / "High" / "Urgent" | Manual Entry | Priority level for filling this opening |

---

## Section 2: Calculated/Derived Metrics

### CS TopLine Metrics

| Metric | Formula/Logic | Input Data | Displayed In |
|--------|--------------|------------|--------------|
| Avg Time to Replacement | For each ReplacementEvent, compute `daysBetween(contract.trialStartDate, replacement.date)`. Average all values. Rounded to nearest integer. | ReplacementEvent.date, Contract.trialStartDate | CS Metrics Report — TopLine section |
| % Clients with Replacement | `(count of unique companyIds in ReplacementEvents / total companies) * 100`. Rounded. | ReplacementEvent.companyId, Company[] | CS Metrics Report — TopLine section |
| Replacement Reason Distribution | Count of ReplacementEvents grouped by `reason`. Returns a record of reason -> count. | ReplacementEvent.reason | CS Metrics Report — TopLine section |
| Replacement Success Rate | `(count where successfulAt3Months === true / count where successfulAt3Months !== null) * 100`. Only evaluated replacements are counted (null excluded). Rounded. | ReplacementEvent.successfulAt3Months | CS Metrics Report — TopLine section |
| Avg Replacements Before Churn | Filter to ended contracts (`endDate !== null`). For each, count its ReplacementEvents. `total replacements on ended contracts / count of ended contracts`. Rounded to 1 decimal. | Contract.endDate, ReplacementEvent.contractId | CS Metrics Report — TopLine section |
| % Contracts Below Minimum Hours | Get the latest UtilizationRecord per contract (most recent weekStartDate). `(count where actualHours < minimumHours / total contracts with records) * 100`. Rounded. | UtilizationRecord (latest per contract): actualHours, minimumHours | CS Metrics Report — Revenue & Hours Health section |
| % Contracts Below Expected Hours | Get the latest UtilizationRecord per contract. `(count where actualHours < expectedHours / total contracts with records) * 100`. Rounded. | UtilizationRecord (latest per contract): actualHours, expectedHours | CS Metrics Report — Revenue & Hours Health section |
| % Time Below Expected Hours | Across ALL utilization records (not just latest): `(count where actualHours < expectedHours / total records) * 100`. Rounded. | UtilizationRecord[]: actualHours, expectedHours | CS Metrics Report — Revenue & Hours Health section |
| Revenue % Below Expected | `((totalExpectedMRR - totalActualMRR) / totalExpectedMRR) * 100`. Clamped to 0 minimum. Rounded. | Contract[]: mrr.expected, mrr.actual | CS Metrics Report — Revenue & Hours Health section |
| Revenue $ Below Expected | `totalExpectedMRR - totalActualMRR`. Clamped to 0 minimum. | Contract[]: mrr.expected, mrr.actual | CS Metrics Report — Revenue & Hours Health section |
| Total Concessions | `sum(issue.monetaryConcession)` across all issues. | Issue[]: monetaryConcession | CS Metrics Report — Revenue & Hours Health section |

### Engagement Metrics

| Metric | Formula/Logic | Input Data | Displayed In |
|--------|--------------|------------|--------------|
| Avg Response Time (fleet-wide) | Filter interactions where `responseReceived === true && responseDate !== null`. `sum(daysBetween(interaction.date, interaction.responseDate)) / count`. Rounded to 1 decimal (days). | ClientInteraction[]: date, responseDate, responseReceived | CS Metrics Report — Engagement section; Client Engagement Report |
| Check-In Completion Rate | Filter interactions where `type === "Check-In" OR type === "QBR"`. `(count where responseReceived === true / total check-ins) * 100`. Rounded. | ClientInteraction[]: type, responseReceived | CS Metrics Report — Engagement section; Client Engagement Report |
| Proactive vs Reactive Ratio | `proactive = count where initiatedBy === "CS"`. `reactive = count where initiatedBy === "Client"`. `proactivePct = (proactive / (proactive + reactive)) * 100`. Rounded. | ClientInteraction[]: initiatedBy | CS Metrics Report — Engagement section; Client Engagement Report |
| Ignored Follow-ups (fleet-wide) | `count where responseReceived === false` across all interactions. | ClientInteraction[]: responseReceived | CS Metrics Report — Engagement section |
| Per-Company: Total Interactions | `count of interactions where companyId matches`. | ClientInteraction[]: companyId | Company Detail — Engagement tab |
| Per-Company: Avg Response Time | Same formula as fleet-wide, but filtered to one company. | ClientInteraction[] filtered by companyId | Company Detail — Engagement tab |
| Per-Company: Last Response Date | Most recent `responseDate` among interactions with `responseReceived === true`, sorted descending. | ClientInteraction[]: responseDate, responseReceived | Company Detail — Engagement tab |
| Per-Company: Ignored Follow-ups | `count where responseReceived === false` for this company's interactions. | ClientInteraction[] filtered by companyId | Company Detail — Engagement tab |
| Per-Company: Proactive Count | `count where initiatedBy === "CS"` for this company. | ClientInteraction[] filtered by companyId | Company Detail — Engagement tab |
| Per-Company: Reactive Count | `count where initiatedBy === "Client"` for this company. | ClientInteraction[] filtered by companyId | Company Detail — Engagement tab |

### Talent Metrics

| Metric | Formula/Logic | Input Data | Displayed In |
|--------|--------------|------------|--------------|
| Talent Tenure (months) | `round(daysAgo(talent.startDate) / 30)` where `daysAgo` is days between startDate and today. | Talent.startDate, current date | CS Metrics Report — Talent section; Talent detail views |
| Avg Tenure (months) | `sum(tenureMonths for each talent) / count(talents)`. Rounded. | Talent[]: startDate | CS Metrics Report — Talent section |
| Attrition Rate | `(count where attritionRisk === "High" / total talents) * 100`. Rounded. Note: this is a proxy — counts high-risk talent as likely attrition. | Talent[]: attritionRisk | CS Metrics Report — Talent section |
| Avg Satisfaction Score | Filter surveys where `satisfactionScore !== null`. `sum(satisfactionScore) / count`. Rounded to 1 decimal. | TalentSurvey[]: satisfactionScore | CS Metrics Report — Talent section |
| Survey Completion Rate | `(count where completedDate !== null / total surveys) * 100`. Rounded. | TalentSurvey[]: completedDate | CS Metrics Report — Talent section |
| Satisfaction Trend (per talent) | Filter surveys for the given talentId where `satisfactionScore !== null`. Sort by sentDate ascending. Return array of scores. | TalentSurvey[]: talentId, sentDate, satisfactionScore | Talent detail views (sparkline/trend) |

### Utilization Metrics

| Metric | Formula/Logic | Input Data | Displayed In |
|--------|--------------|------------|--------------|
| Utilization % (per contract) | `round((actualHours / expectedHours) * 100)`. Returns 0 if expectedHours is 0. | UtilizationRecord: actualHours, expectedHours | Utilization Report — per-row; Contract cards |
| Utilization Health | Based on utilization %: `>= 80%` = "healthy", `>= 50%` = "medium", `< 50%` = "at-risk". | Utilization % (derived) | Utilization Report — health badge per row |
| Utilization Trend (per contract) | Get all UtilizationRecords for the contract sorted by weekStartDate. If fewer than 4 records, return "stable". Compare avg actualHours of last 4 records vs prior 4 records. `delta > 1` = "up", `delta < -1` = "down", otherwise "stable". | UtilizationRecord[] filtered by contractId: weekStartDate, actualHours | Utilization Report — trend arrow per row |
| Fleet Avg Utilization | `round(sum(utilization % for each active contract) / count(contracts))`. Computed from the per-contract utilization % values. | All per-contract Utilization % values | Utilization Report — summary card |
| Healthy / Medium / At-Risk Counts | Count of contracts in each utilization health bucket. | Per-contract Utilization Health values | Utilization Report — summary cards |

### Per-Company Aggregations

| Metric | Formula/Logic | Input Data | Displayed In |
|--------|--------------|------------|--------------|
| Total Replacements | `count of ReplacementEvents where companyId matches`. | ReplacementEvent[]: companyId | Company Detail — Replacement stats |
| Replacements Last 90 Days | `count where companyId matches AND daysAgo(date) <= 90`. | ReplacementEvent[]: companyId, date | Company Detail — Replacement stats |
| Rapid Replacements | Count of ReplacementEvents for this company where the same contractId has more than one replacement (multiple replacements on same contract = rapid). | ReplacementEvent[]: companyId, contractId | Company Detail — Replacement stats |
| ACV (Annual Contract Value) | `sum(contract.mrr.expected for all company contracts) * 12`. | Contract[]: mrr.expected, companyId | Company List — ACV column |
| Open Issue Count | `count of issues where companyId matches AND status !== "Resolved"`. | Issue[]: companyId, status | Company List — Open Issues column |

### Per-Contract Metrics

| Metric | Formula/Logic | Input Data | Displayed In |
|--------|--------------|------------|--------------|
| Contract Importance Label | Sort all contracts by `mrr.expected` descending. Compute this contract's rank percentile (`rank / total`). Labels: `<= 5%` = "Top 5% Contract", `<= 10%` = "Top 10% Contract", `<= 20%` = "Top 20% Contract", `<= 30%` = "Top 30% Contract", `<= 40%` = "Top 40% Contract", `<= 50%` = "Top 50% Contract", `> 50%` = "Standard Contract". | Contract[]: mrr.expected (all contracts for ranking), this contract's mrr.expected | Contract Card — importance badge |
| Issue Windows (30d / 90d / 365d / total) | Filter issues by contractId. `last30 = count where daysAgo(createdDate) <= 30`. `last90 = count where daysAgo(createdDate) <= 90`. `lastYear = count where daysAgo(createdDate) <= 365`. `total = count all`. | Issue[]: contractId, createdDate | Contract Detail — issue summary |

### Per-Issue Metrics

| Metric | Formula/Logic | Input Data | Displayed In |
|--------|--------------|------------|--------------|
| Avg Time Between Actions | Sort all actionLog dates ascending. Compute gaps between consecutive dates. `avg = sum(gaps) / count(gaps)`. Rounded to 1 decimal (days). Returns null if fewer than 2 actions. | Issue.actionLog[]: date | Issue Detail view |
| Max Time Between Actions | Same gap computation as above, but return `max(gaps)`. Returns null if fewer than 2 actions. | Issue.actionLog[]: date | Issue Detail view |

### MRR Report Metrics

| Metric | Formula/Logic | Input Data | Displayed In |
|--------|--------------|------------|--------------|
| Company-Level Base MRR | `sum(contract.mrr.base)` for all contracts belonging to the company. | Contract[]: mrr.base, companyId | MRR Report — Base MRR column |
| Company-Level Expected MRR | `sum(contract.mrr.expected)` for all contracts belonging to the company. | Contract[]: mrr.expected, companyId | MRR Report — Expected MRR column |
| Company-Level Monthly Actuals | For each month (Jan-Dec), sum `contract.mrr.monthlyActual[i]` across all company contracts. Null values are skipped. | Contract[]: mrr.monthlyActual[], companyId | MRR Report — monthly columns |
| Monthly Variance | `actual - expected` for each monthly cell. Positive = over-performing, negative = under-performing. Color-coded green (positive) or red (negative). | Company-level monthly actual (derived), Company-level expected MRR (derived) | MRR Report — sub-text under each monthly actual |
| Company Contract Count | `count of contracts where companyId matches`. | Contract[]: companyId | MRR Report — Contracts column |

---

## Collection Method Summary

| Method | Count of Fields Using It | Description |
|--------|--------------------------|-------------|
| **System Generated** | ~45 fields | IDs, timestamps, denormalized names, auto-computed fields |
| **Manual Entry** | ~55 fields | CS team enters during daily workflow |
| **Contract/Agreement** | ~12 fields | Sourced from signed contract terms |
| **Survey Integration** | ~8 fields | From client CSAT/NPS surveys and talent satisfaction surveys |
| **Time Tracking Integration** | ~5 fields | Hours data from Clockify or similar |
| **Billing Integration** | ~3 fields | Actual revenue/MRR from invoicing system |
| **Email Integration** | ~2 fields | Response tracking from email platform (responseReceived, responseDate) |
| **Client Portal** | 0 fields (future) | No fields currently rely on client self-service entry |

---

## Notes

- **Denormalized fields** (e.g., `companyName` on Contract, `talentName` on Issue) exist for display performance in the demo. In production, these would either be joined at query time or synced via database triggers.
- **ScoredEntry** is a reusable shape (`{ date: string, score: number }`) used for CSAT scores, NPS scores, talent performance scores, and talent satisfaction scores.
- **hoursUsed** on Contract is an aggregated summary (lastWeek/lastMonth/lastQuarter/lastYear). In production, this would be computed from UtilizationRecords rather than stored directly.
- **numberOfReplacements** on Company is stored directly but in production should be derived from the count of ReplacementEvents linked to the company.
- **humanInputRiskFlag / humanInputRiskConfidence / humanInputRiskNotes** are intentionally manual fields — they capture the CS team's qualitative judgment that cannot be fully automated.
- **volatilityFlag** on Talent is described as system-generated based on patterns (multiple reassignments or issues), but the threshold logic is not explicitly defined in the demo.
- **Attrition Rate** uses `attritionRisk === "High"` as a proxy for actual attrition, since the demo does not track talent departures separately from contract end reasons.
- **Avg Time to Replacement** measures days from `trialStartDate` to replacement date — this represents time from contract inception to replacement, not time to find a replacement once initiated.
