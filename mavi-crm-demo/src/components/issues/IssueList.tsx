import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";
import type { IssueStatus, IssueSeverity, IssuePriority, IssueType, IssueCategory } from "../../types";
import { TEAM_MEMBERS } from "../../types";
import PageLayout from "../layout/PageLayout";
import StatusBadge from "../shared/StatusBadge";

const STATUSES: IssueStatus[] = ["Open", "In Progress", "Monitoring Solution", "Resolved"];
const SEVERITIES: IssueSeverity[] = ["Low", "Medium", "High", "Critical"];
const PRIORITIES: IssuePriority[] = ["Low", "Medium", "High"];
const TYPES: IssueType[] = [
  "Talent Underperformance",
  "Talent Resignation",
  "Talent Raise Requested",
  "Talent Over-Reported Hours",
  "Trial Period Extension Requested",
  "Talent Underutilization",
  "Client Communication",
];
const CATEGORIES: IssueCategory[] = ["Performance", "Utilization", "Communication", "Billing", "Replacement"];

const statusVariant = (s: IssueStatus) =>
  s === "Open" ? "open" : s === "In Progress" ? "in-progress" : s === "Monitoring Solution" ? "monitoring" : "resolved";

export default function IssueList() {
  const { issues } = useAppContext();
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [severityFilter, setSeverityFilter] = useState<string>("All");
  const [typeFilter, setTypeFilter] = useState<string>("All");
  const [assignedFilter, setAssignedFilter] = useState<string>("All");
  const [priorityFilter, setPriorityFilter] = useState<string>("All");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");

  const filtered = issues.filter((i) => {
    if (statusFilter !== "All" && i.status !== statusFilter) return false;
    if (severityFilter !== "All" && i.severity !== severityFilter) return false;
    if (priorityFilter !== "All" && i.priority !== priorityFilter) return false;
    if (typeFilter !== "All" && i.type !== typeFilter) return false;
    if (assignedFilter !== "All" && i.assignedTo !== assignedFilter) return false;
    if (categoryFilter !== "All" && !i.categories.includes(categoryFilter as IssueCategory)) return false;
    return true;
  });

  return (
    <PageLayout title="Issues">
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "20px", alignItems: "center" }}>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={selectStyle}>
          <option value="All">All Statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)} style={selectStyle}>
          <option value="All">All Severities</option>
          {SEVERITIES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} style={selectStyle}>
          <option value="All">All Priorities</option>
          {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} style={selectStyle}>
          <option value="All">All Types</option>
          {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} style={selectStyle}>
          <option value="All">All Categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={assignedFilter} onChange={(e) => setAssignedFilter(e.target.value)} style={selectStyle}>
          <option value="All">All Members</option>
          {TEAM_MEMBERS.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
        <div style={{ flex: 1 }} />
        <button
          onClick={() => navigate("/issues/new")}
          style={{
            padding: "8px 18px",
            background: "#2563eb",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            fontSize: "14px",
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          + Create Issue
        </button>
      </div>

      <div style={{ background: "#fff", borderRadius: "8px", border: "1px solid #e5e7eb", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
              <th style={thStyle}>Title</th>
              <th style={thStyle}>Type</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Severity</th>
              <th style={thStyle}>Priority</th>
              <th style={thStyle}>Categories</th>
              <th style={thStyle}>Company</th>
              <th style={thStyle}>Talent</th>
              <th style={thStyle}>Assigned</th>
              <th style={thStyle}>Created</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((issue) => (
              <tr
                key={issue.id}
                onClick={() => navigate(`/issues/${issue.id}`)}
                style={{ borderBottom: "1px solid #e5e7eb", cursor: "pointer" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f4ff")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <td style={tdStyle}>
                  <span style={{ fontWeight: 600, color: "#1e40af" }}>{issue.title}</span>
                </td>
                <td style={{ ...tdStyle, fontSize: "12px" }}>{issue.type}</td>
                <td style={tdStyle}>
                  <StatusBadge label={issue.status} variant={statusVariant(issue.status)} />
                </td>
                <td style={tdStyle}>
                  <StatusBadge label={issue.severity} variant={issue.severity.toLowerCase() as "low" | "medium" | "high" | "critical"} />
                </td>
                <td style={tdStyle}>
                  <StatusBadge label={issue.priority} variant={issue.priority.toLowerCase() as "low" | "medium" | "high"} />
                </td>
                <td style={tdStyle}>
                  <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                    {issue.categories.map((cat) => (
                      <span key={cat} style={{ fontSize: "11px", fontWeight: 500, padding: "1px 6px", borderRadius: "8px", background: "#f1f5f9", color: "#475569" }}>{cat}</span>
                    ))}
                  </div>
                </td>
                <td style={tdStyle}>{issue.companyName}</td>
                <td style={tdStyle}>{issue.talentName}</td>
                <td style={tdStyle}>{issue.assignedTo}</td>
                <td style={{ ...tdStyle, whiteSpace: "nowrap" }}>{issue.createdDate}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={10} style={{ padding: "24px", textAlign: "center", color: "#9ca3af" }}>
                  No issues match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </PageLayout>
  );
}

const selectStyle: React.CSSProperties = {
  padding: "8px 10px",
  border: "1px solid #d1d5db",
  borderRadius: "6px",
  fontSize: "13px",
  background: "#fff",
  cursor: "pointer",
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
