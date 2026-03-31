import { useState } from "react";
import { Link } from "react-router-dom";
import type { Contract, ContractUpdateReason, ContractUpdateEntry, Upsell } from "../../types";
import { TEAM_MEMBERS } from "../../types";

const UPDATE_REASONS: ContractUpdateReason[] = [
  "Raise — Exceptional Performance",
  "Raise — Market Adjustment",
  "Raise — Client Requested",
  "Rate Renegotiation",
  "Hours Adjustment",
  "Role Change",
  "Other",
];
import MrrPanel from "./MrrPanel";

interface ContractCardProps {
  contract: Contract;
  allContracts: Contract[];
  headerLabel?: "talent" | "company";
  contactNames?: string[];
  onUploadAttachment?: (contractId: string) => void;
  onSave?: (updated: Contract) => void;
  upsell?: Upsell;
  issueCount?: number;
}

function getContractImportanceLabel(contract: Contract, allContracts: Contract[]): { label: string; bg: string; color: string } {
  const sorted = [...allContracts].sort((a, b) => b.mrr.expected - a.mrr.expected);
  const rank = sorted.findIndex((c) => c.id === contract.id) + 1;
  const percentile = rank / sorted.length;

  if (percentile <= 0.05) return { label: "Top 5% Contract", bg: "#fef3c7", color: "#92400e" };
  if (percentile <= 0.10) return { label: "Top 10% Contract", bg: "#fee2e2", color: "#991b1b" };
  if (percentile <= 0.20) return { label: "Top 20% Contract", bg: "#ede9fe", color: "#5b21b6" };
  if (percentile <= 0.30) return { label: "Top 30% Contract", bg: "#dbeafe", color: "#1e40af" };
  if (percentile <= 0.40) return { label: "Top 40% Contract", bg: "#d1fae5", color: "#065f46" };
  if (percentile <= 0.50) return { label: "Top 50% Contract", bg: "#e0f2fe", color: "#0369a1" };
  return { label: "Standard Contract", bg: "#f1f5f9", color: "#475569" };
}

function ScoreSection({ label, scores }: { label: string; scores: { date: string; score: number }[] }) {
  const latest = scores[0];
  if (!latest) return null;

  return (
    <div>
      <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "4px" }}>{label}</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
        <span style={{ fontSize: "20px", fontWeight: 700 }}>{latest.score}</span>
        <span style={{ fontSize: "11px", color: "#94a3b8" }}>/10</span>
      </div>
      {scores.length > 1 && (
        <details style={{ marginTop: "4px" }}>
          <summary style={{ fontSize: "11px", color: "#64748b", cursor: "pointer" }}>History ({scores.length})</summary>
          <div style={{ marginTop: "4px", fontSize: "12px" }}>
            {scores.map((s, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "2px 0", color: "#475569" }}>
                <span>{s.date}</span>
                <span style={{ fontWeight: 500 }}>{s.score}</span>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}

function HoursBar({ label, pct }: { label: string; pct: number }) {
  const barColor = pct >= 80 ? "#10b981" : pct >= 50 ? "#f59e0b" : "#ef4444";
  return (
    <div style={{ marginBottom: "6px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#475569", marginBottom: "2px" }}>
        <span>{label}</span>
        <span style={{ fontWeight: 600 }}>{pct}%</span>
      </div>
      <div style={{ height: "6px", background: "#e5e7eb", borderRadius: "3px", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${Math.min(pct, 100)}%`, background: barColor, borderRadius: "3px", transition: "width 0.3s" }} />
      </div>
    </div>
  );
}

export default function ContractCard({ contract, allContracts, headerLabel = "talent", contactNames = [], onUploadAttachment, onSave, upsell, issueCount = 0 }: ContractCardProps) {
  const isTrialOnly = !contract.longTermStartDate;
  const importance = getContractImportanceLabel(contract, allContracts);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({
    talentRate: contract.talentRate,
    contractRate: contract.contractRate,
    expectedHoursPerWeek: contract.expectedHoursPerWeek,
    minimumHoursPerWeek: contract.minimumHoursPerWeek,
    trialStartDate: contract.trialStartDate,
    longTermStartDate: contract.longTermStartDate ?? "",
    accountOwner: contract.accountOwner,
    platformTeamOwner: contract.platformTeamOwner,
    primaryPoc: contract.primaryPoc,
    humanInputRiskFlag: contract.humanInputRiskFlag,
    humanInputRiskConfidence: contract.humanInputRiskConfidence ?? "",
    humanInputRiskNotes: contract.humanInputRiskNotes ?? "",
  });

  // Pipeline modal state
  const [showPipeline, setShowPipeline] = useState(false);

  // Update contract state
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [updateReason, setUpdateReason] = useState<ContractUpdateReason>(UPDATE_REASONS[0]);
  const [updateAuthor, setUpdateAuthor] = useState<string>(TEAM_MEMBERS[0]);
  const [updateNotes, setUpdateNotes] = useState("");
  const [updateDraft, setUpdateDraft] = useState({
    talentRate: contract.talentRate,
    contractRate: contract.contractRate,
    expectedHoursPerWeek: contract.expectedHoursPerWeek,
    minimumHoursPerWeek: contract.minimumHoursPerWeek,
  });

  const startUpdate = () => {
    setUpdateDraft({
      talentRate: contract.talentRate,
      contractRate: contract.contractRate,
      expectedHoursPerWeek: contract.expectedHoursPerWeek,
      minimumHoursPerWeek: contract.minimumHoursPerWeek,
    });
    setUpdateReason(UPDATE_REASONS[0]);
    setUpdateAuthor(TEAM_MEMBERS[0]);
    setUpdateNotes("");
    setShowUpdateForm(true);
  };

  const saveUpdate = () => {
    const previousValues: ContractUpdateEntry["previousValues"] = {};
    if (updateDraft.talentRate !== contract.talentRate) previousValues.talentRate = contract.talentRate;
    if (updateDraft.contractRate !== contract.contractRate) previousValues.contractRate = contract.contractRate;
    if (updateDraft.expectedHoursPerWeek !== contract.expectedHoursPerWeek) previousValues.expectedHoursPerWeek = contract.expectedHoursPerWeek;
    if (updateDraft.minimumHoursPerWeek !== contract.minimumHoursPerWeek) previousValues.minimumHoursPerWeek = contract.minimumHoursPerWeek;

    if (Object.keys(previousValues).length === 0) {
      alert("No changes detected. Modify at least one rate or hours field.");
      return;
    }

    const entry: ContractUpdateEntry = {
      id: `upd-${Date.now()}`,
      date: new Date().toISOString().slice(0, 10),
      reason: updateReason,
      author: updateAuthor,
      notes: updateNotes.trim(),
      previousValues,
    };

    onSave?.({
      ...contract,
      talentRate: updateDraft.talentRate,
      contractRate: updateDraft.contractRate,
      expectedHoursPerWeek: updateDraft.expectedHoursPerWeek,
      minimumHoursPerWeek: updateDraft.minimumHoursPerWeek,
      updateHistory: [...contract.updateHistory, entry],
    });
    setShowUpdateForm(false);
  };

  const startEditing = () => {
    setDraft({
      talentRate: contract.talentRate,
      contractRate: contract.contractRate,
      expectedHoursPerWeek: contract.expectedHoursPerWeek,
      minimumHoursPerWeek: contract.minimumHoursPerWeek,
      trialStartDate: contract.trialStartDate,
      longTermStartDate: contract.longTermStartDate ?? "",
      accountOwner: contract.accountOwner,
      platformTeamOwner: contract.platformTeamOwner,
      primaryPoc: contract.primaryPoc,
      humanInputRiskFlag: contract.humanInputRiskFlag,
      humanInputRiskConfidence: contract.humanInputRiskConfidence ?? "",
      humanInputRiskNotes: contract.humanInputRiskNotes ?? "",
    });
    setEditing(true);
  };

  const cancelEditing = () => setEditing(false);

  const saveEditing = () => {
    onSave?.({
      ...contract,
      talentRate: draft.talentRate,
      contractRate: draft.contractRate,
      expectedHoursPerWeek: draft.expectedHoursPerWeek,
      minimumHoursPerWeek: draft.minimumHoursPerWeek,
      trialStartDate: draft.trialStartDate,
      longTermStartDate: draft.longTermStartDate || null,
      accountOwner: draft.accountOwner,
      platformTeamOwner: draft.platformTeamOwner,
      primaryPoc: draft.primaryPoc,
      humanInputRiskFlag: draft.humanInputRiskFlag,
      humanInputRiskConfidence: draft.humanInputRiskConfidence || null,
      humanInputRiskNotes: draft.humanInputRiskNotes || null,
    });
    setEditing(false);
  };

  return (
    <div style={{
      border: "1px solid #e5e7eb",
      borderRadius: "8px",
      padding: "20px",
      background: "#fff",
      marginBottom: "16px",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Link
              to={headerLabel === "company" ? `/companies/${contract.companyId}` : `/talent/${contract.talentId}`}
              style={{ fontSize: "16px", fontWeight: 600, color: "#1e40af", textDecoration: "none" }}
            >
              {headerLabel === "company" ? contract.companyName : contract.talentName}
            </Link>
            <span style={{
              fontSize: "11px",
              fontWeight: 600,
              padding: "2px 8px",
              borderRadius: "10px",
              background: importance.bg,
              color: importance.color,
            }}>
              {importance.label}
            </span>
            {upsell && (
              <Link
                to={`/upsells/${upsell.id}`}
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  padding: "2px 8px",
                  borderRadius: "10px",
                  background: "#d1fae5",
                  color: "#065f46",
                  textDecoration: "none",
                  cursor: "pointer",
                }}
              >
                Upsell: {upsell.status}
              </Link>
            )}
            {issueCount > 0 && (
              <Link
                to={`/issues?company=${contract.companyId}`}
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  padding: "2px 8px",
                  borderRadius: "10px",
                  background: "#fee2e2",
                  color: "#991b1b",
                  textDecoration: "none",
                  cursor: "pointer",
                }}
              >
                {issueCount} Open Issue{issueCount > 1 ? "s" : ""}
              </Link>
            )}
          </div>
          <div style={{ fontSize: "13px", color: "#64748b", marginTop: "2px" }}>{contract.jobDescription}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {isTrialOnly && (
            <span style={{
              background: "#fef3c7",
              color: "#92400e",
              fontSize: "11px",
              fontWeight: 600,
              padding: "2px 8px",
              borderRadius: "10px",
            }}>
              Trial
            </span>
          )}
          {!editing && !showUpdateForm && (
            <>
              {contract.pipelineData && (
                <button onClick={() => setShowPipeline(true)} style={{ ...editBtnStyle, background: "#f0fdf4", color: "#166534", borderColor: "#bbf7d0" }}>View Pipeline</button>
              )}
              <button onClick={startUpdate} style={{ ...editBtnStyle, background: "#eff6ff", color: "#1e40af", borderColor: "#bfdbfe" }}>Update Contract</button>
              <button onClick={startEditing} style={editBtnStyle}>Edit</button>
            </>
          )}
        </div>
      </div>

      {/* Update Contract Form */}
      {showUpdateForm && (
        <div style={{ marginBottom: "16px", background: "#f0f4ff", border: "1px solid #bfdbfe", borderRadius: "8px", padding: "16px" }}>
          <div style={{ fontSize: "13px", fontWeight: 600, color: "#1e40af", marginBottom: "12px" }}>Update Contract Terms</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "12px", marginBottom: "12px" }}>
            <div>
              <label style={fieldLabelStyle}>New Talent Rate ($/hr)</label>
              <input type="number" style={fieldInputStyle} value={updateDraft.talentRate} onChange={(e) => setUpdateDraft({ ...updateDraft, talentRate: Number(e.target.value) })} />
              {updateDraft.talentRate !== contract.talentRate && (
                <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>was ${contract.talentRate}/hr</div>
              )}
            </div>
            <div>
              <label style={fieldLabelStyle}>New Contract Rate ($/hr)</label>
              <input type="number" style={fieldInputStyle} value={updateDraft.contractRate} onChange={(e) => setUpdateDraft({ ...updateDraft, contractRate: Number(e.target.value) })} />
              {updateDraft.contractRate !== contract.contractRate && (
                <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>was ${contract.contractRate}/hr</div>
              )}
            </div>
            <div>
              <label style={fieldLabelStyle}>New Expected Hrs/Wk</label>
              <input type="number" style={fieldInputStyle} value={updateDraft.expectedHoursPerWeek} onChange={(e) => setUpdateDraft({ ...updateDraft, expectedHoursPerWeek: Number(e.target.value) })} />
              {updateDraft.expectedHoursPerWeek !== contract.expectedHoursPerWeek && (
                <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>was {contract.expectedHoursPerWeek}</div>
              )}
            </div>
            <div>
              <label style={fieldLabelStyle}>New Minimum Hrs/Wk</label>
              <input type="number" style={fieldInputStyle} value={updateDraft.minimumHoursPerWeek} onChange={(e) => setUpdateDraft({ ...updateDraft, minimumHoursPerWeek: Number(e.target.value) })} />
              {updateDraft.minimumHoursPerWeek !== contract.minimumHoursPerWeek && (
                <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>was {contract.minimumHoursPerWeek}</div>
              )}
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
            <div>
              <label style={fieldLabelStyle}>Reason for Update</label>
              <select style={fieldInputStyle} value={updateReason} onChange={(e) => setUpdateReason(e.target.value as ContractUpdateReason)}>
                {UPDATE_REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label style={fieldLabelStyle}>Author</label>
              <select style={fieldInputStyle} value={updateAuthor} onChange={(e) => setUpdateAuthor(e.target.value)}>
                {TEAM_MEMBERS.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>
          <div style={{ marginBottom: "12px" }}>
            <label style={fieldLabelStyle}>Notes</label>
            <input style={fieldInputStyle} value={updateNotes} onChange={(e) => setUpdateNotes(e.target.value)} placeholder="Reason and context for this update..." />
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button onClick={saveUpdate} style={saveBtnStyle}>Save Update</button>
            <button onClick={() => setShowUpdateForm(false)} style={cancelBtnStyle}>Cancel</button>
          </div>
        </div>
      )}

      {editing ? (
        <div style={{ marginBottom: "16px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "16px", marginBottom: "12px" }}>
            <div>
              <label style={fieldLabelStyle}>Talent Rate ($/hr)</label>
              <input type="number" style={fieldInputStyle} value={draft.talentRate} onChange={(e) => setDraft({ ...draft, talentRate: Number(e.target.value) })} />
            </div>
            <div>
              <label style={fieldLabelStyle}>Contract Rate ($/hr)</label>
              <input type="number" style={fieldInputStyle} value={draft.contractRate} onChange={(e) => setDraft({ ...draft, contractRate: Number(e.target.value) })} />
            </div>
            <div>
              <label style={fieldLabelStyle}>Take Rate</label>
              <div style={{ fontSize: "13px", fontWeight: 600, padding: "7px 0", color: "#2563eb" }}>
                {draft.contractRate > 0 ? `${Math.round(((draft.contractRate - draft.talentRate) / draft.contractRate) * 100)}%` : "—"}
              </div>
            </div>
            <div>
              <label style={fieldLabelStyle}>Expected Hrs/Wk</label>
              <input type="number" step={5} min={10} style={fieldInputStyle} value={draft.expectedHoursPerWeek} onChange={(e) => setDraft({ ...draft, expectedHoursPerWeek: Number(e.target.value) })} />
            </div>
            <div>
              <label style={fieldLabelStyle}>Minimum Hrs/Wk</label>
              <input type="number" step={5} min={10} style={fieldInputStyle} value={draft.minimumHoursPerWeek} onChange={(e) => setDraft({ ...draft, minimumHoursPerWeek: Number(e.target.value) })} />
            </div>
            <div>
              <label style={fieldLabelStyle}>Trial Start</label>
              <input type="date" style={fieldInputStyle} value={draft.trialStartDate} onChange={(e) => setDraft({ ...draft, trialStartDate: e.target.value })} />
            </div>
            <div>
              <label style={fieldLabelStyle}>Long-Term Start</label>
              <input type="date" style={fieldInputStyle} value={draft.longTermStartDate} onChange={(e) => setDraft({ ...draft, longTermStartDate: e.target.value })} />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", marginBottom: "12px" }}>
            <div>
              <label style={fieldLabelStyle}>Account Owner</label>
              <select style={fieldInputStyle} value={draft.accountOwner} onChange={(e) => setDraft({ ...draft, accountOwner: e.target.value })}>
                {TEAM_MEMBERS.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label style={fieldLabelStyle}>Platform Team Owner</label>
              <select style={fieldInputStyle} value={draft.platformTeamOwner} onChange={(e) => setDraft({ ...draft, platformTeamOwner: e.target.value })}>
                {TEAM_MEMBERS.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label style={fieldLabelStyle}>Primary POC</label>
              {contactNames.length > 0 ? (
                <select style={fieldInputStyle} value={draft.primaryPoc} onChange={(e) => setDraft({ ...draft, primaryPoc: e.target.value })}>
                  {contactNames.map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              ) : (
                <input style={fieldInputStyle} value={draft.primaryPoc} onChange={(e) => setDraft({ ...draft, primaryPoc: e.target.value })} />
              )}
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "auto 1fr 2fr", gap: "16px", marginBottom: "12px" }}>
            <div>
              <label style={fieldLabelStyle}>Risk Flag</label>
              <div style={{ padding: "6px 0" }}>
                <label style={{ fontSize: "13px", display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
                  <input type="checkbox" checked={draft.humanInputRiskFlag} onChange={(e) => setDraft({ ...draft, humanInputRiskFlag: e.target.checked })} />
                  Flagged
                </label>
              </div>
            </div>
            <div>
              <label style={fieldLabelStyle}>Risk Confidence</label>
              <select style={fieldInputStyle} value={draft.humanInputRiskConfidence} onChange={(e) => setDraft({ ...draft, humanInputRiskConfidence: e.target.value })}>
                <option value="">—</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
            <div>
              <label style={fieldLabelStyle}>Risk Notes</label>
              <input style={fieldInputStyle} value={draft.humanInputRiskNotes} onChange={(e) => setDraft({ ...draft, humanInputRiskNotes: e.target.value })} placeholder="Optional risk notes..." />
            </div>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button onClick={saveEditing} style={saveBtnStyle}>Save</button>
            <button onClick={cancelEditing} style={cancelBtnStyle}>Cancel</button>
          </div>
        </div>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "16px", marginBottom: "16px" }}>
            <div>
              <div style={{ fontSize: "11px", color: "#64748b" }}>Talent Rate</div>
              <div style={{ fontSize: "14px", fontWeight: 600 }}>${contract.talentRate}/hr</div>
            </div>
            <div>
              <div style={{ fontSize: "11px", color: "#64748b" }}>Contract Rate</div>
              <div style={{ fontSize: "14px", fontWeight: 600 }}>${contract.contractRate}/hr</div>
            </div>
            <div>
              <div style={{ fontSize: "11px", color: "#64748b" }}>Take Rate</div>
              <div style={{ fontSize: "14px", fontWeight: 600, color: "#2563eb" }}>
                {contract.contractRate > 0 ? `${Math.round(((contract.contractRate - contract.talentRate) / contract.contractRate) * 100)}%` : "—"}
              </div>
            </div>
            <div>
              <div style={{ fontSize: "11px", color: "#64748b" }}>Expected Hrs/Wk</div>
              <div style={{ fontSize: "14px", fontWeight: 600 }}>{contract.expectedHoursPerWeek}</div>
            </div>
            <div>
              <div style={{ fontSize: "11px", color: "#64748b" }}>Minimum Hrs/Wk</div>
              <div style={{ fontSize: "14px", fontWeight: 600 }}>{contract.minimumHoursPerWeek}</div>
            </div>
            <div>
              <div style={{ fontSize: "11px", color: "#64748b" }}>Trial Start</div>
              <div style={{ fontSize: "14px", fontWeight: 500 }}>{contract.trialStartDate}</div>
            </div>
            <div>
              <div style={{ fontSize: "11px", color: "#64748b" }}>Long-Term Start</div>
              <div style={{ fontSize: "14px", fontWeight: 500 }}>{contract.longTermStartDate ?? "—"}</div>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", marginBottom: "16px" }}>
            <div>
              <div style={{ fontSize: "11px", color: "#64748b" }}>Account Owner</div>
              <div style={{ fontSize: "14px", fontWeight: 500 }}>{contract.accountOwner}</div>
            </div>
            <div>
              <div style={{ fontSize: "11px", color: "#64748b" }}>Platform Team Owner</div>
              <div style={{ fontSize: "14px", fontWeight: 500 }}>{contract.platformTeamOwner}</div>
            </div>
            <div>
              <div style={{ fontSize: "11px", color: "#64748b" }}>Primary POC</div>
              <div style={{ fontSize: "14px", fontWeight: 500 }}>{contract.primaryPoc}</div>
            </div>
          </div>
          {/* Contract Health */}
          <div style={{ marginBottom: "16px" }}>
            <div style={{ fontSize: "12px", fontWeight: 600, color: "#374151", marginBottom: "8px" }}>Contract Health</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "16px" }}>
              <div>
                <div style={{ fontSize: "11px", color: "#64748b" }}>Health Score</div>
                <div style={{ fontSize: "14px", fontWeight: 600 }}>
                  <span style={{
                    display: "inline-block",
                    padding: "2px 8px",
                    borderRadius: "10px",
                    fontSize: "12px",
                    fontWeight: 600,
                    background: contract.healthScore === "Healthy" ? "#dcfce7" : contract.healthScore === "Needs Attention" ? "#fef3c7" : "#fee2e2",
                    color: contract.healthScore === "Healthy" ? "#166534" : contract.healthScore === "Needs Attention" ? "#92400e" : "#991b1b",
                  }}>
                    {contract.healthScore}
                  </span>
                </div>
              </div>
              <div>
                <div style={{ fontSize: "11px", color: "#64748b" }}>Status</div>
                <div style={{ fontSize: "14px", fontWeight: 600 }}>
                  <span style={{
                    display: "inline-block",
                    padding: "2px 8px",
                    borderRadius: "10px",
                    fontSize: "12px",
                    fontWeight: 600,
                    background: contract.status === "Trial" ? "#fef3c7" : contract.status === "Active" ? "#dcfce7" : contract.status === "At Risk" ? "#fee2e2" : "#f1f5f9",
                    color: contract.status === "Trial" ? "#92400e" : contract.status === "Active" ? "#166534" : contract.status === "At Risk" ? "#991b1b" : "#475569",
                  }}>
                    {contract.status}
                  </span>
                </div>
              </div>
              <div>
                <div style={{ fontSize: "11px", color: "#64748b" }}>Trial Outcome</div>
                <div style={{ fontSize: "14px", fontWeight: 500 }}>{contract.trialOutcome ?? "\u2014"}</div>
              </div>
              <div>
                <div style={{ fontSize: "11px", color: "#64748b" }}>Role Type</div>
                <div style={{ fontSize: "14px", fontWeight: 500 }}>{contract.roleType}</div>
              </div>
              <div>
                <div style={{ fontSize: "11px", color: "#64748b" }}>Time to First Issue</div>
                <div style={{ fontSize: "14px", fontWeight: 500 }}>{contract.timeToFirstIssue !== null ? contract.timeToFirstIssue + " days" : "No issues"}</div>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginTop: "12px" }}>
              <div>
                <div style={{ fontSize: "11px", color: "#64748b" }}>Risk Flag</div>
                <div style={{ fontSize: "14px", fontWeight: 600 }}>
                  {contract.humanInputRiskFlag ? (
                    <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: "10px", fontSize: "12px", fontWeight: 600, background: "#fee2e2", color: "#991b1b" }}>
                      FLAGGED {contract.humanInputRiskConfidence ? `(${contract.humanInputRiskConfidence})` : ""}
                    </span>
                  ) : (
                    <span style={{ color: "#166534" }}>None</span>
                  )}
                </div>
              </div>
              <div>
                <div style={{ fontSize: "11px", color: "#64748b" }}>Risk Confidence</div>
                <div style={{ fontSize: "14px", fontWeight: 500 }}>{contract.humanInputRiskConfidence ?? "\u2014"}</div>
              </div>
              <div>
                <div style={{ fontSize: "11px", color: "#64748b" }}>Risk Notes</div>
                <div style={{ fontSize: "14px", fontWeight: 500 }}>{contract.humanInputRiskNotes || "\u2014"}</div>
              </div>
              <div>
                <div style={{ fontSize: "11px", color: "#64748b" }}>Replacements</div>
                <div style={{ fontSize: "14px", fontWeight: 500 }}>{contract.replacementEventIds.length}</div>
              </div>
            </div>
          </div>
          {/* Update History */}
          {contract.updateHistory.length > 0 && (
            <div style={{ marginBottom: "16px" }}>
              <details>
                <summary style={{ fontSize: "12px", fontWeight: 600, color: "#374151", cursor: "pointer", marginBottom: "8px" }}>
                  Update History ({contract.updateHistory.length})
                </summary>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "8px" }}>
                  {[...contract.updateHistory].reverse().map((entry) => (
                    <div key={entry.id} style={{ padding: "10px 14px", background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: "6px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ fontSize: "12px", fontWeight: 600, color: "#1e40af", background: "#dbeafe", padding: "1px 8px", borderRadius: "8px" }}>{entry.reason}</span>
                          <span style={{ fontSize: "12px", color: "#64748b" }}>by {entry.author}</span>
                        </div>
                        <span style={{ fontSize: "12px", color: "#94a3b8" }}>{entry.date}</span>
                      </div>
                      <div style={{ display: "flex", gap: "16px", fontSize: "12px", color: "#475569", marginBottom: entry.notes ? "4px" : "0" }}>
                        {entry.previousValues.talentRate !== undefined && (
                          <span>Talent Rate: ${entry.previousValues.talentRate} → ${contract.talentRate}/hr</span>
                        )}
                        {entry.previousValues.contractRate !== undefined && (
                          <span>Contract Rate: ${entry.previousValues.contractRate} → ${contract.contractRate}/hr</span>
                        )}
                        {entry.previousValues.expectedHoursPerWeek !== undefined && (
                          <span>Expected Hrs: {entry.previousValues.expectedHoursPerWeek} → {contract.expectedHoursPerWeek}</span>
                        )}
                        {entry.previousValues.minimumHoursPerWeek !== undefined && (
                          <span>Min Hrs: {entry.previousValues.minimumHoursPerWeek} → {contract.minimumHoursPerWeek}</span>
                        )}
                      </div>
                      {entry.notes && <div style={{ fontSize: "12px", color: "#64748b", fontStyle: "italic" }}>{entry.notes}</div>}
                    </div>
                  ))}
                </div>
              </details>
            </div>
          )}
        </>
      )}

      <div style={{ marginBottom: "16px" }}>
        <div style={{ fontSize: "12px", fontWeight: 600, color: "#374151", marginBottom: "8px" }}>Hours Utilization</div>
        <HoursBar label="Last Week" pct={contract.hoursUsed.lastWeek} />
        <HoursBar label="Last Month" pct={contract.hoursUsed.lastMonth} />
        <HoursBar label="Last Quarter" pct={contract.hoursUsed.lastQuarter} />
        <HoursBar label="Last Year" pct={contract.hoursUsed.lastYear} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "4px" }}>
        <ScoreSection label="Performance Score" scores={contract.talentPerformanceScores} />
        <ScoreSection label="Satisfaction Score" scores={contract.talentSatisfactionScores} />
      </div>

      {/* Contract Attachment */}
      <div style={{
        marginTop: "12px",
        padding: "12px 16px",
        background: "#f9fafb",
        border: "1px solid #e5e7eb",
        borderRadius: "6px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "18px" }}>{contract.attachmentFileName ? "\u{1F4CE}" : "\u{1F4C4}"}</span>
          {contract.attachmentFileName ? (
            <div>
              <button
                onClick={(e) => { e.stopPropagation(); alert(`[Demo] Would open: ${contract.attachmentFileName}`); }}
                style={{
                  background: "none",
                  border: "none",
                  color: "#2563eb",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                  padding: 0,
                  textDecoration: "underline",
                }}
              >
                {contract.attachmentFileName}
              </button>
              <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "1px" }}>Contract document attached</div>
            </div>
          ) : (
            <div style={{ fontSize: "13px", color: "#94a3b8" }}>No contract document attached</div>
          )}
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onUploadAttachment?.(contract.id); }}
          style={{
            padding: "6px 14px",
            fontSize: "12px",
            fontWeight: 500,
            border: "1px solid #d1d5db",
            borderRadius: "6px",
            background: "#fff",
            cursor: "pointer",
            color: "#374151",
          }}
        >
          {contract.attachmentFileName ? "Replace" : "Upload"}
        </button>
      </div>

      <MrrPanel base={contract.mrr.base} expected={contract.mrr.expected} actual={contract.mrr.actual} />

      {/* Pipeline Modal */}
      {showPipeline && contract.pipelineData && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}
          onClick={() => setShowPipeline(false)}
        >
          <div
            style={{ background: "#fff", borderRadius: "12px", width: "640px", maxHeight: "80vh", overflow: "auto", padding: "28px", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
              <div>
                <h3 style={{ fontSize: "18px", fontWeight: 700, margin: 0 }}>{contract.roleType} — {contract.companyName}</h3>
                <div style={{ fontSize: "13px", color: "#64748b", marginTop: "4px" }}>Talent: {contract.talentName}</div>
              </div>
              <button onClick={() => setShowPipeline(false)} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#94a3b8", padding: "0 4px" }}>&times;</button>
            </div>

            {/* Pipeline Info */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", marginBottom: "20px" }}>
              <div>
                <div style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase", marginBottom: "2px" }}>Pipeline Stage</div>
                <span style={{ fontSize: "13px", fontWeight: 600, padding: "2px 10px", borderRadius: "10px", background: "#dcfce7", color: "#166534" }}>
                  {contract.pipelineData.pipelineStage}
                </span>
              </div>
              <div>
                <div style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase", marginBottom: "2px" }}>Deal Owner</div>
                <div style={{ fontSize: "14px", fontWeight: 500 }}>{contract.pipelineData.dealOwner}</div>
              </div>
              <div>
                <div style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase", marginBottom: "2px" }}>Close Date</div>
                <div style={{ fontSize: "14px", fontWeight: 500 }}>{contract.pipelineData.closeDate}</div>
              </div>
            </div>

            {/* Original Job Description */}
            <div style={{ marginBottom: "20px" }}>
              <div style={{ fontSize: "12px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>Original Job Description</div>
              <div style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: "6px", padding: "12px", fontSize: "13px", color: "#374151", lineHeight: "1.6" }}>
                {contract.pipelineData.originalJobDescription}
              </div>
            </div>

            {/* Sales Notes */}
            <div style={{ marginBottom: "16px" }}>
              <div style={{ fontSize: "12px", fontWeight: 600, color: "#374151", marginBottom: "8px" }}>Sales Notes</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {contract.pipelineData.salesNotes.map((note, i) => (
                  <div key={i} style={{ borderLeft: "3px solid #2563eb", padding: "8px 12px", background: "#f9fafb", borderRadius: "0 6px 6px 0" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                      <span style={{ fontSize: "12px", fontWeight: 600, color: "#1e293b" }}>{note.author}</span>
                      <span style={{ fontSize: "11px", color: "#94a3b8" }}>{note.date}</span>
                    </div>
                    <div style={{ fontSize: "13px", color: "#475569", lineHeight: "1.5" }}>{note.note}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ fontSize: "11px", color: "#94a3b8", textAlign: "right", fontStyle: "italic" }}>Source: Sales Pipeline</div>
          </div>
        </div>
      )}
    </div>
  );
}

const fieldLabelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "11px",
  fontWeight: 600,
  color: "#64748b",
  marginBottom: "3px",
};

const fieldInputStyle: React.CSSProperties = {
  width: "100%",
  padding: "6px 8px",
  border: "1px solid #d1d5db",
  borderRadius: "6px",
  fontSize: "13px",
  outline: "none",
};

const editBtnStyle: React.CSSProperties = {
  padding: "4px 12px",
  fontSize: "12px",
  fontWeight: 500,
  border: "1px solid #d1d5db",
  borderRadius: "6px",
  background: "#fff",
  cursor: "pointer",
  color: "#374151",
};

const saveBtnStyle: React.CSSProperties = {
  padding: "6px 16px",
  background: "#2563eb",
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  fontSize: "12px",
  fontWeight: 600,
  cursor: "pointer",
};

const cancelBtnStyle: React.CSSProperties = {
  padding: "6px 16px",
  background: "#fff",
  color: "#374151",
  border: "1px solid #d1d5db",
  borderRadius: "6px",
  fontSize: "12px",
  fontWeight: 500,
  cursor: "pointer",
};
