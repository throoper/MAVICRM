import { Link } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";
import type { UpsellStatus } from "../../types";
import PageLayout from "../layout/PageLayout";
import StatusBadge from "../shared/StatusBadge";

const statusVariant = (s: UpsellStatus): "identified" | "proposed" | "accepted" | "closed-won" | "closed-lost" => {
  return s.toLowerCase() as ReturnType<typeof statusVariant>;
};

export default function UpsellsPage() {
  const { upsells } = useAppContext();

  const totalPipelineValue = upsells
    .filter((u) => !u.status.startsWith("Closed"))
    .reduce((sum, u) => sum + u.expansionValue, 0);

  return (
    <PageLayout title="Upsells">
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
          <div style={{ fontSize: "12px", color: "#64748b" }}>Total Upsells</div>
          <div style={{ fontSize: "20px", fontWeight: 700 }}>{upsells.length}</div>
        </div>
        <div>
          <div style={{ fontSize: "12px", color: "#64748b" }}>Open Pipeline</div>
          <div style={{ fontSize: "20px", fontWeight: 700 }}>{upsells.filter((u) => !u.status.startsWith("Closed")).length}</div>
        </div>
        <div>
          <div style={{ fontSize: "12px", color: "#64748b" }}>Pipeline Value (Monthly)</div>
          <div style={{ fontSize: "20px", fontWeight: 700, color: "#059669" }}>${totalPipelineValue.toLocaleString()}</div>
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #e5e7eb", textAlign: "left" }}>
              <th style={{ padding: "10px 12px", color: "#64748b", fontWeight: 600 }}>Company</th>
              <th style={{ padding: "10px 12px", color: "#64748b", fontWeight: 600 }}>Talent</th>
              <th style={{ padding: "10px 12px", color: "#64748b", fontWeight: 600 }}>Status</th>
              <th style={{ padding: "10px 12px", color: "#64748b", fontWeight: 600 }}>Hours</th>
              <th style={{ padding: "10px 12px", color: "#64748b", fontWeight: 600 }}>Value / mo</th>
              <th style={{ padding: "10px 12px", color: "#64748b", fontWeight: 600 }}>Target Close</th>
              <th style={{ padding: "10px 12px", color: "#64748b", fontWeight: 600 }}>Owner</th>
            </tr>
          </thead>
          <tbody>
            {upsells.map((u) => (
              <tr key={u.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                <td style={{ padding: "10px 12px" }}>
                  <Link to={`/upsells/${u.id}`} style={{ color: "#2563eb", textDecoration: "none", fontWeight: 500 }}>
                    {u.companyName}
                  </Link>
                </td>
                <td style={{ padding: "10px 12px" }}>
                  <Link to={`/talent/${u.talentId}`} style={{ color: "#2563eb", textDecoration: "none" }}>
                    {u.talentName}
                  </Link>
                </td>
                <td style={{ padding: "10px 12px" }}>
                  <StatusBadge variant={statusVariant(u.status)} label={u.status} />
                </td>
                <td style={{ padding: "10px 12px" }}>
                  {u.currentHoursPerWeek} &rarr; {u.proposedHoursPerWeek}
                </td>
                <td style={{ padding: "10px 12px", fontWeight: 600, color: "#059669" }}>
                  ${u.expansionValue.toLocaleString()}
                </td>
                <td style={{ padding: "10px 12px" }}>{u.targetCloseDate}</td>
                <td style={{ padding: "10px 12px" }}>{u.owner}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageLayout>
  );
}
