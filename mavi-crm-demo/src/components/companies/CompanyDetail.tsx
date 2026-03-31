import { useState, useRef, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";
import type { Company, Contact, NoteEntry, NoteType } from "../../types";
import { TEAM_MEMBERS } from "../../types";
import { calcCompanyInteractionStats, calcCompanyReplacementStats } from "../../utils/csMetrics";
import PageLayout from "../layout/PageLayout";
import StatusBadge, { healthVariant } from "../shared/StatusBadge";
import ContractCard from "./ContractCard";

// ── Inline helpers ──────────────────────────────────────────────

function Section({ title, children, action }: { title: React.ReactNode; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <section style={{ marginBottom: "28px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "8px", borderBottom: "1px solid #e5e7eb", marginBottom: "12px" }}>
        <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#1a1a2e", margin: 0 }}>{title}</h3>
        {action}
      </div>
      {children}
    </section>
  );
}

function Field({ label, value }: { label: string; value: string | number | null | undefined }) {
  return (
    <div>
      <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "2px" }}>{label}</div>
      <div style={{ fontSize: "14px", fontWeight: 500 }}>{value || "—"}</div>
    </div>
  );
}

function ContactCard({ contact, isPrimary }: { contact: Contact; isPrimary?: boolean }) {
  return (
    <div style={{ padding: "12px 16px", border: "1px solid #e5e7eb", borderRadius: "6px", background: isPrimary ? "#f0f4ff" : "#fff" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
        <span style={{ fontWeight: 600, fontSize: "14px" }}>{contact.name}</span>
        {isPrimary && (
          <span style={{ fontSize: "10px", fontWeight: 600, color: "#1e40af", background: "#dbeafe", padding: "1px 6px", borderRadius: "8px" }}>Primary</span>
        )}
      </div>
      <div style={{ fontSize: "13px", color: "#64748b" }}>{contact.title}</div>
      <div style={{ fontSize: "13px", color: "#475569", marginTop: "4px" }}>{contact.email}</div>
      <div style={{ fontSize: "13px", color: "#475569" }}>{contact.phone}</div>
    </div>
  );
}

function ExpandableText({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  const [clamped, setClamped] = useState(false);
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (el) setClamped(el.scrollHeight > el.clientHeight + 1);
  }, [text]);

  return (
    <div>
      <p
        ref={ref}
        style={{
          fontSize: "13px",
          color: "#475569",
          margin: 0,
          lineHeight: "1.5",
          ...(!expanded ? {
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical" as const,
            overflow: "hidden",
          } : {}),
        }}
      >
        {text}
      </p>
      {clamped && (
        <button
          onClick={() => setExpanded(!expanded)}
          style={{
            background: "none",
            border: "none",
            padding: 0,
            marginTop: "4px",
            fontSize: "12px",
            color: "#2563eb",
            cursor: "pointer",
            fontWeight: 500,
          }}
        >
          {expanded ? "Show less" : "Show more"}
        </button>
      )}
    </div>
  );
}

function ScoreDisplay({ label, scores, maxScore }: { label: string; scores: { date: string; score: number }[]; maxScore: number }) {
  const latest = scores[0];
  if (!latest) return null;
  return (
    <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "16px" }}>
      <div style={{ fontSize: "12px", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px" }}>{label}</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: "4px", marginBottom: "8px" }}>
        <span style={{ fontSize: "28px", fontWeight: 700 }}>{latest.score}</span>
        <span style={{ fontSize: "14px", color: "#94a3b8" }}>/ {maxScore}</span>
      </div>
      <div style={{ fontSize: "11px", color: "#94a3b8", marginBottom: "8px" }}>as of {latest.date}</div>
      {scores.length > 1 && (
        <details>
          <summary style={{ fontSize: "12px", color: "#64748b", cursor: "pointer" }}>View history ({scores.length} entries)</summary>
          <table style={{ width: "100%", marginTop: "8px", fontSize: "12px" }}>
            <tbody>
              {scores.map((s, i) => (
                <tr key={i} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "4px 0", color: "#64748b" }}>{s.date}</td>
                  <td style={{ padding: "4px 0", fontWeight: 600, textAlign: "right" }}>{s.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </details>
      )}
    </div>
  );
}

// ── Contact edit form ───────────────────────────────────────────

function ContactEditRow({ contact, onChange, onRemove }: { contact: Contact; onChange: (c: Contact) => void; onRemove?: () => void }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr auto", gap: "8px", alignItems: "end", marginBottom: "8px" }}>
      <div>
        <label style={labelStyle}>Name</label>
        <input style={inputStyle} value={contact.name} onChange={(e) => onChange({ ...contact, name: e.target.value })} />
      </div>
      <div>
        <label style={labelStyle}>Title</label>
        <input style={inputStyle} value={contact.title} onChange={(e) => onChange({ ...contact, title: e.target.value })} />
      </div>
      <div>
        <label style={labelStyle}>Email</label>
        <input style={inputStyle} value={contact.email} onChange={(e) => onChange({ ...contact, email: e.target.value })} />
      </div>
      <div>
        <label style={labelStyle}>Phone</label>
        <input style={inputStyle} value={contact.phone} onChange={(e) => onChange({ ...contact, phone: e.target.value })} />
      </div>
      {onRemove && (
        <button onClick={onRemove} style={{ ...btnSecondary, color: "#dc2626", borderColor: "#fca5a5", marginBottom: "1px" }} title="Remove contact">
          Remove
        </button>
      )}
    </div>
  );
}

function jobStatusColor(status: string): { bg: string; text: string } {
  switch (status) {
    case "New Lead": return { bg: "#dbeafe", text: "#1e40af" };
    case "Sourcing": return { bg: "#fef3c7", text: "#92400e" };
    case "Interviewing": return { bg: "#ede9fe", text: "#5b21b6" };
    case "Offer": return { bg: "#d1fae5", text: "#065f46" };
    case "Filled": return { bg: "#dcfce7", text: "#166534" };
    case "On Hold": return { bg: "#f1f5f9", text: "#475569" };
    default: return { bg: "#f1f5f9", text: "#475569" };
  }
}

function noteTypeColor(type: NoteType): string {
  switch (type) {
    case "Call": return "#2563eb";
    case "Email": return "#7c3aed";
    case "Meeting": return "#059669";
    case "Internal": return "#d97706";
  }
}

// ── Main component ──────────────────────────────────────────────

export default function CompanyDetail() {
  const { id } = useParams<{ id: string }>();
  const { companies, setCompanies, contracts, setContracts, issues, jobOpenings, replacements, interactions, upsells } = useAppContext();
  const company = companies.find((c) => c.id === id);

  // Edit state
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Company | null>(null);

  // Summary state (separate from company edit)
  const [editingSummary, setEditingSummary] = useState(false);
  const [summaryValue, setSummaryValue] = useState(company?.notes ?? "");

  // Notes log state
  const [noteSearch, setNoteSearch] = useState("");
  const [noteTypeFilter, setNoteTypeFilter] = useState<NoteType | "All">("All");
  const [showAddNote, setShowAddNote] = useState(false);
  const [newNote, setNewNote] = useState({ author: TEAM_MEMBERS[0] as string, type: "Call" as NoteType, tag: "", content: "" });

  if (!company) {
    return (
      <PageLayout title="Company Not Found">
        <p>No company with ID "{id}" was found.</p>
        <Link to="/companies" style={{ color: "#2563eb" }}>Back to Companies</Link>
      </PageLayout>
    );
  }

  const companyContracts = contracts.filter((c) => c.companyId === company.id);
  const activeContracts = companyContracts.filter((c) => c.status !== "Ended");
  const endedContracts = companyContracts.filter((c) => c.status === "Ended");
  const companyIssues = issues.filter((i) => i.companyId === company.id);
  const companyJobOpenings = jobOpenings.filter((j) => j.companyId === company.id);

  const interactionStats = calcCompanyInteractionStats(interactions, company.id);
  const replacementStats = calcCompanyReplacementStats(replacements, company.id);

  // ── Edit handlers ──

  const startEditing = () => {
    setDraft({ ...company, primaryContact: { ...company.primaryContact }, additionalContacts: company.additionalContacts.map((c) => ({ ...c })) });
    setEditing(true);
  };

  const cancelEditing = () => {
    setDraft(null);
    setEditing(false);
  };

  const saveEditing = () => {
    if (!draft) return;
    setCompanies((prev) => prev.map((c) => (c.id === company.id ? draft : c)));
    setEditing(false);
    setDraft(null);
  };

  const updateDraft = (updates: Partial<Company>) => {
    if (draft) setDraft({ ...draft, ...updates });
  };

  const addPoc = () => {
    if (!draft) return;
    setDraft({ ...draft, additionalContacts: [...draft.additionalContacts, { name: "", title: "", email: "", phone: "" }] });
  };

  const updatePoc = (idx: number, contact: Contact) => {
    if (!draft) return;
    const updated = [...draft.additionalContacts];
    updated[idx] = contact;
    setDraft({ ...draft, additionalContacts: updated });
  };

  const removePoc = (idx: number) => {
    if (!draft) return;
    setDraft({ ...draft, additionalContacts: draft.additionalContacts.filter((_, i) => i !== idx) });
  };

  // ── Summary handlers ──

  const handleSaveSummary = () => {
    setCompanies((prev) => prev.map((c) => (c.id === company.id ? { ...c, notes: summaryValue } : c)));
    setEditingSummary(false);
  };

  // ── Notes log handlers ──

  const handleAddNote = () => {
    if (!newNote.content.trim()) return;
    const entry: NoteEntry = {
      id: `n-${Date.now()}`,
      date: new Date().toISOString().slice(0, 10),
      author: newNote.author,
      type: newNote.type,
      tag: newNote.tag.trim(),
      content: newNote.content.trim(),
    };
    setCompanies((prev) => prev.map((c) => (c.id === company.id ? { ...c, noteLog: [entry, ...c.noteLog] } : c)));
    setNewNote({ author: TEAM_MEMBERS[0], type: "Call", tag: "", content: "" });
    setShowAddNote(false);
  };

  // ── Contract save ──

  const handleSaveContract = (updated: import("../../types").Contract) => {
    setContracts((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  };

  // ── Contract attachment mock ──

  const handleUploadAttachment = (contractId: string) => {
    const contract = contracts.find((c) => c.id === contractId);
    if (!contract) return;
    const mockName = `${company.name.replace(/\s+/g, "")}-${contract.talentName.replace(/\s+/g, "")}-Contract-${new Date().getFullYear()}.pdf`;
    setContracts((prev) => prev.map((c) => (c.id === contractId ? { ...c, attachmentFileName: mockName } : c)));
  };

  // ── Render ──

  const d = draft ?? company; // show draft when editing, company otherwise

  return (
    <PageLayout title="">
      <div style={{ marginBottom: "8px" }}>
        <Link to="/companies" style={{ color: "#64748b", textDecoration: "none", fontSize: "14px" }}>&larr; Companies</Link>
      </div>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "4px" }}>
            <h2 style={{ fontSize: "24px", fontWeight: 700, margin: 0 }}>{company.name}</h2>
            <StatusBadge label={company.accountHealth} variant={healthVariant(company.accountHealth)} />
          </div>
          {company.description && <p style={{ fontSize: "14px", color: "#64748b", margin: "4px 0 0 0", maxWidth: "700px" }}>{company.description}</p>}
        </div>
        {!editing && (
          <button onClick={startEditing} style={btnPrimary}>Edit Company</button>
        )}
      </div>

      {/* ── EDIT MODE ── */}
      {editing && draft && (
        <Section title="Edit Company Information">
          <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "24px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
              <div>
                <label style={labelStyle}>Company Name</label>
                <input style={inputStyle} value={d.name} onChange={(e) => updateDraft({ name: e.target.value })} />
              </div>
              <div>
                <label style={labelStyle}>Company Type</label>
                <select style={inputStyle} value={d.companyType} onChange={(e) => updateDraft({ companyType: e.target.value as Company["companyType"] })}>
                  <option value="High Value">High Value</option>
                  <option value="Strategic">Strategic</option>
                  <option value="Standard">Standard</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Industry</label>
                <input style={inputStyle} value={d.industry} onChange={(e) => updateDraft({ industry: e.target.value })} />
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>Description</label>
                <textarea style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }} rows={2} value={d.description} onChange={(e) => updateDraft({ description: e.target.value })} />
              </div>
              <div>
                <label style={labelStyle}>Website</label>
                <input style={inputStyle} value={d.website} onChange={(e) => updateDraft({ website: e.target.value })} />
              </div>
              <div>
                <label style={labelStyle}>Headquarters</label>
                <input style={inputStyle} value={d.headquarters} onChange={(e) => updateDraft({ headquarters: e.target.value })} />
              </div>
              <div>
                <label style={labelStyle}>Country</label>
                <input style={inputStyle} value={d.country} onChange={(e) => updateDraft({ country: e.target.value })} />
              </div>
              <div>
                <label style={labelStyle}>LinkedIn</label>
                <input style={inputStyle} value={d.linkedIn} onChange={(e) => updateDraft({ linkedIn: e.target.value })} />
              </div>
              <div>
                <label style={labelStyle}>Employee Count</label>
                <input style={inputStyle} type="number" value={d.employeeCount ?? ""} onChange={(e) => updateDraft({ employeeCount: e.target.value ? Number(e.target.value) : null })} />
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>Specialties (comma-separated)</label>
                <input style={inputStyle} value={d.specialties} onChange={(e) => updateDraft({ specialties: e.target.value })} />
              </div>
              <div>
                <label style={labelStyle}>Last Contact Date</label>
                <input style={inputStyle} type="date" value={d.lastContactDate} onChange={(e) => updateDraft({ lastContactDate: e.target.value })} />
              </div>
              <div>
                <label style={labelStyle}>Reason for Contact</label>
                <input style={inputStyle} value={d.lastContactReason} onChange={(e) => updateDraft({ lastContactReason: e.target.value })} />
              </div>
              <div>
                <label style={labelStyle}>Number of Replacements</label>
                <input style={inputStyle} type="number" min={0} value={d.numberOfReplacements} onChange={(e) => updateDraft({ numberOfReplacements: Number(e.target.value) })} />
              </div>
            </div>

            {/* Primary Contact */}
            <h4 style={{ fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "8px", marginTop: "20px" }}>Primary Contact</h4>
            <ContactEditRow
              contact={d.primaryContact}
              onChange={(c) => updateDraft({ primaryContact: c })}
            />

            {/* Additional Contacts */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "20px", marginBottom: "8px" }}>
              <h4 style={{ fontSize: "13px", fontWeight: 600, color: "#374151", margin: 0 }}>Additional Contacts</h4>
              <button onClick={addPoc} style={{ ...btnSecondary, fontSize: "12px", padding: "4px 12px" }}>+ Add Contact</button>
            </div>
            {d.additionalContacts.length === 0 && (
              <p style={{ fontSize: "13px", color: "#9ca3af" }}>No additional contacts. Click "Add Contact" to add one.</p>
            )}
            {d.additionalContacts.map((c, i) => (
              <ContactEditRow key={i} contact={c} onChange={(upd) => updatePoc(i, upd)} onRemove={() => removePoc(i)} />
            ))}

            <div style={{ display: "flex", gap: "8px", marginTop: "20px" }}>
              <button onClick={saveEditing} style={btnPrimary}>Save Changes</button>
              <button onClick={cancelEditing} style={btnSecondary}>Cancel</button>
            </div>
          </div>
        </Section>
      )}

      {/* ── VIEW MODE: Company Info ── */}
      {!editing && (
        <Section title="Company Information">
          <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "20px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "20px" }}>
              <Field label="Company Type" value={company.companyType} />
              <Field label="Industry" value={company.industry} />
              <Field label="Headquarters" value={company.headquarters} />
              <Field label="Country" value={company.country} />
              <Field label="Website" value={company.website} />
              <Field label="LinkedIn" value={company.linkedIn} />
              <Field label="Employee Count" value={company.employeeCount?.toLocaleString()} />
              <Field label="Specialties" value={company.specialties} />
              <Field label="Last Contact Date" value={company.lastContactDate} />
              <Field label="Reason for Contact" value={company.lastContactReason} />
              <Field label="Number of Replacements" value={company.numberOfReplacements} />
            </div>
          </div>
        </Section>
      )}

      {/* ── VIEW MODE: CS Metrics ── */}
      {!editing && (
        <Section title="CS Metrics">
          <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "20px" }}>
            {/* Row 1 */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "20px", marginBottom: "20px" }}>
              <div>
                <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "2px" }}>Revenue Tier</div>
                <div>
                  <span style={{ fontSize: "12px", fontWeight: 600, padding: "2px 8px", borderRadius: "8px", background: "#dbeafe", color: "#1e40af" }}>
                    {company.revenueTier || "—"}
                  </span>
                </div>
              </div>
              <Field label="Strategic Account" value={company.strategicFlag ? "Yes" : "No"} />
              <Field label="Raises Given" value={company.raisesGiven} />
              <Field label="Raises Requested" value={company.raisesRequested} />
            </div>
            {/* Row 2 - Replacement Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "20px", marginBottom: "20px" }}>
              <Field label="Total Replacements" value={replacementStats.total} />
              <Field label="Last 90 Days" value={replacementStats.last90} />
              <Field label="Rapid Replacements" value={replacementStats.rapid} />
              <Field label="Number of Replacements" value={company.numberOfReplacements} />
            </div>
            {/* Row 3 - Engagement Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "20px", marginBottom: "20px" }}>
              <Field label="Total Interactions" value={interactionStats.total} />
              <Field label="Avg Response Time" value={interactionStats.avgResponseTime !== null ? `${interactionStats.avgResponseTime} days` : "—"} />
              <Field label="Last Response" value={interactionStats.lastResponseDate ?? "—"} />
              <div>
                <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "2px" }}>Ignored Followups</div>
                <div style={{ fontSize: "14px", fontWeight: 500, color: interactionStats.ignored > 0 ? "#dc2626" : undefined }}>
                  {interactionStats.ignored}
                </div>
              </div>
            </div>
            {/* Row 4 */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "20px" }}>
              <Field label="Proactive Interactions" value={interactionStats.proactive} />
              <Field label="Reactive Interactions" value={interactionStats.reactive} />
              <Field label="Total Concessions" value={`$${companyIssues.reduce((s, i) => s + i.monetaryConcession, 0).toLocaleString()}`} />
            </div>
          </div>
        </Section>
      )}

      {/* Contacts (view mode) */}
      {!editing && (
        <Section title="Contacts">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "12px" }}>
            <ContactCard contact={company.primaryContact} isPrimary />
            {company.additionalContacts.map((c, i) => (
              <ContactCard key={i} contact={c} />
            ))}
          </div>
        </Section>
      )}

      {/* Client Summary */}
      <Section title="Client Summary">
        {editingSummary ? (
          <div>
            <textarea
              value={summaryValue}
              onChange={(e) => setSummaryValue(e.target.value)}
              rows={4}
              style={{ width: "100%", padding: "10px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px", resize: "vertical", fontFamily: "inherit" }}
            />
            <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
              <button onClick={handleSaveSummary} style={btnPrimary}>Save</button>
              <button onClick={() => { setEditingSummary(false); setSummaryValue(company.notes); }} style={btnSecondary}>Cancel</button>
            </div>
          </div>
        ) : (
          <div>
            <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: "8px", padding: "16px", fontSize: "14px", color: "#374151", whiteSpace: "pre-wrap", lineHeight: "1.6", marginBottom: "8px" }}>
              {company.notes || "No summary yet."}
            </div>
            <button onClick={() => setEditingSummary(true)} style={btnSecondary}>Edit Summary</button>
          </div>
        )}
      </Section>

      {/* Issues */}
      <Section title={`Issues (${companyIssues.length})`}>
        {companyIssues.length > 0 ? (
          <div style={{ background: "#fff", borderRadius: "8px", border: "1px solid #e5e7eb", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                  <th style={thStyle}>Title</th>
                  <th style={thStyle}>Type</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Severity</th>
                  <th style={thStyle}>Assigned To</th>
                </tr>
              </thead>
              <tbody>
                {companyIssues.map((issue) => (
                  <tr key={issue.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                    <td style={tdStyle}>
                      <Link to={`/issues/${issue.id}`} style={{ color: "#2563eb", textDecoration: "none", fontWeight: 500 }}>
                        {issue.title}
                      </Link>
                    </td>
                    <td style={tdStyle}>{issue.type}</td>
                    <td style={tdStyle}>
                      <StatusBadge
                        label={issue.status}
                        variant={issue.status === "Open" ? "open" : issue.status === "In Progress" ? "in-progress" : issue.status === "Monitoring Solution" ? "monitoring" : "resolved"}
                      />
                    </td>
                    <td style={tdStyle}>
                      <StatusBadge label={issue.severity} variant={issue.severity.toLowerCase() as "low" | "medium" | "high" | "critical"} />
                    </td>
                    <td style={tdStyle}>{issue.assignedTo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ color: "#9ca3af" }}>No issues for this company.</p>
        )}
      </Section>

      {/* CSAT & NPS */}
      <Section title="CSAT & NPS">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <ScoreDisplay label="CSAT Score" scores={company.csatScores} maxScore={10} />
          <ScoreDisplay label="NPS Score" scores={company.npsScores} maxScore={100} />
        </div>
      </Section>

      {/* Contracts */}
      <Section
        title={
          <>
            Contracts ({activeContracts.length})
            {endedContracts.length > 0 && (
              <Link
                to="/contracts?status=Ended"
                style={{ fontSize: "13px", fontWeight: 500, color: "#dc2626", marginLeft: "8px", textDecoration: "none" }}
              >
                + {endedContracts.length} ended
              </Link>
            )}
          </>
        }
        action={
          <button onClick={() => alert("[Demo] Would open new contract form")} style={btnPrimary}>+ Add Contract</button>
        }
      >
        {activeContracts.map((contract) => (
          <ContractCard key={contract.id} contract={contract} allContracts={contracts} contactNames={[company.primaryContact.name, ...company.additionalContacts.map((c) => c.name)]} onUploadAttachment={handleUploadAttachment} onSave={handleSaveContract} upsell={upsells.find((u) => u.contractId === contract.id)} issueCount={issues.filter((i) => i.contractId === contract.id && i.status !== "Resolved").length} />
        ))}
        {activeContracts.length === 0 && <p style={{ color: "#9ca3af" }}>No active contracts.</p>}
      </Section>

      {/* Job Openings */}
      <Section
        title={`Job Openings (${companyJobOpenings.length})`}
        action={
          <button onClick={() => alert("[Demo] Would open kanban board")} style={btnSecondary}>
            View on Kanban
          </button>
        }
      >
        {companyJobOpenings.length > 0 ? (
          <div style={{ background: "#fff", borderRadius: "8px", border: "1px solid #e5e7eb", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                  <th style={thStyle}>Role</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Owner</th>
                  <th style={thStyle}>Talent</th>
                  <th style={thStyle}>Priority</th>
                  <th style={thStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {companyJobOpenings.map((jo) => (
                  <tr key={jo.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                    <td style={{ ...tdStyle, fontWeight: 500 }}>{jo.role}</td>
                    <td style={tdStyle}>
                      <span style={{
                        fontSize: "11px",
                        fontWeight: 600,
                        padding: "2px 8px",
                        borderRadius: "8px",
                        background: jobStatusColor(jo.status).bg,
                        color: jobStatusColor(jo.status).text,
                      }}>
                        {jo.status}
                      </span>
                    </td>
                    <td style={tdStyle}>{jo.owner}</td>
                    <td style={tdStyle}>{jo.talent ?? <span style={{ color: "#9ca3af" }}>—</span>}</td>
                    <td style={tdStyle}>
                      <StatusBadge label={jo.priority} variant={jo.priority === "Urgent" ? "critical" : jo.priority.toLowerCase() as "low" | "medium" | "high"} />
                    </td>
                    <td style={tdStyle}>
                      <button onClick={() => alert(`[Demo] Would open details for: ${jo.role}`)} style={{ background: "none", border: "none", color: "#2563eb", fontSize: "12px", fontWeight: 500, cursor: "pointer", padding: 0, textDecoration: "underline" }}>
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ color: "#9ca3af" }}>No open positions for this company.</p>
        )}
      </Section>

      {/* Client Notes Log */}
      <Section
        title={`Client Notes (${company.noteLog.length})`}
        action={
          <button onClick={() => setShowAddNote(!showAddNote)} style={btnPrimary}>
            {showAddNote ? "Cancel" : "+ Add Note"}
          </button>
        }
      >
        {/* Add Note Form */}
        {showAddNote && (
          <div style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "16px", marginBottom: "16px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: "12px" }}>
              <div>
                <label style={labelStyle}>Author</label>
                <select style={inputStyle} value={newNote.author} onChange={(e) => setNewNote({ ...newNote, author: e.target.value })}>
                  {TEAM_MEMBERS.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Type</label>
                <select style={inputStyle} value={newNote.type} onChange={(e) => setNewNote({ ...newNote, type: e.target.value as NoteType })}>
                  {(["Call", "Email", "Meeting", "Internal"] as NoteType[]).map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Tag</label>
                <input style={inputStyle} placeholder="e.g. escalation, QBR, renewal" value={newNote.tag} onChange={(e) => setNewNote({ ...newNote, tag: e.target.value })} />
              </div>
            </div>
            <div style={{ marginBottom: "12px" }}>
              <label style={labelStyle}>Note</label>
              <textarea
                value={newNote.content}
                onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                rows={3}
                placeholder="What happened?"
                style={{ width: "100%", padding: "8px 10px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px", resize: "vertical", fontFamily: "inherit" }}
              />
            </div>
            <button onClick={handleAddNote} style={btnPrimary}>Save Note</button>
          </div>
        )}

        {/* Search & Filter */}
        <div style={{ display: "flex", gap: "12px", marginBottom: "16px" }}>
          <input
            type="text"
            placeholder="Search notes..."
            value={noteSearch}
            onChange={(e) => setNoteSearch(e.target.value)}
            style={{ ...inputStyle, flex: 1 }}
          />
          <select style={{ ...inputStyle, width: "140px" }} value={noteTypeFilter} onChange={(e) => setNoteTypeFilter(e.target.value as NoteType | "All")}>
            <option value="All">All Types</option>
            {(["Call", "Email", "Meeting", "Internal"] as NoteType[]).map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        {/* Notes List */}
        {(() => {
          const filtered = company.noteLog.filter((n) => {
            const matchesType = noteTypeFilter === "All" || n.type === noteTypeFilter;
            const matchesSearch = !noteSearch || n.content.toLowerCase().includes(noteSearch.toLowerCase()) || n.author.toLowerCase().includes(noteSearch.toLowerCase()) || n.tag.toLowerCase().includes(noteSearch.toLowerCase());
            return matchesType && matchesSearch;
          });
          if (filtered.length === 0) return <p style={{ color: "#9ca3af", fontSize: "14px" }}>No notes found.</p>;
          return filtered.map((note) => (
            <div key={note.id} style={{ borderLeft: `3px solid ${noteTypeColor(note.type)}`, background: "#fff", border: "1px solid #e5e7eb", borderLeftColor: noteTypeColor(note.type), borderLeftWidth: "3px", borderRadius: "6px", padding: "14px 16px", marginBottom: "10px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "13px", fontWeight: 600, color: "#1e293b" }}>{note.author}</span>
                  <span style={{ fontSize: "11px", fontWeight: 600, color: noteTypeColor(note.type), background: `${noteTypeColor(note.type)}18`, padding: "1px 8px", borderRadius: "8px" }}>{note.type}</span>
                  {note.tag && <span style={{ fontSize: "11px", fontWeight: 500, color: "#64748b", background: "#f1f5f9", padding: "1px 8px", borderRadius: "8px" }}>{note.tag}</span>}
                </div>
                <span style={{ fontSize: "12px", color: "#94a3b8" }}>{note.date}</span>
              </div>
              <ExpandableText text={note.content} />
            </div>
          ));
        })()}
      </Section>

    </PageLayout>
  );
}

// ── Shared styles ───────────────────────────────────────────────

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "12px",
  fontWeight: 600,
  color: "#374151",
  marginBottom: "3px",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "7px 10px",
  border: "1px solid #d1d5db",
  borderRadius: "6px",
  fontSize: "14px",
  outline: "none",
};

const thStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "10px 16px",
  fontSize: "12px",
  fontWeight: 600,
  color: "#6b7280",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
};

const tdStyle: React.CSSProperties = {
  padding: "10px 16px",
  fontSize: "13px",
};

const btnPrimary: React.CSSProperties = {
  padding: "8px 20px",
  background: "#2563eb",
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  fontSize: "13px",
  fontWeight: 600,
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
