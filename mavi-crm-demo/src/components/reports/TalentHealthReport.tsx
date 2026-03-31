import { useAppContext } from "../../context/AppContext";
import ExportButton from "../shared/ExportButton";
import {
  calcTalentTenureMonths,
  calcAvgTenureMonths,
  calcAttritionRate,
  calcAvgSatisfactionScore,
  calcSatisfactionTrend,
  calcSurveyCompletionRate,
} from "../../utils/csMetrics";

const riskOrder: Record<string, number> = { High: 0, Medium: 1, Low: 2 };

export default function TalentHealthReport() {
  const { talent, talentSurveys } = useAppContext();

  const avgTenure = calcAvgTenureMonths(talent);
  const attritionRate = calcAttritionRate(talent);
  const avgSatisfaction = calcAvgSatisfactionScore(talentSurveys);
  const surveyCompletion = calcSurveyCompletionRate(talentSurveys);

  // Build per-talent rows
  const talentRows = talent
    .map((t) => {
      const tenure = calcTalentTenureMonths(t);
      const mySurveys = talentSurveys.filter((s) => s.talentId === t.id);
      const myCompleted = mySurveys.filter((s) => s.satisfactionScore !== null);
      const avgScore = myCompleted.length > 0
        ? Math.round((myCompleted.reduce((sum, s) => sum + s.satisfactionScore!, 0) / myCompleted.length) * 10) / 10
        : null;
      const trend = calcSatisfactionTrend(talentSurveys, t.id);
      const surveysCompleted = mySurveys.filter((s) => s.completedDate !== null).length;
      const surveysTotal = mySurveys.length;
      return { ...t, tenure, avgScore, trend, surveysCompleted, surveysTotal };
    })
    .sort((a, b) => {
      const riskDiff = (riskOrder[a.attritionRisk] ?? 3) - (riskOrder[b.attritionRisk] ?? 3);
      if (riskDiff !== 0) return riskDiff;
      return (a.avgScore ?? 999) - (b.avgScore ?? 999);
    });

  // CSV export
  const headers = ["Name", "Specialization", "Tenure (mo)", "Attrition Risk", "Avg Score", "Score Trend", "Surveys Completed", "Volatility"];
  const rows = talentRows.map((t) => [
    t.name,
    t.specialization,
    String(t.tenure),
    t.attritionRisk,
    t.avgScore !== null ? String(t.avgScore) : "—",
    t.trend.length > 0 ? t.trend.join(" > ") : "—",
    `${t.surveysCompleted} of ${t.surveysTotal}`,
    t.volatilityFlag ? "Yes" : "No",
  ]);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <p style={{ fontSize: "14px", color: "#64748b" }}>
          Talent health overview: tenure, attrition risk, satisfaction trends, and survey engagement.
        </p>
        <ExportButton filename="talent-health" headers={headers} rows={rows} />
      </div>

      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "24px" }}>
        <SummaryCard label="Avg Tenure" value={`${avgTenure} mo`} />
        <SummaryCard label="Attrition Rate" value={`${attritionRate}%`} color={attritionRate > 20 ? "#dc2626" : undefined} />
        <SummaryCard label="Avg Satisfaction" value={avgSatisfaction !== null ? String(avgSatisfaction) : "—"} />
        <SummaryCard label="Survey Completion" value={`${surveyCompletion}%`} />
      </div>

      {/* Per-Talent Table */}
      <h4 style={{ fontSize: "14px", fontWeight: 600, marginBottom: "12px" }}>Talent Detail</h4>
      <div style={{ background: "#fff", borderRadius: "8px", border: "1px solid #e5e7eb", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
              {headers.map((h) => <th key={h} style={thStyle}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {talentRows.map((t) => {
              const trendDir = getTrendDirection(t.trend);
              const trendColor = trendDir === "up" ? "#16a34a" : trendDir === "down" ? "#dc2626" : "#6b7280";

              return (
                <tr key={t.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                  <td style={tdStyle}>{t.name}</td>
                  <td style={tdStyle}>{t.specialization}</td>
                  <td style={tdStyle}>{t.tenure}</td>
                  <td style={tdStyle}>
                    <span style={{
                      display: "inline-block",
                      padding: "2px 10px",
                      borderRadius: "9999px",
                      fontSize: "12px",
                      fontWeight: 600,
                      background: riskBadge[t.attritionRisk]?.bg ?? "#f3f4f6",
                      color: riskBadge[t.attritionRisk]?.fg ?? "#374151",
                    }}>
                      {t.attritionRisk}
                    </span>
                  </td>
                  <td style={tdStyle}>{t.avgScore !== null ? t.avgScore : "—"}</td>
                  <td style={{ ...tdStyle, fontSize: "12px", color: trendColor, fontWeight: 500 }}>
                    {t.trend.length > 0 ? t.trend.join(" \u2192 ") : "—"}
                  </td>
                  <td style={tdStyle}>{t.surveysCompleted} of {t.surveysTotal}</td>
                  <td style={tdStyle}>
                    {t.volatilityFlag && (
                      <span style={{
                        display: "inline-block",
                        padding: "2px 8px",
                        borderRadius: "9999px",
                        fontSize: "12px",
                        fontWeight: 700,
                        background: "#fef2f2",
                        color: "#dc2626",
                      }}>!</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Helpers ─────────────────────────────────────────────────────

function SummaryCard({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "16px" }}>
      <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "4px" }}>{label}</div>
      <div style={{ fontSize: "24px", fontWeight: 700, color: color ?? "#1a1a2e" }}>{value}</div>
    </div>
  );
}

function getTrendDirection(trend: number[]): "up" | "down" | "flat" {
  if (trend.length < 2) return "flat";
  const last = trend[trend.length - 1];
  const first = trend[0];
  if (last > first) return "up";
  if (last < first) return "down";
  return "flat";
}

const riskBadge: Record<string, { bg: string; fg: string }> = {
  Low: { bg: "#dcfce7", fg: "#166534" },
  Medium: { bg: "#fef9c3", fg: "#854d0e" },
  High: { bg: "#fef2f2", fg: "#dc2626" },
};

const thStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "10px 14px",
  fontSize: "11px",
  fontWeight: 600,
  color: "#6b7280",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
};

const tdStyle: React.CSSProperties = {
  padding: "10px 14px",
  fontSize: "13px",
};
