interface StatusBadgeProps {
  label: string;
  variant: "healthy" | "attention" | "at-risk" | "open" | "in-progress" | "monitoring" | "resolved" | "low" | "medium" | "high" | "critical" | "identified" | "proposed" | "accepted" | "closed-won" | "closed-lost";
}

const variantStyles: Record<StatusBadgeProps["variant"], { bg: string; color: string }> = {
  healthy: { bg: "#dcfce7", color: "#166534" },
  attention: { bg: "#fef3c7", color: "#92400e" },
  "at-risk": { bg: "#fee2e2", color: "#991b1b" },
  open: { bg: "#dbeafe", color: "#1e40af" },
  "in-progress": { bg: "#fef3c7", color: "#92400e" },
  monitoring: { bg: "#e0e7ff", color: "#3730a3" },
  resolved: { bg: "#dcfce7", color: "#166534" },
  low: { bg: "#f0fdf4", color: "#166534" },
  medium: { bg: "#fef3c7", color: "#92400e" },
  high: { bg: "#fed7aa", color: "#9a3412" },
  critical: { bg: "#fee2e2", color: "#991b1b" },
  identified: { bg: "#fef3c7", color: "#92400e" },
  proposed: { bg: "#dbeafe", color: "#1e40af" },
  accepted: { bg: "#dcfce7", color: "#166534" },
  "closed-won": { bg: "#dcfce7", color: "#166534" },
  "closed-lost": { bg: "#fee2e2", color: "#991b1b" },
};

export default function StatusBadge({ label, variant }: StatusBadgeProps) {
  const style = variantStyles[variant];
  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 10px",
        borderRadius: "12px",
        fontSize: "12px",
        fontWeight: 600,
        backgroundColor: style.bg,
        color: style.color,
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  );
}

export function healthVariant(health: string): StatusBadgeProps["variant"] {
  switch (health) {
    case "Healthy": return "healthy";
    case "Needs Attention": return "attention";
    case "At Risk": return "at-risk";
    default: return "healthy";
  }
}
