import { useState } from "react";
import PageLayout from "../layout/PageLayout";
import TemplateList from "./TemplateList";
import ScheduledEmails from "./ScheduledEmails";

const tabs = [
  { id: "templates", label: "Templates" },
  { id: "scheduled", label: "Scheduled Emails" },
] as const;

type TabId = (typeof tabs)[number]["id"];

export default function EmailCheckInsPage() {
  const [active, setActive] = useState<TabId>("templates");

  return (
    <PageLayout title="Email Check-Ins">
      <div style={{ display: "flex", gap: "4px", borderBottom: "2px solid #e5e7eb", marginBottom: "24px" }}>
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
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {active === "templates" && <TemplateList />}
      {active === "scheduled" && <ScheduledEmails />}
    </PageLayout>
  );
}
