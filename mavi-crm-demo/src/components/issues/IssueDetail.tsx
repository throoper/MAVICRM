import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";
import type { ActionEntry, IssueStatus, IssuePriority, IssueSeverity, IssueType, IssueCategory } from "../../types";
import { TEAM_MEMBERS } from "../../types";
import { calcTimeBetweenActions } from "../../utils/csMetrics";
import PageLayout from "../layout/PageLayout";
import StatusBadge from "../shared/StatusBadge";
import StatusStepper from "./StatusStepper";
import ActionLog from "./ActionLog";

export default function IssueDetail() {
  const { id } = useParams<{ id: string }>();
  const { issues, setIssues } = useAppContext();
  const issue = issues.find((i) => i.id === id);

  const [editingResolution, setEditingResolution] = useState(false);
  const [resolutionValue, setResolutionValue] = useState(issue?.resolutionNotes ?? "");
  const [editingSummary, setEditingSummary] = useState(false);
  const [summaryValue, setSummaryValue] = useState(issue?.summary ?? "");
  const [editingConcession, setEditingConcession] = useState(false);
  const [concessionValue, setConcessionValue] = useState(String(issue?.monetaryConcession ?? 0));

  if (!issue) {
    return (
      <PageLayout title="Issue Not Found">
        <p>No issue with ID "{id}" was found.</p>
        <Link to="/issues" style={{ color: "#2563eb" }}>Back to Issues</Link>
      </PageLayout>
    );
  }

  const updateIssue = (updates: Partial<typeof issue>) => {
    setIssues((prev) =>
      prev.map((i) =>
        i.id === issue.id ? { ...i, ...updates, updatedDate: new Date().toISOString().split("T")[0] } : i
      )
    );
  };

  const actionTiming = calcTimeBetweenActions(issue);

  const handleStatusChange = (status: IssueStatus) => {
    updateIssue({ status });
  };

  const handleAddAction = (entry: ActionEntry) => {
    updateIssue({ actionLog: [...issue.actionLog, entry] });
  };

  const handleSaveResolution = () => {
    updateIssue({ resolutionNotes: resolutionValue });
    setEditingResolution(false);
  };

  const handleSaveConcession = () => {
    const val = parseFloat(concessionValue) || 0;
    updateIssue({ monetaryConcession: val });
    setConcessionValue(String(val));
    setEditingConcession(false);
  };

  return (
    <PageLayout title="">
      <div style={{ marginBottom: "8px" }}>
        <Link to="/issues" style={{ color: "#64748b", textDecoration: "none", fontSize: "14px" }}>&larr; Issues</Link>
      </div>

      <h2 style={{ fontSize: "20px", fontWeight: 700, margin: "0 0 20px 0" }}>{issue.title}</h2>

      {/* Status Stepper */}
      <Section title="Status">
        <StatusStepper current={issue.status} onChange={handleStatusChange} />
      </Section>

      {/* Details Grid */}
      <Section title="Details">
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "20px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "20px" }}>
            <Field label="Type">
              <select
                value={issue.type}
                onChange={(e) => updateIssue({ type: e.target.value as IssueType })}
                style={{ padding: "4px 8px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px", fontWeight: 500, cursor: "pointer", background: "#fff" }}
              >
                <option value="Talent Underperformance">Talent Underperformance</option>
                <option value="Talent Resignation">Talent Resignation</option>
                <option value="Talent Raise Requested">Talent Raise Requested</option>
                <option value="Talent Over-Reported Hours">Talent Over-Reported Hours</option>
                <option value="Trial Period Extension Requested">Trial Period Extension Requested</option>
                <option value="Talent Underutilization">Talent Underutilization</option>
                <option value="Client Communication">Client Communication</option>
              </select>
            </Field>
            <Field label="Severity">
              <select
                value={issue.severity}
                onChange={(e) => updateIssue({ severity: e.target.value as IssueSeverity })}
                style={{ padding: "4px 8px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px", fontWeight: 500, cursor: "pointer", background: "#fff" }}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </Field>
            <Field label="Priority">
              <select
                value={issue.priority}
                onChange={(e) => updateIssue({ priority: e.target.value as IssuePriority })}
                style={{ padding: "4px 8px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px", fontWeight: 500, cursor: "pointer", background: "#fff" }}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </Field>
            <Field label="Assigned To">
              <select
                value={issue.assignedTo}
                onChange={(e) => updateIssue({ assignedTo: e.target.value })}
                style={{ padding: "4px 8px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px", fontWeight: 500, cursor: "pointer", background: "#fff" }}
              >
                {TEAM_MEMBERS.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </Field>
            <Field label="Company">
              <Link to={`/companies/${issue.companyId}`} style={{ color: "#2563eb", textDecoration: "none", fontWeight: 500 }}>
                {issue.companyName}
              </Link>
            </Field>
            <Field label="Talent">
              <Link to={`/talent/${issue.talentId}`} style={{ color: "#2563eb", textDecoration: "none", fontWeight: 500 }}>
                {issue.talentName}
              </Link>
            </Field>
            <Field label="Created" value={issue.createdDate} />
            <Field label="Last Updated" value={issue.updatedDate} />
            <Field label="Avg Days Between Actions" value={actionTiming.avg !== null ? actionTiming.avg + " days" : "\u2014"} />
            <Field label="Max Gap Between Actions">
              <span style={{ fontSize: "14px", fontWeight: 500, color: actionTiming.max !== null && actionTiming.max > 14 ? "#dc2626" : undefined }}>
                {actionTiming.max !== null ? actionTiming.max + " days" : "\u2014"}
              </span>
            </Field>
          </div>
        </div>
      </Section>

      {/* Categories */}
      <Section title="Categories">
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {(["Performance", "Utilization", "Communication", "Billing", "Replacement"] as IssueCategory[]).map((cat) => {
            const selected = issue.categories.includes(cat);
            return (
              <button
                key={cat}
                onClick={() => {
                  const updated = selected ? issue.categories.filter((c) => c !== cat) : [...issue.categories, cat];
                  updateIssue({ categories: updated });
                }}
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
      </Section>

      {/* Summary */}
      <Section title="Summary">
        {editingSummary ? (
          <div>
            <textarea
              value={summaryValue}
              onChange={(e) => setSummaryValue(e.target.value)}
              rows={4}
              placeholder="Provide context about this issue..."
              style={{ width: "100%", padding: "10px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px", resize: "vertical", fontFamily: "inherit" }}
            />
            <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
              <button onClick={() => { updateIssue({ summary: summaryValue }); setEditingSummary(false); }} style={btnPrimary}>Save</button>
              <button onClick={() => { setEditingSummary(false); setSummaryValue(issue.summary); }} style={btnSecondary}>Cancel</button>
            </div>
          </div>
        ) : (
          <div>
            <p style={{ fontSize: "14px", color: "#374151", whiteSpace: "pre-wrap", marginBottom: "8px", lineHeight: "1.6" }}>
              {issue.summary || "No summary yet."}
            </p>
            <button onClick={() => setEditingSummary(true)} style={btnSecondary}>Edit</button>
          </div>
        )}
      </Section>

      {/* Attachments */}
      <Section title={`Attachments (${issue.attachments.length})`}>
        {issue.attachments.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "12px" }}>
            {issue.attachments.map((att) => (
              <div key={att.id} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "10px 14px", background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: "6px",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "16px" }}>
                    {att.fileType === "pdf" ? "\u{1F4C4}" : att.fileType === "png" || att.fileType === "jpg" ? "\u{1F5BC}\uFE0F" : att.fileType === "xlsx" ? "\u{1F4CA}" : "\u{1F4CE}"}
                  </span>
                  <div>
                    <button
                      onClick={() => alert(`[Demo] Would open: ${att.fileName}`)}
                      style={{ background: "none", border: "none", color: "#2563eb", fontSize: "13px", fontWeight: 600, cursor: "pointer", padding: 0, textDecoration: "underline" }}
                    >
                      {att.fileName}
                    </button>
                    <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "1px" }}>
                      Uploaded by {att.uploadedBy} on {att.uploadedDate}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => alert(`[Demo] Would download: ${att.fileName}`)}
                  style={{ background: "none", border: "1px solid #d1d5db", borderRadius: "6px", padding: "4px 10px", fontSize: "12px", color: "#374151", cursor: "pointer" }}
                >
                  Download
                </button>
              </div>
            ))}
          </div>
        )}
        {issue.attachments.length === 0 && (
          <p style={{ fontSize: "13px", color: "#9ca3af", marginBottom: "12px" }}>No attachments yet.</p>
        )}
        <button
          onClick={() => alert("[Demo] Would open file picker to upload an attachment")}
          style={btnSecondary}
        >
          + Add Attachment
        </button>
      </Section>

      {/* Monetary Concession */}
      <Section title="Monetary Concession">
        {editingConcession ? (
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <span style={{ fontSize: "14px" }}>$</span>
            <input
              type="number"
              value={concessionValue}
              onChange={(e) => setConcessionValue(e.target.value)}
              style={{ padding: "6px 10px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px", width: "140px" }}
            />
            <button onClick={handleSaveConcession} style={btnPrimary}>Save</button>
            <button onClick={() => { setEditingConcession(false); setConcessionValue(String(issue.monetaryConcession)); }} style={btnSecondary}>Cancel</button>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "20px", fontWeight: 700, color: issue.monetaryConcession > 0 ? "#dc2626" : "#374151" }}>
              ${issue.monetaryConcession.toLocaleString()}
            </span>
            <button onClick={() => setEditingConcession(true)} style={btnSecondary}>Edit</button>
          </div>
        )}
      </Section>

      {/* Resolution Notes */}
      <Section title="Resolution Notes">
        {editingResolution ? (
          <div>
            <textarea
              value={resolutionValue}
              onChange={(e) => setResolutionValue(e.target.value)}
              rows={3}
              style={{ width: "100%", padding: "10px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px", resize: "vertical", fontFamily: "inherit" }}
            />
            <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
              <button onClick={handleSaveResolution} style={btnPrimary}>Save</button>
              <button onClick={() => { setEditingResolution(false); setResolutionValue(issue.resolutionNotes); }} style={btnSecondary}>Cancel</button>
            </div>
          </div>
        ) : (
          <div>
            <p style={{ fontSize: "14px", color: "#374151", whiteSpace: "pre-wrap", marginBottom: "8px" }}>
              {issue.resolutionNotes || "No resolution notes yet."}
            </p>
            <button onClick={() => setEditingResolution(true)} style={btnSecondary}>Edit</button>
          </div>
        )}
      </Section>

      {/* Action Log */}
      <Section title="Action Log">
        <ActionLog entries={issue.actionLog} onAddEntry={handleAddAction} />
      </Section>
    </PageLayout>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: "28px" }}>
      <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#1a1a2e", marginBottom: "12px", paddingBottom: "8px", borderBottom: "1px solid #e5e7eb" }}>
        {title}
      </h3>
      {children}
    </section>
  );
}

function Field({ label, value, children }: { label: string; value?: string; children?: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "2px" }}>{label}</div>
      {children ?? <div style={{ fontSize: "14px", fontWeight: 500 }}>{value}</div>}
    </div>
  );
}

const btnPrimary: React.CSSProperties = {
  padding: "6px 16px",
  background: "#2563eb",
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  fontSize: "13px",
  fontWeight: 500,
  cursor: "pointer",
};

const btnSecondary: React.CSSProperties = {
  padding: "6px 16px",
  background: "#fff",
  color: "#374151",
  border: "1px solid #d1d5db",
  borderRadius: "6px",
  fontSize: "13px",
  fontWeight: 500,
  cursor: "pointer",
};
