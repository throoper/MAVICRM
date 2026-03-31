import { useAppContext } from "../../context/AppContext";
import ExportButton from "../shared/ExportButton";

export default function RenewalReport() {
  const { contracts } = useAppContext();

  const withRenewal = contracts
    .filter((c) => c.longTermStartDate)
    .map((c) => {
      const start = new Date(c.longTermStartDate!);
      const renewal = new Date(start);
      renewal.setFullYear(renewal.getFullYear() + 1);
      return { ...c, renewalDate: renewal };
    })
    .sort((a, b) => a.renewalDate.getTime() - b.renewalDate.getTime());

  const headers = ["Company", "Talent", "Start Date", "Renewal Date", "Contract Rate"];
  const rows = withRenewal.map((c) => [
    c.companyName,
    c.talentName,
    c.longTermStartDate!,
    c.renewalDate.toISOString().split("T")[0],
    `$${c.contractRate}/hr`,
  ]);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <p style={{ fontSize: "14px", color: "#64748b" }}>
          Contracts approaching their 1-year renewal from long-term start date.
        </p>
        <ExportButton filename="contract-renewals" headers={headers} rows={rows} />
      </div>

      <div style={{ background: "#fff", borderRadius: "8px", border: "1px solid #e5e7eb", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
              {headers.map((h) => <th key={h} style={thStyle}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {withRenewal.map((c) => {
              const renewalStr = c.renewalDate.toISOString().split("T")[0];
              const now = new Date();
              const daysUntil = Math.ceil((c.renewalDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
              const isUpcoming = daysUntil <= 30 && daysUntil >= 0;
              const isPast = daysUntil < 0;

              return (
                <tr key={c.id} style={{ borderBottom: "1px solid #e5e7eb", background: isUpcoming ? "#fefce8" : isPast ? "#fef2f2" : undefined }}>
                  <td style={tdStyle}>{c.companyName}</td>
                  <td style={tdStyle}>{c.talentName}</td>
                  <td style={tdStyle}>{c.longTermStartDate}</td>
                  <td style={tdStyle}>
                    {renewalStr}
                    {isUpcoming && <span style={{ marginLeft: "8px", fontSize: "11px", color: "#92400e", fontWeight: 600 }}>({daysUntil}d)</span>}
                    {isPast && <span style={{ marginLeft: "8px", fontSize: "11px", color: "#991b1b", fontWeight: 600 }}>Overdue</span>}
                  </td>
                  <td style={tdStyle}>${c.contractRate}/hr</td>
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
  padding: "12px 16px",
  fontSize: "14px",
};
