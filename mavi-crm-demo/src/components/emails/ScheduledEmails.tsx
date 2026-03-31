import { useAppContext } from "../../context/AppContext";

export default function ScheduledEmails() {
  const { scheduledEmails, setScheduledEmails, emailTemplates } = useAppContext();

  const toggleStatus = (id: string) => {
    setScheduledEmails((prev) =>
      prev.map((se) =>
        se.id === id ? { ...se, status: se.status === "Active" ? "Paused" : "Active" } : se
      )
    );
  };

  return (
    <div>
      <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "12px", paddingBottom: "8px", borderBottom: "1px solid #e5e7eb" }}>
        Scheduled Emails
      </h3>
      <div style={{ background: "#fff", borderRadius: "8px", border: "1px solid #e5e7eb", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
              <th style={thStyle}>Company</th>
              <th style={thStyle}>Template</th>
              <th style={thStyle}>Next Send</th>
              <th style={thStyle}>Last Sent</th>
              <th style={thStyle}>Status</th>
              <th style={{ ...thStyle, textAlign: "center" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {scheduledEmails.map((se) => {
              const template = emailTemplates.find((t) => t.id === se.templateId);
              return (
                <tr key={se.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                  <td style={tdStyle}>{se.companyName}</td>
                  <td style={tdStyle}>{template?.name ?? se.templateId}</td>
                  <td style={tdStyle}>{se.nextSendDate}</td>
                  <td style={tdStyle}>{se.lastSentDate ?? "—"}</td>
                  <td style={tdStyle}>
                    <span style={{
                      display: "inline-block",
                      padding: "2px 10px",
                      borderRadius: "12px",
                      fontSize: "12px",
                      fontWeight: 600,
                      background: se.status === "Active" ? "#dcfce7" : "#f3f4f6",
                      color: se.status === "Active" ? "#166534" : "#6b7280",
                    }}>
                      {se.status}
                    </span>
                  </td>
                  <td style={{ ...tdStyle, textAlign: "center" }}>
                    <button
                      onClick={() => toggleStatus(se.id)}
                      style={{
                        padding: "4px 12px",
                        fontSize: "12px",
                        fontWeight: 500,
                        border: "1px solid #d1d5db",
                        borderRadius: "4px",
                        background: "#fff",
                        cursor: "pointer",
                        color: "#374151",
                      }}
                    >
                      {se.status === "Active" ? "Pause" : "Resume"}
                    </button>
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
