import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";

type RecipientTab = "Client" | "Talent";

export default function TemplateList() {
  const { emailTemplates } = useAppContext();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<RecipientTab>("Client");

  const filtered = emailTemplates.filter((t) => t.recipient === activeTab);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", paddingBottom: "8px", borderBottom: "1px solid #e5e7eb" }}>
        <h3 style={{ fontSize: "16px", fontWeight: 600, margin: 0 }}>Email Templates</h3>
        <div style={{ display: "flex", gap: "4px", background: "#f1f5f9", borderRadius: "6px", padding: "2px" }}>
          {(["Client", "Talent"] as RecipientTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: "6px 16px",
                fontSize: "13px",
                fontWeight: activeTab === tab ? 600 : 400,
                color: activeTab === tab ? "#1e40af" : "#64748b",
                background: activeTab === tab ? "#fff" : "transparent",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                boxShadow: activeTab === tab ? "0 1px 2px rgba(0,0,0,0.05)" : "none",
              }}
            >
              {tab} Templates
            </button>
          ))}
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "12px" }}>
        {filtered.map((t) => (
          <div
            key={t.id}
            onClick={() => navigate(`/email-check-ins/${t.id}`)}
            style={{
              background: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              padding: "16px",
              cursor: "pointer",
              transition: "border-color 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#2563eb")}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#e5e7eb")}
          >
            <div style={{ fontSize: "15px", fontWeight: 600, marginBottom: "6px" }}>{t.name}</div>
            <div style={{ display: "flex", gap: "12px", fontSize: "12px", color: "#64748b" }}>
              <span>{t.triggerDays} days from {t.triggerFrom}{t.recurring ? " (recurring)" : ""}</span>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p style={{ color: "#9ca3af", fontSize: "14px" }}>No templates for this recipient type.</p>
        )}
      </div>
    </div>
  );
}
