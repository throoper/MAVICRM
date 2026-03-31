import { useAppContext } from "../../context/AppContext";
import ExportButton from "../shared/ExportButton";
import type { IssueType } from "../../types";

const TYPES: IssueType[] = [
  "Talent Underperformance",
  "Talent Resignation",
  "Talent Raise Requested",
  "Talent Over-Reported Hours",
  "Trial Period Extension Requested",
  "Talent Underutilization",
];

function daysBetween(a: string, b: string): number {
  return Math.ceil((new Date(b).getTime() - new Date(a).getTime()) / (1000 * 60 * 60 * 24));
}

export default function IssueReport() {
  const { issues } = useAppContext();

  // Count by type
  const openByType = TYPES.map((type) => ({
    type,
    count: issues.filter((i) => i.type === type && i.status !== "Resolved").length,
  }));

  // Time metrics
  const monitoringIssues = issues.filter((i) => i.status === "Monitoring Solution" || i.status === "Resolved");
  const avgTimeToSolution = monitoringIssues.length > 0
    ? Math.round(monitoringIssues.reduce((s, i) => s + daysBetween(i.createdDate, i.updatedDate), 0) / monitoringIssues.length)
    : 0;

  const resolvedIssues = issues.filter((i) => i.status === "Resolved");
  const avgTimeToResolution = resolvedIssues.length > 0
    ? Math.round(resolvedIssues.reduce((s, i) => s + daysBetween(i.createdDate, i.updatedDate), 0) / resolvedIssues.length)
    : 0;

  const totalConcessions = issues.reduce((s, i) => s + i.monetaryConcession, 0);

  // Detail table
  const headers = ["Issue", "Type", "Company", "Severity", "Concession", "Days to Resolution"];
  const rows = issues.map((i) => [
    i.title,
    i.type,
    i.companyName,
    i.severity,
    `$${i.monetaryConcession.toLocaleString()}`,
    i.status === "Resolved" ? String(daysBetween(i.createdDate, i.updatedDate)) : "—",
  ]);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <p style={{ fontSize: "14px", color: "#64748b" }}>
          Issue analytics: counts, resolution times, and monetary concessions.
        </p>
        <ExportButton filename="issue-summary" headers={headers} rows={rows} />
      </div>

      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "24px" }}>
        <SummaryCard label="Open Issues" value={String(issues.filter((i) => i.status !== "Resolved").length)} />
        <SummaryCard label="Avg Days to Solution" value={`${avgTimeToSolution}d`} />
        <SummaryCard label="Avg Days to Resolution" value={`${avgTimeToResolution}d`} />
        <SummaryCard label="Total Concessions" value={`$${totalConcessions.toLocaleString()}`} color="#dc2626" />
      </div>

      {/* Open by Type */}
      <h4 style={{ fontSize: "14px", fontWeight: 600, marginBottom: "12px" }}>Open Issues by Type</h4>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px", marginBottom: "24px" }}>
        {openByType.map((item) => (
          <div key={item.type} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "6px", padding: "12px" }}>
            <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "4px" }}>{item.type}</div>
            <div style={{ fontSize: "20px", fontWeight: 700 }}>{item.count}</div>
          </div>
        ))}
      </div>

      {/* Detail Table */}
      <h4 style={{ fontSize: "14px", fontWeight: 600, marginBottom: "12px" }}>All Issues</h4>
      <div style={{ background: "#fff", borderRadius: "8px", border: "1px solid #e5e7eb", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
              {headers.map((h) => <th key={h} style={thStyle}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {issues.map((i) => (
              <tr key={i.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                <td style={tdStyle}>{i.title}</td>
                <td style={{ ...tdStyle, fontSize: "12px" }}>{i.type}</td>
                <td style={tdStyle}>{i.companyName}</td>
                <td style={tdStyle}>{i.severity}</td>
                <td style={{ ...tdStyle, color: i.monetaryConcession > 0 ? "#dc2626" : undefined, fontWeight: i.monetaryConcession > 0 ? 600 : undefined }}>
                  ${i.monetaryConcession.toLocaleString()}
                </td>
                <td style={tdStyle}>
                  {i.status === "Resolved" ? `${daysBetween(i.createdDate, i.updatedDate)}d` : "—"}
                </td>
              </tr>
            ))}
            <tr style={{ background: "#f0f4ff", borderTop: "2px solid #2563eb" }}>
              <td colSpan={4} style={{ ...tdStyle, fontWeight: 700 }}>TOTAL CONCESSIONS</td>
              <td style={{ ...tdStyle, fontWeight: 700, color: "#dc2626" }}>${totalConcessions.toLocaleString()}</td>
              <td style={tdStyle} />
            </tr>
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
