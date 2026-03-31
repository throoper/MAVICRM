import { useAppContext } from "../../context/AppContext";
import {
  calcCompanyInteractionStats,
  calcAvgResponseTime,
  calcCheckInCompletionRate,
  calcIgnoredFollowups,
} from "../../utils/csMetrics";
import ExportButton from "../shared/ExportButton";

export default function ClientEngagementReport() {
  const { companies, interactions } = useAppContext();

  // Summary metrics
  const totalInteractions = interactions.length;
  const avgResponseTime = calcAvgResponseTime(interactions);
  const checkInRate = calcCheckInCompletionRate(interactions);
  const totalIgnored = calcIgnoredFollowups(interactions);

  // Per-company stats
  const companyRows = companies
    .map((c) => {
      const stats = calcCompanyInteractionStats(interactions, c.id);
      const totalPR = stats.proactive + stats.reactive;
      const proactivePct = totalPR > 0 ? Math.round((stats.proactive / totalPR) * 100) : 0;
      return { company: c.name, ...stats, proactivePct };
    })
    .sort((a, b) => b.ignored - a.ignored);

  // CSV export data
  const headers = [
    "Company",
    "Total Interactions",
    "Last Response Date",
    "Avg Response Time (days)",
    "# Ignored Followups",
    "Proactive #",
    "Reactive #",
    "Proactive %",
  ];
  const rows = companyRows.map((r) => [
    r.company,
    r.total,
    r.lastResponseDate ?? "—",
    r.avgResponseTime !== null ? r.avgResponseTime : "—",
    r.ignored,
    r.proactive,
    r.reactive,
    `${r.proactivePct}%`,
  ]);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <p style={{ fontSize: "14px", color: "#64748b" }}>
          Client engagement analytics: response times, follow-up compliance, and proactive outreach.
        </p>
        <ExportButton filename="client-engagement" headers={headers} rows={rows} />
      </div>

      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "24px" }}>
        <SummaryCard label="Total Interactions" value={String(totalInteractions)} />
        <SummaryCard label="Avg Response Time" value={avgResponseTime !== null ? `${avgResponseTime}d` : "—"} />
        <SummaryCard label="Check-In Completion Rate" value={`${checkInRate}%`} />
        <SummaryCard label="Total Ignored Followups" value={String(totalIgnored)} color={totalIgnored > 0 ? "#dc2626" : undefined} />
      </div>

      {/* Per-Company Table */}
      <h4 style={{ fontSize: "14px", fontWeight: 600, marginBottom: "12px" }}>Engagement by Company</h4>
      <div style={{ background: "#fff", borderRadius: "8px", border: "1px solid #e5e7eb", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
              {headers.map((h) => (
                <th key={h} style={thStyle}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {companyRows.map((r) => (
              <tr key={r.company} style={{ borderBottom: "1px solid #e5e7eb" }}>
                <td style={{ ...tdStyle, fontWeight: 600 }}>{r.company}</td>
                <td style={tdStyle}>{r.total}</td>
                <td style={tdStyle}>{r.lastResponseDate ?? "—"}</td>
                <td style={tdStyle}>{r.avgResponseTime !== null ? `${r.avgResponseTime}d` : "—"}</td>
                <td style={{ ...tdStyle, color: r.ignored > 0 ? "#dc2626" : undefined, fontWeight: r.ignored > 0 ? 600 : undefined }}>
                  {r.ignored}
                </td>
                <td style={tdStyle}>{r.proactive}</td>
                <td style={tdStyle}>{r.reactive}</td>
                <td style={{
                  ...tdStyle,
                  color: r.proactivePct >= 60 ? "#16a34a" : "#ca8a04",
                  fontWeight: 600,
                }}>
                  {r.proactivePct}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SummaryCard({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "16px" }}>
      <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "4px" }}>{label}</div>
      <div style={{ fontSize: "24px", fontWeight: 700, color: color ?? "#1a1a2e" }}>{value}</div>
    </div>
  );
}

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
