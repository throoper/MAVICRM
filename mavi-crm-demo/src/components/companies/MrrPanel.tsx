interface MrrPanelProps {
  base: number;
  expected: number;
  actual: number;
}

export default function MrrPanel({ base, expected, actual }: MrrPanelProps) {
  const variance = actual - expected;
  const varianceColor = variance >= 0 ? "#166534" : "#991b1b";
  const varianceBg = variance >= 0 ? "#dcfce7" : "#fee2e2";

  return (
    <div style={{
      background: "#f8fafc",
      border: "1px dashed #94a3b8",
      borderRadius: "8px",
      padding: "16px",
      marginTop: "12px",
    }}>
      <div style={{ fontSize: "11px", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "12px" }}>
        MRR Details
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "12px" }}>
        <div>
          <div style={{ fontSize: "11px", color: "#64748b" }}>Base</div>
          <div style={{ fontSize: "16px", fontWeight: 600 }}>${base.toLocaleString()}</div>
        </div>
        <div>
          <div style={{ fontSize: "11px", color: "#64748b" }}>Expected</div>
          <div style={{ fontSize: "16px", fontWeight: 600 }}>${expected.toLocaleString()}</div>
        </div>
        <div>
          <div style={{ fontSize: "11px", color: "#64748b" }}>Actual</div>
          <div style={{ fontSize: "16px", fontWeight: 600 }}>${actual.toLocaleString()}</div>
        </div>
        <div>
          <div style={{ fontSize: "11px", color: "#64748b" }}>Variance</div>
          <div style={{
            fontSize: "16px",
            fontWeight: 600,
            color: varianceColor,
            background: varianceBg,
            display: "inline-block",
            padding: "0 6px",
            borderRadius: "4px",
          }}>
            {variance >= 0 ? "+" : ""}${variance.toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
}
