import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";
import PageLayout from "../layout/PageLayout";

export default function TemplateEditor() {
  const { id } = useParams<{ id: string }>();
  const { emailTemplates, setEmailTemplates, companies } = useAppContext();
  const template = emailTemplates.find((t) => t.id === id);

  const [name, setName] = useState(template?.name ?? "");
  const [subject, setSubject] = useState(template?.subject ?? "");
  const [body, setBody] = useState(template?.body ?? "");
  const [saved, setSaved] = useState(false);

  // Use first company for preview
  const sampleCompany = companies[0];
  const placeholders: Record<string, string> = {
    "{{clientName}}": sampleCompany?.primaryContact.name ?? "John Doe",
    "{{contactName}}": sampleCompany?.primaryContact.name ?? "John Doe",
    "{{companyName}}": sampleCompany?.name ?? "Acme Corp",
    "{{talentName}}": "Aditi Sharma",
    "{{contractCount}}": String(sampleCompany?.contracts.length ?? 2),
    "{{avgUtilization}}": "82",
    "{{weekNumber}}": "2",
    "{{accountHealth}}": sampleCompany?.accountHealth ?? "Healthy",
    "{{openIssueCount}}": "1",
    "{{notes}}": sampleCompany?.notes ?? "",
  };

  const fillPlaceholders = (text: string) => {
    let result = text;
    for (const [key, val] of Object.entries(placeholders)) {
      result = result.replaceAll(key, val);
    }
    return result;
  };

  if (!template) {
    return (
      <PageLayout title="Template Not Found">
        <p>No template with ID "{id}" was found.</p>
        <Link to="/email-check-ins" style={{ color: "#2563eb" }}>Back to Email Check-Ins</Link>
      </PageLayout>
    );
  }

  const handleSave = () => {
    setEmailTemplates((prev) =>
      prev.map((t) => (t.id === template.id ? { ...t, name, subject, body } : t))
    );
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <PageLayout title="">
      <div style={{ marginBottom: "8px" }}>
        <Link to="/email-check-ins" style={{ color: "#64748b", textDecoration: "none", fontSize: "14px" }}>&larr; Email Check-Ins</Link>
      </div>

      <h2 style={{ fontSize: "20px", fontWeight: 700, margin: "0 0 4px 0" }}>{template.name}</h2>
      <div style={{ fontSize: "13px", color: "#64748b", marginBottom: "24px" }}>
        Recipient: {template.recipient} &middot; {template.triggerDays} days from {template.triggerFrom}{template.recurring ? " (recurring)" : ""}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
        {/* Editor */}
        <div>
          <h3 style={{ fontSize: "14px", fontWeight: 600, marginBottom: "12px" }}>Edit Template</h3>

          <div style={{ marginBottom: "12px" }}>
            <label style={labelStyle}>Template Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} />
          </div>

          <div style={{ marginBottom: "12px" }}>
            <label style={labelStyle}>Subject</label>
            <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} style={inputStyle} />
          </div>

          <div style={{ marginBottom: "12px" }}>
            <label style={labelStyle}>Body</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={14}
              style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit", lineHeight: "1.5" }}
            />
          </div>

          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <button onClick={handleSave} style={btnPrimary}>Save Changes</button>
            {saved && <span style={{ fontSize: "13px", color: "#166534", fontWeight: 500 }}>Saved!</span>}
          </div>

          <div style={{ marginTop: "12px", fontSize: "12px", color: "#94a3b8" }}>
            Available placeholders: {Object.keys(placeholders).join(", ")}
          </div>
        </div>

        {/* Preview */}
        <div>
          <h3 style={{ fontSize: "14px", fontWeight: 600, marginBottom: "12px" }}>Preview (using {sampleCompany?.name})</h3>
          <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px", overflow: "hidden" }}>
            <div style={{ padding: "12px 16px", background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
              <div style={{ fontSize: "11px", color: "#94a3b8", marginBottom: "2px" }}>Subject</div>
              <div style={{ fontSize: "14px", fontWeight: 500 }}>{fillPlaceholders(subject)}</div>
            </div>
            <div style={{ padding: "16px", fontSize: "14px", color: "#374151", whiteSpace: "pre-wrap", lineHeight: "1.6" }}>
              {fillPlaceholders(body)}
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "12px",
  fontWeight: 600,
  color: "#374151",
  marginBottom: "4px",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "8px 12px",
  border: "1px solid #d1d5db",
  borderRadius: "6px",
  fontSize: "14px",
  outline: "none",
};

const btnPrimary: React.CSSProperties = {
  padding: "8px 20px",
  background: "#2563eb",
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  fontSize: "13px",
  fontWeight: 500,
  cursor: "pointer",
};
