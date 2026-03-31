import type { JobOpening } from "../types";

export const jobOpeningData: JobOpening[] = [
  // Apex Financial Group — considering a 3rd placement
  { id: "jo-001", companyId: "comp-001", role: "AP Specialist", status: "Sourcing", owner: "Dave", talent: null, priority: "Medium" },

  // Brightstone Healthcare — expansion when new clinic opens
  { id: "jo-002", companyId: "comp-002", role: "Financial Reporting Analyst", status: "New Lead", owner: "Kath", talent: null, priority: "Low" },

  // Cedar Manufacturing — may need to replace James
  { id: "jo-003", companyId: "comp-003", role: "Tax Specialist (Replacement)", status: "Sourcing", owner: "Dave", talent: null, priority: "Urgent" },

  // Dataflow Analytics — wants a tax specialist by year-end
  { id: "jo-004", companyId: "comp-004", role: "Tax Specialist", status: "New Lead", owner: "Kath", talent: null, priority: "Low" },

  // Evergreen Logistics — no open roles currently

  // Falcon Security Systems — no open roles currently

  // Greenfield Ventures — monitoring Luis's trial
  { id: "jo-005", companyId: "comp-007", role: "Tax Advisor (Backup)", status: "On Hold", owner: "Dave", talent: null, priority: "Medium" },

  // Horizon Retail Co — Lisa wants a 3rd role by mid-year
  { id: "jo-006", companyId: "comp-008", role: "Staff Accountant", status: "Interviewing", owner: "Molly", talent: "Aisha Patel", priority: "High" },

  // Iron Ridge Construction — no open roles currently

  // Junction Media Group — may need to replace Chen Wei
  { id: "jo-007", companyId: "comp-010", role: "Audit & Financial Statements (Replacement)", status: "Sourcing", owner: "Dave", talent: null, priority: "High" },
];
