import { useAppContext } from "../../context/AppContext";
import ExportButton from "../shared/ExportButton";
import { Link } from "react-router-dom";
import type { ContractEndReason } from "../../types";

function daysBetween(a: string, b: string): number {
  return Math.ceil((new Date(b).getTime() - new Date(a).getTime()) / (1000 * 60 * 60 * 24));
}

const END_REASONS: NonNullable<ContractEndReason>[] = [
  "Performance Issue",
  "Talent Left Voluntarily",
  "Client Business Change",
  "Budget",
  "Role Change",
  "Contract Not Renewed",
];

const reasonColors: Record<string, string> = {
  "Performance Issue": "#dc2626",
  "Talent Left Voluntarily": "#d97706",
  "Client Business Change": "#2563eb",
  "Budget": "#7c3aed",
  "Role Change": "#0891b2",
  "Contract Not Renewed": "#64748b",
};

export default function ChurnReport() {
  const { contracts, issues } = useAppContext();

  const churned = contracts.filter((c) => c.status === "Ended");
  const totalLostMrr = churned.reduce((s, c) => s + c.mrr.actual, 0);

  const avgDuration = churned.length > 0
    ? Math.round(churned.reduce((s, c) => s + daysBetween(c.trialStartDate, c.endDate!), 0) / churned.length)
    : 0;

  // Churn by reason
  const byReason = END_REASONS.map((reason) => {
    const matches = churned.filter((c) => c.endReason === reason);
    return { reason, count: matches.length, lostMrr: matches.reduce((s, c) => s + c.mrr.actual, 0) };
  }).filter((r) => r.count > 0);

  // Concessions on churned contracts
  const churnedContractIds = new Set(churned.map((c) => c.id));
  const relatedConcessions = issues
    .filter((i) => churnedContractIds.has(i.contractId))
    .reduce((s, i) => s + i.monetaryConcession, 0);

  // Export
  const headers = ["Company", "Talent", "Role", "End Date", "End Reason", "Duration (days)", "Lost MRR", "Concessions"];
  const rows = churned.map((c) => {
    const concession = issues
      .filter((i) => i.contractId === c.id)
      .reduce((s, i) => s + i.monetaryConcession, 0);
    return [
      c.companyName,
      c.talentName,
      c.roleType,
      c.endDate!,
      c.endReason || "—",
      String(daysBetween(c.trialStartDate, c.endDate!)),
      `$${c.mrr.actual.toLocaleString()}`,
      `$${concession.toLocaleString()}`,
    ];
  });

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <p style={{ fontSize: "14px", color: "#64748b" }}>
          Contract churn analysis: lost revenue, reasons, and duration.
        </p>
        <ExportButton filename="churn-report" headers={headers} rows={rows} />
      </div>

      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "24px" }}>
        <SummaryCard label="Churned Contracts" value={String(churned.length)} />
        <SummaryCard label="Total Lost MRR" value={`$${totalLostMrr.toLocaleString()}`} color="#dc2626" />
        <SummaryCard label="Avg Contract Duration" value={`${avgDuration} days`} />
        <SummaryCard label="Related Concessions" value={`$${relatedConcessions.toLocaleString()}`} color="#d97706" />
      </div>

      {/* Churn by Reason */}
      <h4 style={{ fontSize: "14px", fontWeight: 600, marginBottom: "12px" }}>Churn by Reason</h4>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px", marginBottom: "24px" }}>
        {byReason.map((item) => (
          <div key={item.reason} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "6px", padding: "12px" }}>
            <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "4px" }}>{item.reason}</div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span style={{ fontSize: "20px", fontWeight: 700, color: reasonColors[item.reason] || "#1a1a2e" }}>{item.count}</span>
              <span style={{ fontSize: "12px", color: "#dc2626", fontWeight: 600 }}>-${item.lostMrr.toLocaleString()}/mo</span>
            </div>
          </div>
        ))}
      </div>

      {/* Detail Table */}
      <h4 style={{ fontSize: "14px", fontWeight: 600, marginBottom: "12px" }}>Churned Contracts</h4>
      {churned.length === 0 ? (
        <p style={{ color: "#9ca3af", fontSize: "14px" }}>No churned contracts found.</p>
      ) : (
        <div style={{ background: "#fff", borderRadius: "8px", border: "1px solid #e5e7eb", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                {headers.map((h) => <th key={h} style={thStyle}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {churned.map((c) => {
                const concession = issues
                  .filter((i) => i.contractId === c.id)
                  .reduce((s, i) => s + i.monetaryConcession, 0);
                const duration = daysBetween(c.trialStartDate, c.endDate!);
                return (
                  <tr key={c.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                    <td style={tdStyle}>
                      <Link to={`/companies/${c.companyId}`} style={{ color: "#2563eb", textDecoration: "none", fontWeight: 500 }}>
                        {c.companyName}
                      </Link>
                    </td>
                    <td style={tdStyle}>
                      <Link to={`/talent/${c.talentId}`} style={{ color: "#2563eb", textDecoration: "none" }}>
                        {c.talentName}
                      </Link>
                    </td>
                    <td style={tdStyle}>{c.roleType}</td>
                    <td style={tdStyle}>{c.endDate}</td>
                    <td style={{ ...tdStyle, color: reasonColors[c.endReason || ""] || undefined, fontWeight: 600, fontSize: "12px" }}>
                      {c.endReason}
                    </td>
                    <td style={tdStyle}>{duration}d</td>
                    <td style={{ ...tdStyle, color: "#dc2626", fontWeight: 600 }}>${c.mrr.actual.toLocaleString()}</td>
                    <td style={{ ...tdStyle, color: concession > 0 ? "#d97706" : undefined, fontWeight: concession > 0 ? 600 : undefined }}>
                      ${concession.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
              <tr style={{ background: "#fef2f2", borderTop: "2px solid #dc2626" }}>
                <td colSpan={6} style={{ ...tdStyle, fontWeight: 700 }}>TOTAL</td>
                <td style={{ ...tdStyle, fontWeight: 700, color: "#dc2626" }}>${totalLostMrr.toLocaleString()}</td>
                <td style={{ ...tdStyle, fontWeight: 700, color: "#d97706" }}>${relatedConcessions.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
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
