import { Link } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";
import PageLayout from "../layout/PageLayout";
import StatusBadge, { healthVariant } from "../shared/StatusBadge";

export default function Dashboard() {
  const { companies, contracts, issues } = useAppContext();

  const activeContracts = contracts.length;
  const openIssues = issues.filter((i) => i.status !== "Resolved");
  const bySeverity = {
    Critical: openIssues.filter((i) => i.severity === "Critical").length,
    High: openIssues.filter((i) => i.severity === "High").length,
    Medium: openIssues.filter((i) => i.severity === "Medium").length,
    Low: openIssues.filter((i) => i.severity === "Low").length,
  };

  const healthCounts = {
    Healthy: companies.filter((c) => c.accountHealth === "Healthy").length,
    "Needs Attention": companies.filter((c) => c.accountHealth === "Needs Attention").length,
    "At Risk": companies.filter((c) => c.accountHealth === "At Risk").length,
  };

  // Upcoming renewals: contracts with longTermStartDate approaching 1 year within next 30 days
  const now = new Date();
  const upcomingRenewals = contracts
    .filter((c) => c.longTermStartDate)
    .map((c) => {
      const renewal = new Date(c.longTermStartDate!);
      renewal.setFullYear(renewal.getFullYear() + 1);
      const daysUntil = Math.ceil((renewal.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return { ...c, renewalDate: renewal, daysUntil };
    })
    .filter((c) => c.daysUntil <= 30 && c.daysUntil >= -7)
    .sort((a, b) => a.daysUntil - b.daysUntil);

  return (
    <PageLayout title="Dashboard">
      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "28px" }}>
        <SummaryCard label="Total Companies" value={companies.length} linkTo="/companies" />
        <SummaryCard label="Active Contracts" value={activeContracts} />
        <SummaryCard label="Open Issues" value={openIssues.length} linkTo="/issues" accent={openIssues.length > 0 ? "#dc2626" : undefined} />
        <SummaryCard label="Upcoming Renewals" value={upcomingRenewals.length} linkTo="/reports" subtitle="Next 30 days" />
      </div>

      {/* Two-column: Issue Severity + Account Health */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "28px" }}>
        {/* Open Issues by Severity */}
        <div style={cardStyle}>
          <h3 style={cardTitleStyle}>Open Issues by Severity</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            {(["Critical", "High", "Medium", "Low"] as const).map((sev) => (
              <div key={sev} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: "#f9fafb", borderRadius: "6px" }}>
                <StatusBadge label={sev} variant={sev.toLowerCase() as "critical" | "high" | "medium" | "low"} />
                <span style={{ fontSize: "18px", fontWeight: 700 }}>{bySeverity[sev]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Account Health */}
        <div style={cardStyle}>
          <h3 style={cardTitleStyle}>Account Health Overview</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {(["Healthy", "Needs Attention", "At Risk"] as const).map((health) => (
              <div key={health} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: "#f9fafb", borderRadius: "6px" }}>
                <StatusBadge label={health} variant={healthVariant(health)} />
                <span style={{ fontSize: "18px", fontWeight: 700 }}>{healthCounts[health]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Upcoming Renewals */}
      <div style={cardStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <h3 style={{ ...cardTitleStyle, marginBottom: 0 }}>Upcoming Contract Renewals</h3>
          <Link to="/reports" style={{ fontSize: "13px", color: "#2563eb", textDecoration: "none" }}>View full report &rarr;</Link>
        </div>
        {upcomingRenewals.length > 0 ? (
          <div style={{ overflow: "hidden", borderRadius: "6px", border: "1px solid #e5e7eb" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                  <th style={thStyle}>Company</th>
                  <th style={thStyle}>Talent</th>
                  <th style={thStyle}>Renewal Date</th>
                  <th style={thStyle}>Days Until</th>
                </tr>
              </thead>
              <tbody>
                {upcomingRenewals.map((c) => (
                  <tr key={c.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                    <td style={tdStyle}>
                      <Link to={`/companies/${c.companyId}`} style={{ color: "#2563eb", textDecoration: "none", fontWeight: 500 }}>
                        {c.companyName}
                      </Link>
                    </td>
                    <td style={tdStyle}>{c.talentName}</td>
                    <td style={tdStyle}>{c.renewalDate.toISOString().split("T")[0]}</td>
                    <td style={tdStyle}>
                      {c.daysUntil < 0 ? (
                        <span style={{ color: "#991b1b", fontWeight: 600 }}>Overdue by {Math.abs(c.daysUntil)}d</span>
                      ) : (
                        <span style={{ color: c.daysUntil <= 7 ? "#92400e" : "#374151", fontWeight: c.daysUntil <= 7 ? 600 : 400 }}>
                          {c.daysUntil}d
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ color: "#9ca3af", fontSize: "14px" }}>No renewals in the next 30 days.</p>
        )}
      </div>
    </PageLayout>
  );
}

function SummaryCard({ label, value, linkTo, subtitle, accent }: { label: string; value: number; linkTo?: string; subtitle?: string; accent?: string }) {
  const content = (
    <div style={{
      background: "#fff",
      border: "1px solid #e5e7eb",
      borderRadius: "8px",
      padding: "20px",
      cursor: linkTo ? "pointer" : undefined,
      transition: "border-color 0.15s",
    }}>
      <div style={{ fontSize: "13px", color: "#64748b", marginBottom: "6px" }}>{label}</div>
      <div style={{ fontSize: "32px", fontWeight: 700, color: accent ?? "#1a1a2e", lineHeight: 1 }}>{value}</div>
      {subtitle && <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "4px" }}>{subtitle}</div>}
    </div>
  );

  return linkTo ? <Link to={linkTo} style={{ textDecoration: "none", color: "inherit" }}>{content}</Link> : content;
}

const cardStyle: React.CSSProperties = {
  background: "#fff",
  border: "1px solid #e5e7eb",
  borderRadius: "8px",
  padding: "20px",
};

const cardTitleStyle: React.CSSProperties = {
  fontSize: "15px",
  fontWeight: 600,
  color: "#1a1a2e",
  marginBottom: "14px",
};

const thStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "8px 14px",
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
