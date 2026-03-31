import { useParams, Link } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";
import type { UpsellStatus, ActionEntry } from "../../types";
import { TEAM_MEMBERS } from "../../types";
import PageLayout from "../layout/PageLayout";
import StatusBadge from "../shared/StatusBadge";
import ActionLog from "../issues/ActionLog";

const STATUSES: UpsellStatus[] = ["Identified", "Proposed", "Accepted", "Closed-Won", "Closed-Lost"];

const statusVariant = (s: UpsellStatus): "identified" | "proposed" | "accepted" | "closed-won" | "closed-lost" => {
  return s.toLowerCase() as ReturnType<typeof statusVariant>;
};

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "2px" }}>{label}</div>
      <div style={{ fontSize: "14px", fontWeight: 500 }}>{value || "—"}</div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: "28px" }}>
      <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#1a1a2e", margin: 0, paddingBottom: "8px", borderBottom: "1px solid #e5e7eb", marginBottom: "12px" }}>{title}</h3>
      {children}
    </section>
  );
}

export default function UpsellDetail() {
  const { id } = useParams<{ id: string }>();
  const { upsells, setUpsells } = useAppContext();
  const upsell = upsells.find((u) => u.id === id);

  if (!upsell) {
    return (
      <PageLayout title="Upsell Not Found">
        <p>No upsell with ID "{id}".</p>
        <Link to="/upsells">Back to Upsells</Link>
      </PageLayout>
    );
  }

  const update = (patch: Partial<typeof upsell>) => {
    setUpsells((prev) => prev.map((u) => (u.id === upsell.id ? { ...u, ...patch } : u)));
  };

  const handleAddAction = (entry: ActionEntry) => {
    update({ actionLog: [...upsell.actionLog, entry] });
  };

  const handleStatusChange = (newStatus: UpsellStatus) => {
    update({ status: newStatus });
  };

  const handleNotesChange = (notes: string) => {
    update({ notes });
  };

  const handleOwnerChange = (owner: string) => {
    update({ owner });
  };

  const hoursDelta = upsell.proposedHoursPerWeek - upsell.currentHoursPerWeek;

  return (
    <PageLayout title={`Upsell — ${upsell.companyName}`}>
      <div style={{ marginBottom: "20px" }}>
        <Link to="/upsells" style={{ fontSize: "13px", color: "#2563eb", textDecoration: "none" }}>&larr; Back to Upsells</Link>
      </div>

      {/* Status & overview bar */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "16px",
        padding: "16px 20px",
        background: "#f8fafc",
        borderRadius: "8px",
        marginBottom: "24px",
        flexWrap: "wrap",
      }}>
        <StatusBadge variant={statusVariant(upsell.status)} label={upsell.status} />
        <div style={{ fontSize: "13px", color: "#475569" }}>
          <strong>Contract:</strong>{" "}
          <Link to={`/companies/${upsell.companyId}`} style={{ color: "#2563eb", textDecoration: "none" }}>{upsell.companyName}</Link>
          {" / "}
          <Link to={`/talent/${upsell.talentId}`} style={{ color: "#2563eb", textDecoration: "none" }}>{upsell.talentName}</Link>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "8px" }}>
          <label style={{ fontSize: "12px", color: "#64748b" }}>Status:</label>
          <select
            value={upsell.status}
            onChange={(e) => handleStatusChange(e.target.value as UpsellStatus)}
            style={{ padding: "4px 8px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "13px", background: "#fff" }}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Details grid */}
      <Section title="Expansion Details">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px" }}>
          <Field label="Current Hours / Week" value={`${upsell.currentHoursPerWeek} hrs`} />
          <Field label="Proposed Hours / Week" value={`${upsell.proposedHoursPerWeek} hrs`} />
          <Field label="Hour Increase" value={`+${hoursDelta} hrs/week`} />
          <Field label="Expansion Value (Monthly)" value={`$${upsell.expansionValue.toLocaleString()}`} />
          <Field label="Date Identified" value={upsell.dateIdentified} />
          <Field label="Target Close Date" value={upsell.targetCloseDate} />
          <Field
            label="Owner"
            value={
              <select
                value={upsell.owner}
                onChange={(e) => handleOwnerChange(e.target.value)}
                style={{ padding: "4px 8px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "13px", background: "#fff" }}
              >
                {TEAM_MEMBERS.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            }
          />
        </div>
      </Section>

      {/* Notes */}
      <Section title="Notes">
        <textarea
          value={upsell.notes}
          onChange={(e) => handleNotesChange(e.target.value)}
          rows={4}
          style={{
            width: "100%",
            padding: "12px",
            border: "1px solid #d1d5db",
            borderRadius: "6px",
            fontSize: "13px",
            fontFamily: "inherit",
            resize: "vertical",
            boxSizing: "border-box",
          }}
        />
      </Section>

      {/* Action Log */}
      <Section title="Action Log">
        <ActionLog entries={upsell.actionLog} onAddEntry={handleAddAction} />
      </Section>
    </PageLayout>
  );
}
