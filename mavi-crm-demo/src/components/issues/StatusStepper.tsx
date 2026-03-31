import type { IssueStatus } from "../../types";

const STEPS: IssueStatus[] = ["Open", "In Progress", "Monitoring Solution", "Resolved"];

interface StatusStepperProps {
  current: IssueStatus;
  onChange: (status: IssueStatus) => void;
}

export default function StatusStepper({ current, onChange }: StatusStepperProps) {
  const currentIdx = STEPS.indexOf(current);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0", marginBottom: "4px" }}>
      {STEPS.map((step, i) => {
        const isActive = i <= currentIdx;
        const isCurrent = i === currentIdx;
        return (
          <div key={step} style={{ display: "flex", alignItems: "center", flex: i < STEPS.length - 1 ? 1 : undefined }}>
            <button
              onClick={() => onChange(step)}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "4px",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "4px 8px",
              }}
            >
              <div
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "12px",
                  fontWeight: 700,
                  background: isActive ? "#2563eb" : "#e5e7eb",
                  color: isActive ? "#fff" : "#9ca3af",
                  border: isCurrent ? "2px solid #1d4ed8" : "2px solid transparent",
                  transition: "all 0.15s",
                }}
              >
                {i + 1}
              </div>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: isCurrent ? 600 : 400,
                  color: isActive ? "#1e40af" : "#9ca3af",
                  whiteSpace: "nowrap",
                }}
              >
                {step}
              </span>
            </button>
            {i < STEPS.length - 1 && (
              <div
                style={{
                  flex: 1,
                  height: "2px",
                  background: i < currentIdx ? "#2563eb" : "#e5e7eb",
                  marginBottom: "20px",
                  minWidth: "20px",
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
