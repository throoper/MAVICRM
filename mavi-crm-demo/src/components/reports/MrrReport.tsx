import { useMemo } from "react";
import { useAppContext } from "../../context/AppContext";
import ExportButton from "../shared/ExportButton";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

interface CompanyRow {
  companyId: string;
  companyName: string;
  contractCount: number;
  baseMrr: number;
  expectedMrr: number;
  monthlyActual: (number | null)[];
}

export default function MrrReport() {
  const { contracts, companies } = useAppContext();

  const rows: CompanyRow[] = useMemo(() => {
    const map = new Map<string, CompanyRow>();
    for (const c of contracts) {
      let row = map.get(c.companyId);
      if (!row) {
        row = {
          companyId: c.companyId,
          companyName: c.companyName,
          contractCount: 0,
          baseMrr: 0,
          expectedMrr: 0,
          monthlyActual: Array(12).fill(null) as (number | null)[],
        };
        map.set(c.companyId, row);
      }
      row.contractCount += 1;
      row.baseMrr += c.mrr.base;
      row.expectedMrr += c.mrr.expected;
      for (let i = 0; i < 12; i++) {
        const val = c.mrr.monthlyActual[i];
        if (val !== null && val !== undefined) {
          row.monthlyActual[i] = (row.monthlyActual[i] ?? 0) + val;
        }
      }
    }
    // Sort by company name
    return Array.from(map.values()).sort((a, b) => a.companyName.localeCompare(b.companyName));
  }, [contracts]);

  // Totals
  const totals = useMemo(() => {
    const t = { baseMrr: 0, expectedMrr: 0, contractCount: 0, monthlyActual: Array(12).fill(null) as (number | null)[] };
    for (const r of rows) {
      t.baseMrr += r.baseMrr;
      t.expectedMrr += r.expectedMrr;
      t.contractCount += r.contractCount;
      for (let i = 0; i < 12; i++) {
        if (r.monthlyActual[i] !== null) {
          t.monthlyActual[i] = (t.monthlyActual[i] ?? 0) + r.monthlyActual[i]!;
        }
      }
    }
    return t;
  }, [rows]);

  // CSV export
  const csvHeaders = ["Company", "Contracts", "Base MRR", "Expected MRR", ...MONTHS.map((m) => `${m} Actual`)];
  const csvRows = rows.map((r) => [
    r.companyName,
    r.contractCount,
    r.baseMrr,
    r.expectedMrr,
    ...r.monthlyActual.map((v) => v ?? ""),
  ]);
  csvRows.push(["TOTAL", totals.contractCount, totals.baseMrr, totals.expectedMrr, ...totals.monthlyActual.map((v) => v ?? "")]);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <p style={{ fontSize: "14px", color: "#64748b" }}>
          MRR comparison by company with monthly actuals.
        </p>
        <ExportButton filename="mrr-actual-vs-expected" headers={csvHeaders} rows={csvRows} />
      </div>

      <div style={{ background: "#fff", borderRadius: "8px", border: "1px solid #e5e7eb", overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "1200px" }}>
          <thead>
            <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
              <th style={thStyle}>Company</th>
              <th style={{ ...thStyle, textAlign: "center" }}>Contracts</th>
              <th style={{ ...thStyle, textAlign: "right" }}>Base MRR</th>
              <th style={{ ...thStyle, textAlign: "right" }}>Expected MRR</th>
              {MONTHS.map((m) => (
                <th key={m} style={{ ...thStyle, textAlign: "right" }}>{m}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.companyId} style={{ borderBottom: "1px solid #e5e7eb" }}>
                <td style={tdStyle}>{row.companyName}</td>
                <td style={{ ...tdStyle, textAlign: "center" }}>{row.contractCount}</td>
                <td style={{ ...tdStyle, textAlign: "right" }}>${row.baseMrr.toLocaleString()}</td>
                <td style={{ ...tdStyle, textAlign: "right" }}>${row.expectedMrr.toLocaleString()}</td>
                {row.monthlyActual.map((val, i) => (
                  <td key={i} style={{ ...tdStyle, textAlign: "right" }}>
                    {val !== null ? (
                      <MrrCell actual={val} expected={row.expectedMrr} />
                    ) : (
                      <span style={{ color: "#d1d5db" }}>—</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
            {/* Totals row */}
            <tr style={{ background: "#f0f4ff", borderTop: "2px solid #2563eb" }}>
              <td style={{ ...tdStyle, fontWeight: 700 }}>TOTAL</td>
              <td style={{ ...tdStyle, textAlign: "center", fontWeight: 700 }}>{totals.contractCount}</td>
              <td style={{ ...tdStyle, textAlign: "right", fontWeight: 700 }}>${totals.baseMrr.toLocaleString()}</td>
              <td style={{ ...tdStyle, textAlign: "right", fontWeight: 700 }}>${totals.expectedMrr.toLocaleString()}</td>
              {totals.monthlyActual.map((val, i) => (
                <td key={i} style={{ ...tdStyle, textAlign: "right", fontWeight: 700 }}>
                  {val !== null ? (
                    <MrrCell actual={val} expected={totals.expectedMrr} bold />
                  ) : (
                    <span style={{ color: "#d1d5db" }}>—</span>
                  )}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MrrCell({ actual, expected, bold }: { actual: number; expected: number; bold?: boolean }) {
  const variance = actual - expected;
  const isPositive = variance >= 0;
  return (
    <div>
      <div style={{ fontWeight: bold ? 700 : 600 }}>${actual.toLocaleString()}</div>
      <div style={{ fontSize: "11px", fontWeight: 500, color: isPositive ? "#166534" : "#991b1b", marginTop: "1px" }}>
        {isPositive ? "+" : ""}${variance.toLocaleString()}
      </div>
    </div>
  );
}

const thStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "10px 12px",
  fontSize: "11px",
  fontWeight: 600,
  color: "#6b7280",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
  whiteSpace: "nowrap",
};

const tdStyle: React.CSSProperties = {
  padding: "10px 12px",
  fontSize: "13px",
};
