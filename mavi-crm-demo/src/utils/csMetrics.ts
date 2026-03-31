import type {
  ReplacementEvent,
  ClientInteraction,
  UtilizationRecord,
  TalentSurvey,
  Contract,
  Company,
  Issue,
  Talent,
} from "../types";

// ── Helpers ─────────────────────────────────────────────────────

function daysBetween(a: string, b: string): number {
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86_400_000);
}

function daysAgo(date: string): number {
  return daysBetween(date, new Date().toISOString().slice(0, 10));
}

// ── Replacement Metrics ─────────────────────────────────────────

export function calcAvgTimeToReplacement(replacements: ReplacementEvent[], contracts: Contract[]): number | null {
  const times: number[] = [];
  for (const r of replacements) {
    const contract = contracts.find((c) => c.id === r.contractId);
    if (contract) {
      times.push(daysBetween(contract.trialStartDate, r.date));
    }
  }
  return times.length > 0 ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : null;
}

export function calcPctClientsWithReplacement(replacements: ReplacementEvent[], companies: Company[]): number {
  const companiesWithReplacement = new Set(replacements.map((r) => r.companyId));
  return companies.length > 0 ? Math.round((companiesWithReplacement.size / companies.length) * 100) : 0;
}

export function calcReplacementReasonDistribution(replacements: ReplacementEvent[]): Record<string, number> {
  const dist: Record<string, number> = {};
  for (const r of replacements) {
    dist[r.reason] = (dist[r.reason] || 0) + 1;
  }
  return dist;
}

export function calcReplacementSuccessRate(replacements: ReplacementEvent[]): number | null {
  const evaluated = replacements.filter((r) => r.successfulAt3Months !== null);
  if (evaluated.length === 0) return null;
  const successful = evaluated.filter((r) => r.successfulAt3Months === true).length;
  return Math.round((successful / evaluated.length) * 100);
}

export function calcAvgReplacementsBeforeChurn(replacements: ReplacementEvent[], contracts: Contract[]): number | null {
  const endedContracts = contracts.filter((c) => c.endDate !== null);
  if (endedContracts.length === 0) return null;
  const total = endedContracts.reduce((sum, c) => sum + replacements.filter((r) => r.contractId === c.id).length, 0);
  return Math.round((total / endedContracts.length) * 10) / 10;
}

// ── Revenue & Hours Health ──────────────────────────────────────

export function calcPctContractsBelowMinimumHours(utilization: UtilizationRecord[]): number {
  const latestByContract = getLatestUtilizationByContract(utilization);
  if (latestByContract.length === 0) return 0;
  const below = latestByContract.filter((r) => r.actualHours < r.minimumHours).length;
  return Math.round((below / latestByContract.length) * 100);
}

export function calcPctContractsBelowExpectedHours(utilization: UtilizationRecord[]): number {
  const latestByContract = getLatestUtilizationByContract(utilization);
  if (latestByContract.length === 0) return 0;
  const below = latestByContract.filter((r) => r.actualHours < r.expectedHours).length;
  return Math.round((below / latestByContract.length) * 100);
}

export function calcPctTimeBelowExpected(utilization: UtilizationRecord[]): number {
  if (utilization.length === 0) return 0;
  const below = utilization.filter((r) => r.actualHours < r.expectedHours).length;
  return Math.round((below / utilization.length) * 100);
}

export function calcRevenueBelowExpected(contracts: Contract[]): { pct: number; dollars: number } {
  const totalExpected = contracts.reduce((s, c) => s + c.mrr.expected, 0);
  const totalActual = contracts.reduce((s, c) => s + c.mrr.actual, 0);
  const gap = totalExpected - totalActual;
  return {
    pct: totalExpected > 0 ? Math.round((gap / totalExpected) * 100) : 0,
    dollars: Math.max(0, gap),
  };
}

export function calcTotalConcessions(issues: Issue[]): number {
  return issues.reduce((s, i) => s + i.monetaryConcession, 0);
}

// ── Engagement Metrics ──────────────────────────────────────────

export function calcAvgResponseTime(interactions: ClientInteraction[]): number | null {
  const withResponse = interactions.filter((i) => i.responseReceived && i.responseDate);
  if (withResponse.length === 0) return null;
  const totalDays = withResponse.reduce((s, i) => s + daysBetween(i.date, i.responseDate!), 0);
  return Math.round((totalDays / withResponse.length) * 10) / 10;
}

export function calcCheckInCompletionRate(interactions: ClientInteraction[]): number {
  const checkIns = interactions.filter((i) => i.type === "Check-In" || i.type === "QBR");
  if (checkIns.length === 0) return 0;
  const completed = checkIns.filter((i) => i.responseReceived).length;
  return Math.round((completed / checkIns.length) * 100);
}

export function calcProactiveVsReactive(interactions: ClientInteraction[]): { proactive: number; reactive: number; proactivePct: number } {
  const proactive = interactions.filter((i) => i.initiatedBy === "CS").length;
  const reactive = interactions.filter((i) => i.initiatedBy === "Client").length;
  const total = proactive + reactive;
  return { proactive, reactive, proactivePct: total > 0 ? Math.round((proactive / total) * 100) : 0 };
}

export function calcIgnoredFollowups(interactions: ClientInteraction[]): number {
  return interactions.filter((i) => !i.responseReceived).length;
}

// ── Talent Metrics ──────────────────────────────────────────────

export function calcTalentTenureMonths(talent: Talent): number {
  return Math.round(daysAgo(talent.startDate) / 30);
}

export function calcAvgTenureMonths(talentList: Talent[]): number {
  if (talentList.length === 0) return 0;
  return Math.round(talentList.reduce((s, t) => s + calcTalentTenureMonths(t), 0) / talentList.length);
}

export function calcAttritionRate(talentList: Talent[]): number {
  if (talentList.length === 0) return 0;
  const highRisk = talentList.filter((t) => t.attritionRisk === "High").length;
  return Math.round((highRisk / talentList.length) * 100);
}

export function calcAvgSatisfactionScore(surveys: TalentSurvey[]): number | null {
  const completed = surveys.filter((s) => s.satisfactionScore !== null);
  if (completed.length === 0) return null;
  return Math.round((completed.reduce((sum, s) => sum + s.satisfactionScore!, 0) / completed.length) * 10) / 10;
}

export function calcSurveyCompletionRate(surveys: TalentSurvey[]): number {
  if (surveys.length === 0) return 0;
  const completed = surveys.filter((s) => s.completedDate !== null).length;
  return Math.round((completed / surveys.length) * 100);
}

export function calcSatisfactionTrend(surveys: TalentSurvey[], talentId: string): number[] {
  return surveys
    .filter((s) => s.talentId === talentId && s.satisfactionScore !== null)
    .sort((a, b) => a.sentDate.localeCompare(b.sentDate))
    .map((s) => s.satisfactionScore!);
}

// ── Utilization Helpers ─────────────────────────────────────────

export function getLatestUtilizationByContract(utilization: UtilizationRecord[]): UtilizationRecord[] {
  const map = new Map<string, UtilizationRecord>();
  for (const r of utilization) {
    const existing = map.get(r.contractId);
    if (!existing || r.weekStartDate > existing.weekStartDate) {
      map.set(r.contractId, r);
    }
  }
  return Array.from(map.values());
}

export function calcUtilizationPct(actual: number, expected: number): number {
  return expected > 0 ? Math.round((actual / expected) * 100) : 0;
}

export function utilizationHealth(pct: number): "healthy" | "medium" | "at-risk" {
  if (pct >= 80) return "healthy";
  if (pct >= 50) return "medium";
  return "at-risk";
}

export function calcUtilizationTrend(utilization: UtilizationRecord[], contractId: string): "up" | "down" | "stable" {
  const records = utilization
    .filter((r) => r.contractId === contractId)
    .sort((a, b) => a.weekStartDate.localeCompare(b.weekStartDate));
  if (records.length < 4) return "stable";
  const recent4 = records.slice(-4);
  const prior4 = records.slice(-8, -4);
  if (prior4.length === 0) return "stable";
  const recentAvg = recent4.reduce((s, r) => s + r.actualHours, 0) / recent4.length;
  const priorAvg = prior4.reduce((s, r) => s + r.actualHours, 0) / prior4.length;
  const delta = recentAvg - priorAvg;
  if (delta > 1) return "up";
  if (delta < -1) return "down";
  return "stable";
}

// ── Per-Company Aggregations ────────────────────────────────────

export function calcCompanyInteractionStats(interactions: ClientInteraction[], companyId: string) {
  const compInteractions = interactions.filter((i) => i.companyId === companyId);
  const withResponse = compInteractions.filter((i) => i.responseReceived && i.responseDate);
  const avgResponseTime = withResponse.length > 0
    ? Math.round((withResponse.reduce((s, i) => s + daysBetween(i.date, i.responseDate!), 0) / withResponse.length) * 10) / 10
    : null;
  const lastResponseDate = withResponse.length > 0
    ? withResponse.sort((a, b) => b.responseDate!.localeCompare(a.responseDate!))[0].responseDate
    : null;
  const ignored = compInteractions.filter((i) => !i.responseReceived).length;
  const proactive = compInteractions.filter((i) => i.initiatedBy === "CS").length;
  const reactive = compInteractions.filter((i) => i.initiatedBy === "Client").length;
  return { total: compInteractions.length, avgResponseTime, lastResponseDate, ignored, proactive, reactive };
}

export function calcCompanyReplacementStats(replacements: ReplacementEvent[], companyId: string) {
  const compReplacements = replacements.filter((r) => r.companyId === companyId);
  const last90 = compReplacements.filter((r) => daysAgo(r.date) <= 90).length;
  const rapid = compReplacements.filter((r) => {
    const contract = compReplacements.filter((r2) => r2.contractId === r.contractId);
    return contract.length > 1; // multiple replacements on same contract
  }).length;
  return { total: compReplacements.length, last90, rapid };
}

// ── Per-Issue Metrics ───────────────────────────────────────────

export function calcTimeBetweenActions(issue: Issue): { avg: number | null; max: number | null } {
  const dates = issue.actionLog.map((a) => a.date).sort();
  if (dates.length < 2) return { avg: null, max: null };
  const gaps: number[] = [];
  for (let i = 1; i < dates.length; i++) {
    gaps.push(daysBetween(dates[i - 1], dates[i]));
  }
  return {
    avg: Math.round((gaps.reduce((a, b) => a + b, 0) / gaps.length) * 10) / 10,
    max: Math.max(...gaps),
  };
}

// ── Contract Issue Windows ──────────────────────────────────────

export function calcContractIssueWindows(issues: Issue[], contractId: string): { last30: number; last90: number; lastYear: number; total: number } {
  const contractIssues = issues.filter((i) => i.contractId === contractId);
  return {
    last30: contractIssues.filter((i) => daysAgo(i.createdDate) <= 30).length,
    last90: contractIssues.filter((i) => daysAgo(i.createdDate) <= 90).length,
    lastYear: contractIssues.filter((i) => daysAgo(i.createdDate) <= 365).length,
    total: contractIssues.length,
  };
}
