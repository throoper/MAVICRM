import { useState } from "react";
import PageLayout from "../layout/PageLayout";
import MrrReport from "./MrrReport";
import IssueReport from "./IssueReport";
import CsMetricsReport from "./CsMetricsReport";
import UtilizationReport from "./UtilizationReport";
import ClientEngagementReport from "./ClientEngagementReport";
import TalentHealthReport from "./TalentHealthReport";
import ChurnReport from "./ChurnReport";

const tabs = [
  { id: "cs-metrics", label: "CS Metrics" },
  { id: "mrr", label: "MRR: Actual vs Expected" },
  { id: "utilization", label: "Utilization" },
  { id: "engagement", label: "Client Engagement" },
  { id: "talent-health", label: "Talent Health" },
  { id: "issues", label: "Issue Summary" },
  { id: "churn", label: "Churn Analysis" },
] as const;

type TabId = (typeof tabs)[number]["id"];

const TIMESPANS = ["Daily", "Weekly", "Monthly", "Quarterly", "Yearly", "Custom"] as const;

export default function ReportsHub() {
  const [active, setActive] = useState<TabId>("cs-metrics");
  const [timespan, setTimespan] = useState<string>("Monthly");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  return (
    <PageLayout title="Reports">
      {/* Timespan Filter */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px", flexWrap: "wrap" }}>
        <span style={{ fontSize: "13px", fontWeight: 600, color: "#374151" }}>Timespan:</span>
        <div style={{ display: "flex", gap: "4px", background: "#f1f5f9", borderRadius: "6px", padding: "2px" }}>
          {TIMESPANS.map((t) => (
            <button
              key={t}
              onClick={() => setTimespan(t)}
              style={{
                padding: "5px 14px",
                fontSize: "13px",
                fontWeight: timespan === t ? 600 : 400,
                color: timespan === t ? "#1e40af" : "#64748b",
                background: timespan === t ? "#fff" : "transparent",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                boxShadow: timespan === t ? "0 1px 2px rgba(0,0,0,0.05)" : "none",
              }}
            >
              {t}
            </button>
          ))}
        </div>
        {timespan === "Custom" && (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              style={{ padding: "5px 10px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "13px" }}
            />
            <span style={{ fontSize: "13px", color: "#64748b" }}>to</span>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              style={{ padding: "5px 10px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "13px" }}
            />
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: "4px", borderBottom: "2px solid #e5e7eb", marginBottom: "24px", overflowX: "auto" }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            style={{
              padding: "10px 20px",
              fontSize: "14px",
              fontWeight: active === tab.id ? 600 : 400,
              color: active === tab.id ? "#2563eb" : "#6b7280",
              background: "none",
              border: "none",
              borderBottom: active === tab.id ? "2px solid #2563eb" : "2px solid transparent",
              marginBottom: "-2px",
              cursor: "pointer",
              transition: "color 0.15s",
              whiteSpace: "nowrap",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {active === "cs-metrics" && <CsMetricsReport />}
      {active === "mrr" && <MrrReport />}
      {active === "utilization" && <UtilizationReport />}
      {active === "engagement" && <ClientEngagementReport />}
      {active === "talent-health" && <TalentHealthReport />}
      {active === "issues" && <IssueReport />}
      {active === "churn" && <ChurnReport />}
    </PageLayout>
  );
}
