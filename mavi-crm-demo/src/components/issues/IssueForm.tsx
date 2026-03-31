import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";
import type { IssueType, IssueSeverity, IssuePriority, IssueCategory } from "../../types";
import { TEAM_MEMBERS } from "../../types";
import PageLayout from "../layout/PageLayout";

const TYPES: IssueType[] = [
  "Talent Underperformance",
  "Talent Resignation",
  "Talent Raise Requested",
  "Talent Over-Reported Hours",
  "Trial Period Extension Requested",
  "Talent Underutilization",
  "Client Communication",
];

const SEVERITIES: IssueSeverity[] = ["Low", "Medium", "High", "Critical"];
const PRIORITIES: IssuePriority[] = ["Low", "Medium", "High"];
const CATEGORIES: IssueCategory[] = ["Performance", "Utilization", "Communication", "Billing", "Replacement"];

export default function IssueForm() {
  const { companies, contracts, setIssues } = useAppContext();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [type, setType] = useState<IssueType>(TYPES[0]);
  const [severity, setSeverity] = useState<IssueSeverity>("Medium");
  const [priority, setPriority] = useState<IssuePriority>("Medium");
  const [companyId, setCompanyId] = useState("");
  const [contractId, setContractId] = useState("");
  const [assignedTo, setAssignedTo] = useState<string>(TEAM_MEMBERS[0]);
  const [summary, setSummary] = useState("");
  const [categories, setCategories] = useState<IssueCategory[]>([]);

  const companyContracts = contracts.filter((c) => c.companyId === companyId);
  const selectedContract = contracts.find((c) => c.id === contractId);

  const canSubmit = title.trim() && companyId && contractId;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || !selectedContract) return;

    const today = new Date().toISOString().split("T")[0];
    const newIssue = {
      id: `iss-${Date.now()}`,
      title: title.trim(),
      type,
      status: "Open" as const,
      severity,
      priority,
      categories,
      assignedTo,
      companyId,
      companyName: companies.find((c) => c.id === companyId)?.name ?? "",
      talentId: selectedContract.talentId,
      talentName: selectedContract.talentName,
      contractId,
      summary: summary.trim(),
      attachments: [],
      monetaryConcession: 0,
      resolutionNotes: "",
      createdDate: today,
      updatedDate: today,
      actionLog: [],
    };

    setIssues((prev) => [newIssue, ...prev]);
    navigate(`/issues/${newIssue.id}`);
  };

  return (
    <PageLayout title="Create Issue">
      <form onSubmit={handleSubmit} style={{ maxWidth: "600px" }}>
        <FormField label="Title">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Brief description of the issue..."
            style={inputStyle}
          />
        </FormField>

        <FormField label="Summary">
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Provide additional context about this issue..."
            rows={3}
            style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }}
          />
        </FormField>

        <FormField label="Type">
          <select value={type} onChange={(e) => setType(e.target.value as IssueType)} style={inputStyle}>
            {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </FormField>

        <FormField label="Severity">
          <select value={severity} onChange={(e) => setSeverity(e.target.value as IssueSeverity)} style={inputStyle}>
            {SEVERITIES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </FormField>

        <FormField label="Priority">
          <select value={priority} onChange={(e) => setPriority(e.target.value as IssuePriority)} style={inputStyle}>
            {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </FormField>

        <FormField label="Categories">
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {CATEGORIES.map((cat) => {
              const selected = categories.includes(cat);
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategories((prev) => selected ? prev.filter((c) => c !== cat) : [...prev, cat])}
                  style={{
                    padding: "6px 14px",
                    fontSize: "13px",
                    fontWeight: 500,
                    borderRadius: "16px",
                    border: selected ? "1px solid #2563eb" : "1px solid #d1d5db",
                    background: selected ? "#dbeafe" : "#fff",
                    color: selected ? "#1e40af" : "#374151",
                    cursor: "pointer",
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </FormField>

        <FormField label="Company">
          <select
            value={companyId}
            onChange={(e) => { setCompanyId(e.target.value); setContractId(""); }}
            style={inputStyle}
          >
            <option value="">Select a company...</option>
            {companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </FormField>

        <FormField label="Contract / Talent">
          <select
            value={contractId}
            onChange={(e) => setContractId(e.target.value)}
            style={inputStyle}
            disabled={!companyId}
          >
            <option value="">{companyId ? "Select a contract..." : "Select a company first"}</option>
            {companyContracts.map((c) => (
              <option key={c.id} value={c.id}>{c.talentName} — {c.jobDescription}</option>
            ))}
          </select>
        </FormField>

        <FormField label="Assigned To">
          <select value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)} style={inputStyle}>
            {TEAM_MEMBERS.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </FormField>

        <div style={{ display: "flex", gap: "10px", marginTop: "24px" }}>
          <button
            type="submit"
            disabled={!canSubmit}
            style={{
              padding: "10px 24px",
              background: canSubmit ? "#2563eb" : "#94a3b8",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              fontSize: "14px",
              fontWeight: 600,
              cursor: canSubmit ? "pointer" : "default",
            }}
          >
            Create Issue
          </button>
          <button
            type="button"
            onClick={() => navigate("/issues")}
            style={{
              padding: "10px 24px",
              background: "#fff",
              color: "#374151",
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              fontSize: "14px",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </PageLayout>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "16px" }}>
      <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "4px" }}>
        {label}
      </label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "8px 12px",
  border: "1px solid #d1d5db",
  borderRadius: "6px",
  fontSize: "14px",
  background: "#fff",
  outline: "none",
};
