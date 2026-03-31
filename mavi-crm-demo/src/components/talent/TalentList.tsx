import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";
import PageLayout from "../layout/PageLayout";

export default function TalentList() {
  const { talent, contracts } = useAppContext();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const filtered = talent.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.location.toLowerCase().includes(search.toLowerCase()) ||
      t.specialization.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PageLayout title="Talent">
      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Search by name, location, or specialization..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%",
            maxWidth: "400px",
            padding: "8px 14px",
            border: "1px solid #d1d5db",
            borderRadius: "6px",
            fontSize: "14px",
            outline: "none",
          }}
        />
      </div>

      <div style={{ background: "#fff", borderRadius: "8px", border: "1px solid #e5e7eb", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
              <th style={thStyle}>Name</th>
              <th style={thStyle}>Location</th>
              <th style={thStyle}>Specialization</th>
              <th style={{ ...thStyle, textAlign: "center" }}>Active Contracts</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((t) => {
              const activeContracts = contracts.filter((c) => c.talentId === t.id).length;
              return (
                <tr
                  key={t.id}
                  onClick={() => navigate(`/talent/${t.id}`)}
                  style={{ borderBottom: "1px solid #e5e7eb", cursor: "pointer" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f4ff")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <td style={tdStyle}>
                    <span style={{ fontWeight: 600, color: "#1e40af" }}>{t.name}</span>
                  </td>
                  <td style={tdStyle}>{t.location}</td>
                  <td style={tdStyle}>{t.specialization}</td>
                  <td style={{ ...tdStyle, textAlign: "center" }}>{activeContracts}</td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} style={{ padding: "24px", textAlign: "center", color: "#9ca3af" }}>
                  No talent matches your search.
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
  padding: "10px 16px",
  fontSize: "12px",
  fontWeight: 600,
  color: "#6b7280",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
};

const tdStyle: React.CSSProperties = {
  padding: "12px 16px",
  fontSize: "14px",
};
