import { useParams, Link } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";
import { calcTalentTenureMonths, calcSatisfactionTrend } from "../../utils/csMetrics";
import PageLayout from "../layout/PageLayout";
import ContractCard from "../companies/ContractCard";

const thStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "8px 12px",
  fontSize: "12px",
  fontWeight: 600,
  color: "#64748b",
  borderBottom: "2px solid #e5e7eb",
  whiteSpace: "nowrap",
};

const tdStyle: React.CSSProperties = {
  padding: "8px 12px",
  fontSize: "13px",
  borderBottom: "1px solid #f1f5f9",
};

export default function TalentDetail() {
  const { id } = useParams<{ id: string }>();
  const { talent, contracts, setContracts, companies, issues, replacements, talentSurveys, performanceReviews, upsells } = useAppContext();
  const person = talent.find((t) => t.id === id);

  if (!person) {
    return (
      <PageLayout title="Talent Not Found">
        <p>No talent with ID "{id}" was found.</p>
        <Link to="/talent" style={{ color: "#2563eb" }}>Back to Talent</Link>
      </PageLayout>
    );
  }

  const talentContracts = contracts.filter((c) => c.talentId === person.id);
  const activeContracts = talentContracts.filter((c) => c.status !== "Ended");
  const endedContracts = talentContracts.filter((c) => c.status === "Ended");

  // Satisfaction surveys grouped by contract
  const personSurveys = talentSurveys
    .filter((s) => s.talentId === person.id)
    .sort((a, b) => a.sentDate.localeCompare(b.sentDate));

  const surveysByContract = new Map<string, typeof personSurveys>();
  for (const s of personSurveys) {
    const key = s.contractId;
    if (!surveysByContract.has(key)) surveysByContract.set(key, []);
    surveysByContract.get(key)!.push(s);
  }

  function trendInfo(scores: (number | null)[]) {
    const valid = scores.filter((s): s is number => s !== null);
    if (valid.length < 2) return { direction: "flat" as const, color: "#6b7280" };
    const dir = valid[valid.length - 1] > valid[0] ? "up" as const : valid[valid.length - 1] < valid[0] ? "down" as const : "flat" as const;
    return { direction: dir, color: dir === "up" ? "#16a34a" : dir === "down" ? "#dc2626" : "#6b7280" };
  }

  // Performance reviews grouped by contract
  const personReviews = performanceReviews
    .filter((r) => r.talentId === person.id)
    .sort((a, b) => a.sentDate.localeCompare(b.sentDate));

  const reviewsByContract = new Map<string, typeof personReviews>();
  for (const r of personReviews) {
    if (!reviewsByContract.has(r.contractId)) reviewsByContract.set(r.contractId, []);
    reviewsByContract.get(r.contractId)!.push(r);
  }

  // Replacement history
  const personReplacements = replacements.filter(
    (r) => r.previousTalentId === person.id || r.newTalentId === person.id
  );

  // Attrition risk badge colors
  const riskColors: Record<string, { bg: string; fg: string }> = {
    Low: { bg: "#dcfce7", fg: "#166534" },
    Medium: { bg: "#fef3c7", fg: "#92400e" },
    High: { bg: "#fee2e2", fg: "#991b1b" },
  };
  const riskStyle = riskColors[person.attritionRisk] || riskColors.Low;

  return (
    <PageLayout title="">
      <div style={{ marginBottom: "8px" }}>
        <Link to="/talent" style={{ color: "#64748b", textDecoration: "none", fontSize: "14px" }}>&larr; Talent</Link>
      </div>

      <h2 style={{ fontSize: "24px", fontWeight: 700, margin: "0 0 24px 0" }}>{person.name}</h2>

      <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "20px", marginBottom: "24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "20px" }}>
          <Field label="Email" value={person.email} />
          <Field label="Phone" value={person.phone} />
          <Field label="Location" value={person.location} />
          <Field label="Specialization" value={person.specialization} />
          <Field label="Active Contracts" value={String(activeContracts.length)} />
          <Field label="Start Date" value={person.startDate} />
          <Field label="Tenure" value={calcTalentTenureMonths(person) + " months"} />
          <div>
            <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "2px" }}>Attrition Risk</div>
            <span
              style={{
                display: "inline-block",
                fontSize: "13px",
                fontWeight: 600,
                padding: "2px 10px",
                borderRadius: "9999px",
                background: riskStyle.bg,
                color: riskStyle.fg,
              }}
            >
              {person.attritionRisk}
            </span>
          </div>
          <div>
            <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "2px" }}>Volatility</div>
            <div style={{ fontSize: "14px", fontWeight: 500, color: person.volatilityFlag ? "#dc2626" : undefined }}>
              {person.volatilityFlag ? "Flagged" : "None"}
            </div>
          </div>
        </div>
      </div>

      <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "12px", paddingBottom: "8px", borderBottom: "1px solid #e5e7eb" }}>
        Active Contracts ({activeContracts.length})
        {endedContracts.length > 0 && (
          <Link
            to="/contracts?status=Ended"
            style={{ fontSize: "13px", fontWeight: 500, color: "#dc2626", marginLeft: "8px", textDecoration: "none" }}
          >
            + {endedContracts.length} ended
          </Link>
        )}
      </h3>

      {activeContracts.length > 0 ? (
        activeContracts.map((c) => (
          <ContractCard
            key={c.id}
            contract={c}
            allContracts={contracts}
            headerLabel="company"
            contactNames={(() => {
              const co = companies.find((x) => x.id === c.companyId);
              return co ? [co.primaryContact.name, ...co.additionalContacts.map((ac) => ac.name)] : [];
            })()}
            onUploadAttachment={(contractId) => {
              const ct = contracts.find((x) => x.id === contractId);
              if (!ct) return;
              const mockName = `${ct.companyName.replace(/\s+/g, "")}-${person.name.replace(/\s+/g, "")}-Contract.pdf`;
              setContracts((prev) => prev.map((x) => (x.id === contractId ? { ...x, attachmentFileName: mockName } : x)));
            }}
            onSave={(updated) => setContracts((prev) => prev.map((x) => (x.id === updated.id ? updated : x)))}
            upsell={upsells.find((u) => u.contractId === c.id)}
            issueCount={issues.filter((i) => i.contractId === c.id && i.status !== "Resolved").length}
          />
        ))
      ) : (
        <p style={{ color: "#9ca3af" }}>No active contracts.</p>
      )}

      {/* Satisfaction Surveys — grouped by contract */}
      <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "12px", paddingBottom: "8px", borderBottom: "1px solid #e5e7eb", marginTop: "32px" }}>
        Satisfaction Surveys ({personSurveys.length})
      </h3>

      {personSurveys.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px", marginBottom: "32px" }}>
          {Array.from(surveysByContract.entries()).map(([contractId, surveys]) => {
            const contract = contracts.find((c) => c.id === contractId);
            const scores = surveys.map((s) => s.satisfactionScore);
            const { color: tColor } = trendInfo(scores);
            const validScores = scores.filter((s): s is number => s !== null);
            const trendStr = validScores.join(" \u2192 ");

            return (
              <div key={contractId}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <Link to={`/companies/${contract?.companyId}`} style={{ fontSize: "14px", fontWeight: 600, color: "#1e40af", textDecoration: "none" }}>
                      {contract?.companyName ?? contractId}
                    </Link>
                    <span style={{ fontSize: "12px", color: "#64748b" }}>{contract?.roleType}</span>
                  </div>
                  {validScores.length > 0 && (
                    <div style={{ fontSize: "13px" }}>
                      <span style={{ fontWeight: 500, color: "#64748b", marginRight: "6px" }}>Trend:</span>
                      <span style={{ fontWeight: 600, color: tColor }}>{trendStr}</span>
                    </div>
                  )}
                </div>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px" }}>
                    <thead>
                      <tr>
                        <th style={thStyle}>Sent Date</th>
                        <th style={thStyle}>Completed Date</th>
                        <th style={thStyle}>Score</th>
                        <th style={thStyle}>Complaints</th>
                        <th style={thStyle}>Replacement Risk</th>
                        <th style={thStyle}>Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {surveys.map((s) => {
                        const score = s.satisfactionScore;
                        const scoreColor = score === null ? "#6b7280" : score >= 7 ? "#16a34a" : score >= 5 ? "#ca8a04" : "#dc2626";
                        return (
                          <tr key={s.id}>
                            <td style={tdStyle}>{s.sentDate}</td>
                            <td style={tdStyle}>{s.completedDate || "Pending"}</td>
                            <td style={{ ...tdStyle, color: scoreColor, fontWeight: 600 }}>{score !== null ? score : "\u2014"}</td>
                            <td style={tdStyle}>{s.flagComplaints ? "Yes" : "No"}</td>
                            <td style={tdStyle}>{s.flagReplacementRisk ? "Yes" : "No"}</td>
                            <td style={tdStyle}>{s.notes || "\u2014"}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p style={{ color: "#9ca3af", marginBottom: "32px" }}>No satisfaction surveys.</p>
      )}

      {/* Performance Reviews — grouped by contract */}
      <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "12px", paddingBottom: "8px", borderBottom: "1px solid #e5e7eb", marginTop: "32px" }}>
        Performance Reviews ({personReviews.length})
      </h3>

      {personReviews.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px", marginBottom: "32px" }}>
          {Array.from(reviewsByContract.entries()).map(([contractId, reviews]) => {
            const contract = contracts.find((c) => c.id === contractId);
            const scores = reviews.map((r) => r.performanceScore);
            const { color: tColor } = trendInfo(scores);
            const validScores = scores.filter((s): s is number => s !== null);
            const trendStr = validScores.join(" \u2192 ");

            return (
              <div key={contractId}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <Link to={`/companies/${contract?.companyId}`} style={{ fontSize: "14px", fontWeight: 600, color: "#1e40af", textDecoration: "none" }}>
                      {contract?.companyName ?? contractId}
                    </Link>
                    <span style={{ fontSize: "12px", color: "#64748b" }}>{contract?.roleType}</span>
                  </div>
                  {validScores.length > 0 && (
                    <div style={{ fontSize: "13px" }}>
                      <span style={{ fontWeight: 500, color: "#64748b", marginRight: "6px" }}>Trend:</span>
                      <span style={{ fontWeight: 600, color: tColor }}>{trendStr}</span>
                    </div>
                  )}
                </div>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px" }}>
                    <thead>
                      <tr>
                        <th style={thStyle}>Sent Date</th>
                        <th style={thStyle}>Completed Date</th>
                        <th style={thStyle}>Score</th>
                        <th style={thStyle}>Reviewer</th>
                        <th style={thStyle}>Underperformance</th>
                        <th style={thStyle}>Exceptional</th>
                        <th style={thStyle}>Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reviews.map((r) => {
                        const score = r.performanceScore;
                        const scoreColor = score === null ? "#6b7280" : score >= 7 ? "#16a34a" : score >= 5 ? "#ca8a04" : "#dc2626";
                        return (
                          <tr key={r.id}>
                            <td style={tdStyle}>{r.sentDate}</td>
                            <td style={tdStyle}>{r.completedDate || "Pending"}</td>
                            <td style={{ ...tdStyle, color: scoreColor, fontWeight: 600 }}>{score !== null ? score : "\u2014"}</td>
                            <td style={tdStyle}>{r.reviewerName}</td>
                            <td style={tdStyle}>{r.flagUnderperformance ? <span style={{ color: "#dc2626", fontWeight: 600 }}>Yes</span> : "No"}</td>
                            <td style={tdStyle}>{r.flagExceptionalWork ? <span style={{ color: "#16a34a", fontWeight: 600 }}>Yes</span> : "No"}</td>
                            <td style={tdStyle}>{r.notes || "\u2014"}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p style={{ color: "#9ca3af", marginBottom: "32px" }}>No performance reviews.</p>
      )}

      {/* Replacement History */}
      <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "12px", paddingBottom: "8px", borderBottom: "1px solid #e5e7eb" }}>
        Replacement History ({personReplacements.length})
      </h3>

      {personReplacements.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {personReplacements.map((r) => {
            const role = r.previousTalentId === person.id ? "Previous Talent" : "New Talent";
            const successLabel = r.successfulAt3Months === true ? "Yes" : r.successfulAt3Months === false ? "No" : "TBD";
            return (
              <div key={r.id} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "16px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                  <Field label="Date" value={r.date} />
                  <Field label="Contract ID" value={r.contractId} />
                  <Field label="Reason" value={r.reason} />
                  <Field label="Role" value={role} />
                  <Field label="Success at 3 Months" value={successLabel} />
                  <Field label="Notes" value={r.notes || "\u2014"} />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p style={{ color: "#9ca3af" }}>No replacement history.</p>
      )}
    </PageLayout>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "2px" }}>{label}</div>
      <div style={{ fontSize: "14px", fontWeight: 500 }}>{value}</div>
    </div>
  );
}
