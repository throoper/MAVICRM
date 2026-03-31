// ── Shared ───────────────────────────────────────────────────────

export interface Contact {
  name: string;
  title: string;
  email: string;
  phone: string;
}

export interface ScoredEntry {
  date: string;
  score: number;
}

export const TEAM_MEMBERS = ["Dave", "Kath", "Molly"] as const;

// ── Company ─────────────────────────────────────────────────────

export type RevenueTier = "Enterprise" | "Mid-Market" | "SMB";

export interface Company {
  id: string;
  name: string;
  description: string;
  website: string;
  industry: string;
  headquarters: string;
  country: string;
  specialties: string;
  linkedIn: string;
  employeeCount: number | null;
  companyType: "High Value" | "Strategic" | "Standard";
  accountHealth: "Healthy" | "Needs Attention" | "At Risk";
  revenueTier: RevenueTier;
  strategicFlag: boolean;
  primaryContact: Contact;
  additionalContacts: Contact[];
  lastContactDate: string;
  lastContactReason: string;
  csatScores: ScoredEntry[];
  npsScores: ScoredEntry[];
  numberOfReplacements: number;
  raisesGiven: number;
  raisesRequested: number;
  contracts: string[]; // contract IDs
  notes: string;
  noteLog: NoteEntry[];
}

export type NoteType = "Call" | "Email" | "Meeting" | "Internal";

export interface NoteEntry {
  id: string;
  date: string;
  author: string;
  type: NoteType;
  tag: string;
  content: string;
}

// ── Contract ────────────────────────────────────────────────────

export type ContractStatus = "Trial" | "Active" | "At Risk" | "Ended";
export type ContractEndReason =
  | "Performance Issue"
  | "Talent Left Voluntarily"
  | "Client Business Change"
  | "Budget"
  | "Role Change"
  | "Contract Not Renewed"
  | null;
export type TrialOutcome = "Converted" | "Extended" | "Ended" | null;

export type ContractUpdateReason =
  | "Raise — Exceptional Performance"
  | "Raise — Market Adjustment"
  | "Raise — Client Requested"
  | "Rate Renegotiation"
  | "Hours Adjustment"
  | "Role Change"
  | "Other";

export interface ContractUpdateEntry {
  id: string;
  date: string;
  reason: ContractUpdateReason;
  author: string;
  notes: string;
  previousValues: {
    talentRate?: number;
    contractRate?: number;
    expectedHoursPerWeek?: number;
    minimumHoursPerWeek?: number;
    jobDescription?: string;
    roleType?: string;
  };
}

export interface PipelineNote {
  date: string;
  author: string;
  note: string;
}

export interface PipelineData {
  pipelineStage: "Sourcing" | "Interviewing" | "Offer" | "Closed Won";
  dealOwner: string;
  closeDate: string;
  originalJobDescription: string;
  salesNotes: PipelineNote[];
}

export interface Contract {
  id: string;
  companyId: string;
  companyName: string;
  talentId: string;
  talentName: string;
  talentRate: number;
  contractRate: number;
  jobDescription: string;
  roleType: string; // e.g. "Tax", "Bookkeeping", "Audit", "Payroll", "Financial Reporting"
  expectedHoursPerWeek: number;
  minimumHoursPerWeek: number;
  trialStartDate: string;
  trialEndDate: string | null; // when the trial period ended
  trialOutcome: TrialOutcome;
  longTermStartDate: string | null;
  endDate: string | null; // when contract ended (null = still active)
  endReason: ContractEndReason;
  status: ContractStatus;
  healthScore: "Healthy" | "Needs Attention" | "At Risk";
  hoursUsed: {
    lastWeek: number;
    lastMonth: number;
    lastQuarter: number;
    lastYear: number;
  };
  talentPerformanceScores: ScoredEntry[];
  talentSatisfactionScores: ScoredEntry[];
  mrr: {
    base: number;
    expected: number;
    actual: number;
    monthlyActual: (number | null)[]; // 12 entries, Jan–Dec; null = future/no data
  };
  accountOwner: string;
  platformTeamOwner: string;
  primaryPoc: string;
  attachmentFileName: string | null;
  // CS metrics fields
  timeToFirstIssue: number | null; // days from trial start to first issue; null = no issues
  humanInputRiskFlag: boolean;
  humanInputRiskConfidence: "Low" | "Medium" | "High" | null;
  humanInputRiskNotes: string;
  replacementEventIds: string[];
  updateHistory: ContractUpdateEntry[];
  pipelineData: PipelineData | null;
}

// ── Talent ───────────────────────────────────────────────────────

export interface Talent {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  specialization: string;
  contractIds: string[];
  // CS metrics fields
  startDate: string; // when they joined the MAVI platform
  attritionRisk: "Low" | "Medium" | "High";
  volatilityFlag: boolean; // multiple reassignments or issues
}

// ── Issues ──────────────────────────────────────────────────────

export type IssueStatus = "Open" | "In Progress" | "Monitoring Solution" | "Resolved";
export type IssueType =
  | "Talent Underperformance"
  | "Talent Resignation"
  | "Talent Raise Requested"
  | "Talent Over-Reported Hours"
  | "Trial Period Extension Requested"
  | "Talent Underutilization"
  | "Client Communication";
export type IssueSeverity = "Low" | "Medium" | "High" | "Critical";
export type IssuePriority = "Low" | "Medium" | "High";
export type IssueCategory = "Performance" | "Utilization" | "Communication" | "Billing" | "Replacement";

export interface IssueAttachment {
  id: string;
  fileName: string;
  fileType: string; // e.g. "pdf", "png", "docx"
  uploadedBy: string;
  uploadedDate: string;
}

export interface ActionEntry {
  id: string;
  date: string;
  author: string;
  note: string;
}

export interface Issue {
  id: string;
  title: string;
  type: IssueType;
  status: IssueStatus;
  severity: IssueSeverity;
  priority: IssuePriority;
  categories: IssueCategory[];
  assignedTo: string;
  companyId: string;
  companyName: string;
  talentId: string;
  talentName: string;
  contractId: string;
  summary: string;
  attachments: IssueAttachment[];
  monetaryConcession: number;
  resolutionNotes: string;
  createdDate: string;
  updatedDate: string;
  actionLog: ActionEntry[];
}

// ── Replacement Events ──────────────────────────────────────────

export type ReplacementReason =
  | "Underperformance"
  | "Resignation"
  | "Client Request"
  | "Talent Unavailable"
  | "Other";

export interface ReplacementEvent {
  id: string;
  contractId: string;
  companyId: string;
  companyName: string;
  previousTalentId: string;
  previousTalentName: string;
  newTalentId: string;
  newTalentName: string;
  reason: ReplacementReason;
  date: string;
  successfulAt3Months: boolean | null; // null = too early to tell
  notes: string;
}

// ── Client Interactions ─────────────────────────────────────────

export type InteractionType = "Check-In" | "QBR" | "Outreach" | "Escalation Response" | "Ad Hoc";
export type InteractionInitiator = "CS" | "Client";
export type InteractionMedium = "Email" | "Call" | "Meeting";

export interface ClientInteraction {
  id: string;
  companyId: string;
  companyName: string;
  date: string;
  type: InteractionType;
  initiatedBy: InteractionInitiator;
  medium: InteractionMedium;
  author: string;
  responseReceived: boolean;
  responseDate: string | null;
  meetingHeld: boolean;
  notes: string;
}

// ── Utilization Records ─────────────────────────────────────────

export interface UtilizationRecord {
  contractId: string;
  companyId: string;
  talentId: string;
  weekStartDate: string; // ISO date of Monday
  expectedHours: number;
  minimumHours: number;
  actualHours: number;
}

// ── Talent Surveys ──────────────────────────────────────────────

export interface TalentSurvey {
  id: string;
  talentId: string;
  talentName: string;
  contractId: string;
  companyId: string;
  sentDate: string;
  completedDate: string | null; // null = not yet completed
  satisfactionScore: number | null; // 1-10; null if not completed
  flagComplaints: boolean;
  flagReplacementRisk: boolean;
  notes: string;
}

// ── Performance Reviews ─────────────────────────────────────────

export interface PerformanceReview {
  id: string;
  talentId: string;
  talentName: string;
  contractId: string;
  companyId: string;
  reviewerName: string; // client contact who provided the review
  sentDate: string;
  completedDate: string | null;
  performanceScore: number | null; // 1-10; null if not completed
  flagUnderperformance: boolean;
  flagExceptionalWork: boolean;
  notes: string;
}

// ── Email Templates ─────────────────────────────────────────────

export interface EmailTemplate {
  id: string;
  name: string;
  recipient: "Client" | "Talent" | "Internal" | "Both";
  triggerDays: number;
  triggerFrom: string;
  recurring: boolean;
  subject: string;
  body: string;
}

export interface ScheduledEmail {
  id: string;
  templateId: string;
  companyId: string;
  companyName: string;
  nextSendDate: string;
  lastSentDate: string | null;
  status: "Active" | "Paused";
}

// ── Upsells ────────────────────────────────────────────────────

export type UpsellStatus = "Identified" | "Proposed" | "Accepted" | "Closed-Won" | "Closed-Lost";

export interface Upsell {
  id: string;
  contractId: string;
  companyId: string;
  companyName: string;
  talentId: string;
  talentName: string;
  status: UpsellStatus;
  currentHoursPerWeek: number;
  proposedHoursPerWeek: number;
  expansionValue: number; // monthly $ delta
  dateIdentified: string;
  targetCloseDate: string;
  owner: string;
  notes: string;
  actionLog: ActionEntry[];
}

// ── Job Openings ────────────────────────────────────────────────

export type JobOpeningStatus = "New Lead" | "Sourcing" | "Interviewing" | "Offer" | "Filled" | "On Hold";
export type JobOpeningPriority = "Low" | "Medium" | "High" | "Urgent";

export interface JobOpening {
  id: string;
  companyId: string;
  role: string;
  status: JobOpeningStatus;
  owner: string;
  talent: string | null;
  priority: JobOpeningPriority;
}
