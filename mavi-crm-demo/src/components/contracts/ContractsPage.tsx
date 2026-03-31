import { useState } from "react";
import { Link } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";
import type { ContractStatus } from "../../types";
import PageLayout from "../layout/PageLayout";
import StatusBadge from "../shared/StatusBadge";

const STATUS_OPTIONS: ("All" | ContractStatus)[] = ["All", "Trial", "Active", "At Risk", "Ended"];

const statusVariant = (s: ContractStatus) => {
  switch (s) {
    case "Active": return "healthy" as const;
    case "Trial": return "monitoring" as const;
    case "At Risk": return "at-risk" as const;
    case "Ended": return "closed-lost" as const;
  }
};

export default function ContractsPage() {
  const { contracts } = useAppContext();
  const [statusFilter, setStatusFilter] = useState<"All" | ContractStatus>("All");
  const [search, setSearch] = useState("");

  const filtered = contracts.filter((c) => {
    const matchesStatus = statusFilter === "All" || c.status === statusFilter;
    const matchesSearch =
      !search ||
      c.companyName.toLowerCase().includes(search.toLowerCase()) ||
      c.talentName.toLowerCase().includes(search.toLowerCase()) ||
      c.roleType.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const activeCount = contracts.filter((c) => c.status !== "Ended").length;
  const endedCount = contracts.filter((c) => c.status === "Ended").length;

  return (
    <PageLayout title="Contracts">
      {/* Summary bar */}
      <div style={{
        display: "flex",
        gap: "24px",
        padding: "16px 20px",
        background: "#f8fafc",
        borderRadius: "8px",
        marginBottom: "24px",
        flexWrap: "wrap",
      }}>
        <div>
          <div style={{ fontSize: "12px", color: "#64748b" }}>Total</div>
          <div style={{ fontSize: "20px", fontWeight: 700 }}>{contracts.length}</div>
        </div>
        <div>
          <div style={{ fontSize: "12px", color: "#64748b" }}>Active</div>
          <div style={{ fontSize: "20px", fontWeight: 700, color: "#059669" }}>{activeCount}</div>
        </div>
        <div>
          <div style={{ fontSize: "12px", color: "#64748b" }}>Ended</div>
          <div style={{ fontSize: "20px", fontWeight: 700, color: "#dc2626" }}>{endedCount}</div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "16px", flexWrap: "wrap", alignItems: "center" }}>
        <input
          type="text"
          placeholder="Search company, talent, or role..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "13px", width: "280px" }}
        />
        <div style={{ display: "flex", gap: "4px", background: "#f1f5f9", borderRadius: "6px", padding: "2px" }}>
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              style={{
                padding: "5px 14px",
                fontSize: "13px",
                fontWeight: statusFilter === s ? 600 : 400,
                color: statusFilter === s ? "#1e40af" : "#64748b",
                background: statusFilter === s ? "#fff" : "transparent",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                boxShadow: statusFilter === s ? "0 1px 2px rgba(0,0,0,0.05)" : "none",
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: "auto", background: "#fff", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
          <thead>
            <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
              <th style={thStyle}>Company</th>
              <th style={thStyle}>Talent</th>
              <th style={thStyle}>Role</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Hours / wk</th>
              <th style={thStyle}>Rate</th>
              <th style={thStyle}>MRR (Actual)</th>
              <th style={thStyle}>Start Date</th>
              <th style={thStyle}>End Date</th>
              <th style={thStyle}>End Reason</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
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
                <td style={tdStyle}>
                  <StatusBadge variant={statusVariant(c.status)} label={c.status} />
                </td>
                <td style={tdStyle}>{c.expectedHoursPerWeek}</td>
                <td style={tdStyle}>${c.contractRate}/hr</td>
                <td style={tdStyle}>${c.mrr.actual.toLocaleString()}</td>
                <td style={tdStyle}>{c.trialStartDate}</td>
                <td style={tdStyle}>{c.endDate || "—"}</td>
                <td style={{ ...tdStyle, color: c.endReason ? "#dc2626" : undefined, fontSize: "12px" }}>
                  {c.endReason || "—"}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={10} style={{ ...tdStyle, textAlign: "center", color: "#9ca3af", padding: "24px" }}>
                  No contracts match the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </PageLayout>
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
