import { useMemo } from "react";
import { useAppContext } from "../../context/AppContext";
import {
  getLatestUtilizationByContract,
  calcUtilizationPct,
  utilizationHealth,
  calcUtilizationTrend,
} from "../../utils/csMetrics";
import ExportButton from "../shared/ExportButton";

interface UtilRow {
  contractId: string;
  companyName: string;
  talentName: string;
  roleType: string;
  expectedHrs: number;
  minHrs: number;
  actualHrs: number;
  pct: number;
  trend: "up" | "down" | "stable";
  health: "healthy" | "medium" | "at-risk";
}

export default function UtilizationReport() {
  const { contracts, utilization } = useAppContext();

  const rows: UtilRow[] = useMemo(() => {
    const latest = getLatestUtilizationByContract(utilization);
    return latest
      .map((rec) => {
        const contract = contracts.find((c) => c.id === rec.contractId);
        const pct = calcUtilizationPct(rec.actualHours, rec.expectedHours);
        return {
          contractId: rec.contractId,
          companyName: contract?.companyName ?? "Unknown",
          talentName: contract?.talentName ?? "Unknown",
          roleType: contract?.roleType ?? "—",
          expectedHrs: rec.expectedHours,
          minHrs: rec.minimumHours,
          actualHrs: rec.actualHours,
          pct,
          trend: calcUtilizationTrend(utilization, rec.contractId),
          health: utilizationHealth(pct),
        };
      })
      .sort((a, b) => a.pct - b.pct);
  }, [contracts, utilization]);

  // Summary metrics
  const fleetAvg = useMemo(() => {
    if (rows.length === 0) return 0;
    return Math.round(rows.reduce((s, r) => s + r.pct, 0) / rows.length);
  }, [rows]);

  const healthyCount = rows.filter((r) => r.health === "healthy").length;
  const mediumCount = rows.filter((r) => r.health === "medium").length;
  const atRiskCount = rows.filter((r) => r.health === "at-risk").length;

  // CSV export
  const csvHeaders = [
    "Company",
    "Talent",
    "Role Type",
    "Expected Hrs",
    "Min Hrs",
    "Last Week Actual",
    "Utilization %",
    "Trend",
    "Health",
  ];
  const csvRows = rows.map((r) => [
    r.companyName,
    r.talentName,
    r.roleType,
    r.expectedHrs,
    r.minHrs,
    r.actualHrs,
    r.pct,
    r.trend === "up" ? "Up" : r.trend === "down" ? "Down" : "Stable",
    r.health === "healthy" ? "Healthy" : r.health === "medium" ? "Medium" : "At Risk",
  ]);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <p style={{ fontSize: "14px", color: "#64748b" }}>
          Fleet-wide utilization tracking with per-contract health and trends.
        </p>
        <ExportButton filename="utilization-report" headers={csvHeaders} rows={csvRows} />
      </div>

      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "24px" }}>
        <SummaryCard label="Fleet Avg Utilization" value={`${fleetAvg}%`} />
        <SummaryCard label="Healthy (≥80%)" value={String(healthyCount)} color="#16a34a" />
        <SummaryCard label="Medium (50–79%)" value={String(mediumCount)} color="#ca8a04" />
        <SummaryCard label="At Risk (<50%)" value={String(atRiskCount)} color="#dc2626" />
      </div>

      {/* Detail Table */}
      <div style={{ background: "#fff", borderRadius: "8px", border: "1px solid #e5e7eb", overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "900px" }}>
          <thead>
            <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
              <th style={thStyle}>Company</th>
              <th style={thStyle}>Talent</th>
              <th style={thStyle}>Role Type</th>
              <th style={{ ...thStyle, textAlign: "right" }}>Expected Hrs</th>
              <th style={{ ...thStyle, textAlign: "right" }}>Min Hrs</th>
              <th style={{ ...thStyle, textAlign: "right" }}>Last Week Actual</th>
              <th style={{ ...thStyle, textAlign: "right" }}>Utilization %</th>
              <th style={{ ...thStyle, textAlign: "center" }}>Trend</th>
              <th style={{ ...thStyle, textAlign: "center" }}>Health</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const pctColor = row.pct >= 80 ? "#16a34a" : row.pct >= 50 ? "#ca8a04" : "#dc2626";
              return (
                <tr key={row.contractId} style={{ borderBottom: "1px solid #e5e7eb" }}>
                  <td style={tdStyle}>{row.companyName}</td>
                  <td style={tdStyle}>{row.talentName}</td>
                  <td style={tdStyle}>{row.roleType}</td>
                  <td style={{ ...tdStyle, textAlign: "right" }}>{row.expectedHrs}</td>
                  <td style={{ ...tdStyle, textAlign: "right" }}>{row.minHrs}</td>
                  <td style={{ ...tdStyle, textAlign: "right" }}>{row.actualHrs}</td>
                  <td style={{ ...tdStyle, textAlign: "right", color: pctColor, fontWeight: 600 }}>{row.pct}%</td>
                  <td style={{ ...tdStyle, textAlign: "center" }}>
                    <TrendArrow trend={row.trend} />
                  </td>
                  <td style={{ ...tdStyle, textAlign: "center" }}>
                    <HealthBadge health={row.health} />
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

function SummaryCard({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "16px" }}>
      <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "4px" }}>{label}</div>
      <div style={{ fontSize: "24px", fontWeight: 700, color: color ?? "#1a1a2e" }}>{value}</div>
    </div>
  );
}

function TrendArrow({ trend }: { trend: "up" | "down" | "stable" }) {
  if (trend === "up") return <span style={{ color: "#16a34a", fontWeight: 700 }}>▲</span>;
  if (trend === "down") return <span style={{ color: "#dc2626", fontWeight: 700 }}>▼</span>;
  return <span style={{ color: "#9ca3af", fontWeight: 700 }}>—</span>;
}

function HealthBadge({ health }: { health: "healthy" | "medium" | "at-risk" }) {
  const config = {
    healthy: { label: "Healthy", bg: "#dcfce7", color: "#166534" },
    medium: { label: "Medium", bg: "#fef9c3", color: "#854d0e" },
    "at-risk": { label: "At Risk", bg: "#fee2e2", color: "#991b1b" },
  }[health];

  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 10px",
        borderRadius: "9999px",
        fontSize: "11px",
        fontWeight: 600,
        background: config.bg,
        color: config.color,
      }}
    >
      {config.label}
    </span>
  );
}

const thStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "10px 12px",
  fontSize: "11px",
  fontWeight: 600,
  color: "#6b7280",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
  whiteSpace: "nowrap",
};

const tdStyle: React.CSSProperties = {
  padding: "10px 12px",
  fontSize: "13px",
};
