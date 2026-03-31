import { useMemo } from "react";
import { useAppContext } from "../../context/AppContext";
import {
  calcAvgTimeToReplacement,
  calcPctClientsWithReplacement,
  calcReplacementReasonDistribution,
  calcReplacementSuccessRate,
  calcPctContractsBelowMinimumHours,
  calcPctContractsBelowExpectedHours,
  calcPctTimeBelowExpected,
  calcRevenueBelowExpected,
  calcTotalConcessions,
  calcAvgResponseTime,
  calcCheckInCompletionRate,
  calcProactiveVsReactive,
  calcIgnoredFollowups,
} from "../../utils/csMetrics";

/* ── Style helpers ─────────────────────────────────────────────── */

const sectionStyle: React.CSSProperties = {
  marginBottom: 28,
};

const sectionTitleStyle: React.CSSProperties = {
  fontSize: 16,
  fontWeight: 700,
  borderBottom: "2px solid #e5e7eb",
  paddingBottom: 8,
  marginBottom: 16,
};

const cardRowStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 16,
};

const cardStyle: React.CSSProperties = {
  background: "#fff",
  border: "1px solid #e5e7eb",
  borderRadius: 8,
  padding: 20,
  minWidth: 200,
  flex: "1 1 200px",
};

const valueLabelStyle = (color?: string): React.CSSProperties => ({
  fontSize: 28,
  fontWeight: 700,
  color: color ?? "#0f172a",
});

const labelStyle: React.CSSProperties = {
  fontSize: 12,
  color: "#64748b",
  textTransform: "uppercase",
  marginTop: 4,
};

/* ── Helpers ───────────────────────────────────────────────────── */

function fmt(n: number | null | undefined, suffix = ""): string {
  if (n === null || n === undefined) return "N/A";
  return `${n.toLocaleString(undefined, { maximumFractionDigits: 1 })}${suffix}`;
}

function fmtDollars(n: number): string {
  return `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

/** Green if the value is "good" (low/high depending on metric), red otherwise. */
function pctColor(value: number, goodBelow: number): string {
  return value <= goodBelow ? "#166534" : "#991b1b";
}

function pctColorAbove(value: number, goodAbove: number): string {
  return value >= goodAbove ? "#166534" : "#991b1b";
}

/* ── Component ─────────────────────────────────────────────────── */

export default function CsMetricsReport() {
  const { companies, contracts, issues, replacements, interactions, utilization } =
    useAppContext();

  /* Replacement metrics */
  const avgTimeToReplace = useMemo(
    () => calcAvgTimeToReplacement(replacements, contracts),
    [replacements, contracts],
  );
  const pctClientsWithReplace = useMemo(
    () => calcPctClientsWithReplacement(replacements, companies),
    [replacements, companies],
  );
  const replSuccessRate = useMemo(
    () => calcReplacementSuccessRate(replacements),
    [replacements],
  );
  const reasonDist = useMemo(
    () => calcReplacementReasonDistribution(replacements),
    [replacements],
  );

  /* Revenue & hours health */
  const pctBelowMin = useMemo(
    () => calcPctContractsBelowMinimumHours(utilization),
    [utilization],
  );
  const pctBelowExpected = useMemo(
    () => calcPctContractsBelowExpectedHours(utilization),
    [utilization],
  );
  const pctTimeBelowExp = useMemo(
    () => calcPctTimeBelowExpected(utilization),
    [utilization],
  );
  const revenueGap = useMemo(
    () => calcRevenueBelowExpected(contracts),
    [contracts],
  );
  const totalConcessions = useMemo(
    () => calcTotalConcessions(issues),
    [issues],
  );

  /* Engagement metrics */
  const avgResponse = useMemo(
    () => calcAvgResponseTime(interactions),
    [interactions],
  );
  const checkInRate = useMemo(
    () => calcCheckInCompletionRate(interactions),
    [interactions],
  );
  const proReactive = useMemo(
    () => calcProactiveVsReactive(interactions),
    [interactions],
  );
  const ignoredFollowups = useMemo(
    () => calcIgnoredFollowups(interactions),
    [interactions],
  );

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24 }}>
        CS Metrics Dashboard
      </h2>

      {/* ── Section 1: Replacement Metrics ─────────────────────── */}
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>Replacement Metrics</div>
        <div style={cardRowStyle}>
          <div style={cardStyle}>
            <div style={valueLabelStyle()}>
              {fmt(avgTimeToReplace)}
            </div>
            <div style={labelStyle}>Avg Time to Replacement (days)</div>
          </div>

          <div style={cardStyle}>
            <div
              style={valueLabelStyle(
                pctColor(pctClientsWithReplace, 15),
              )}
            >
              {fmt(pctClientsWithReplace, "%")}
            </div>
            <div style={labelStyle}>% Clients with Replacement</div>
          </div>

          <div style={cardStyle}>
            <div
              style={valueLabelStyle(
                replSuccessRate !== null
                  ? pctColorAbove(replSuccessRate, 70)
                  : undefined,
              )}
            >
              {fmt(replSuccessRate, "%")}
            </div>
            <div style={labelStyle}>Replacement Success Rate</div>
          </div>

          <div style={cardStyle}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {Object.entries(reasonDist).length === 0 ? (
                <span style={{ color: "#94a3b8" }}>No data</span>
              ) : (
                Object.entries(reasonDist).map(([reason, count]) => (
                  <span
                    key={reason}
                    style={{
                      fontSize: 14,
                      background: "#f1f5f9",
                      borderRadius: 4,
                      padding: "4px 10px",
                    }}
                  >
                    <strong>{reason}:</strong> {count}
                  </span>
                ))
              )}
            </div>
            <div style={labelStyle}>Reason Distribution</div>
          </div>
        </div>
      </div>

      {/* ── Section 2: Revenue & Hours Health ──────────────────── */}
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>Revenue &amp; Hours Health</div>
        <div style={cardRowStyle}>
          <div style={cardStyle}>
            <div style={valueLabelStyle(pctColor(pctBelowMin, 10))}>
              {fmt(pctBelowMin, "%")}
            </div>
            <div style={labelStyle}>% Contracts Below Minimum Hours</div>
          </div>

          <div style={cardStyle}>
            <div style={valueLabelStyle(pctColor(pctBelowExpected, 20))}>
              {fmt(pctBelowExpected, "%")}
            </div>
            <div style={labelStyle}>% Contracts Below Expected Hours</div>
          </div>

          <div style={cardStyle}>
            <div style={valueLabelStyle(pctColor(pctTimeBelowExp, 20))}>
              {fmt(pctTimeBelowExp, "%")}
            </div>
            <div style={labelStyle}>% of Time Below Expected</div>
          </div>

          <div style={cardStyle}>
            <div style={valueLabelStyle("#991b1b")}>
              {fmtDollars(revenueGap.dollars)}
            </div>
            <div style={labelStyle}>Revenue Gap $</div>
          </div>

          <div style={cardStyle}>
            <div style={valueLabelStyle(pctColor(revenueGap.pct, 10))}>
              {fmt(revenueGap.pct, "%")}
            </div>
            <div style={labelStyle}>Revenue Gap %</div>
          </div>

          <div style={cardStyle}>
            <div style={valueLabelStyle(totalConcessions > 0 ? "#991b1b" : "#166534")}>
              {fmtDollars(totalConcessions)}
            </div>
            <div style={labelStyle}>Total Concessions</div>
          </div>
        </div>
      </div>

      {/* ── Section 3: Engagement Metrics ──────────────────────── */}
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>Engagement Metrics</div>
        <div style={cardRowStyle}>
          <div style={cardStyle}>
            <div style={valueLabelStyle()}>
              {fmt(avgResponse)}
            </div>
            <div style={labelStyle}>Avg Response Time (days)</div>
          </div>

          <div style={cardStyle}>
            <div style={valueLabelStyle(pctColorAbove(checkInRate, 80))}>
              {fmt(checkInRate, "%")}
            </div>
            <div style={labelStyle}>Check-In Completion Rate</div>
          </div>

          <div style={cardStyle}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              <span style={valueLabelStyle("#166534")}>
                {proReactive.proactive}
              </span>
              <span style={{ fontSize: 16, color: "#94a3b8" }}>pro</span>
              <span style={{ fontSize: 16, color: "#94a3b8" }}>/</span>
              <span style={valueLabelStyle("#991b1b")}>
                {proReactive.reactive}
              </span>
              <span style={{ fontSize: 16, color: "#94a3b8" }}>react</span>
            </div>
            <div style={{ fontSize: 14, color: "#64748b", marginTop: 2 }}>
              {fmt(proReactive.proactivePct, "%")} proactive
            </div>
            <div style={labelStyle}>Proactive vs Reactive</div>
          </div>

          <div style={cardStyle}>
            <div
              style={valueLabelStyle(
                ignoredFollowups === 0 ? "#166534" : "#991b1b",
              )}
            >
              {ignoredFollowups}
            </div>
            <div style={labelStyle}># Ignored Followups</div>
          </div>
        </div>
      </div>
    </div>
  );
}
