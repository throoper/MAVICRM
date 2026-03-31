import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";
import PageLayout from "../layout/PageLayout";
import StatusBadge, { healthVariant } from "../shared/StatusBadge";

type SortKey = "name" | "industry" | "health" | "acv" | "contracts" | "issues";
type SortDir = "asc" | "desc";

const HEALTH_ORDER: Record<string, number> = { "Healthy": 0, "Needs Attention": 1, "At Risk": 2 };

export default function CompanyList() {
  const { companies, contracts, issues } = useAppContext();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [healthFilter, setHealthFilter] = useState<string>("All");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "name" ? "asc" : "desc");
    }
  };

  const arrow = (key: SortKey) => (sortKey === key ? (sortDir === "asc" ? " \u25B2" : " \u25BC") : "");

  // Pre-compute derived values per company
  const enriched = useMemo(() => {
    return companies.map((company) => {
      const companyContracts = contracts.filter((c) => c.companyId === company.id);
      const acv = companyContracts.reduce((sum, c) => sum + c.mrr.expected, 0) * 12;
      const contractCount = companyContracts.length;
      const openIssueCount = issues.filter((i) => i.companyId === company.id && i.status !== "Resolved").length;
      return { company, acv, contractCount, openIssueCount };
    });
  }, [companies, contracts, issues]);

  const filtered = enriched
    .filter(({ company }) => {
      const matchesSearch =
        company.name.toLowerCase().includes(search.toLowerCase()) ||
        company.industry.toLowerCase().includes(search.toLowerCase());
      const matchesHealth = healthFilter === "All" || company.accountHealth === healthFilter;
      return matchesSearch && matchesHealth;
    })
    .sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "name":
          cmp = a.company.name.localeCompare(b.company.name);
          break;
        case "industry":
          cmp = a.company.industry.localeCompare(b.company.industry);
          break;
        case "health":
          cmp = (HEALTH_ORDER[a.company.accountHealth] ?? 0) - (HEALTH_ORDER[b.company.accountHealth] ?? 0);
          break;
        case "acv":
          cmp = a.acv - b.acv;
          break;
        case "contracts":
          cmp = a.contractCount - b.contractCount;
          break;
        case "issues":
          cmp = a.openIssueCount - b.openIssueCount;
          break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

  return (
    <PageLayout title="Companies">
      <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Search by name or industry..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: 1,
            padding: "8px 14px",
            border: "1px solid #d1d5db",
            borderRadius: "6px",
            fontSize: "14px",
            outline: "none",
          }}
        />
        <select
          value={healthFilter}
          onChange={(e) => setHealthFilter(e.target.value)}
          style={{
            padding: "8px 14px",
            border: "1px solid #d1d5db",
            borderRadius: "6px",
            fontSize: "14px",
            background: "#fff",
            cursor: "pointer",
          }}
        >
          <option value="All">All Health</option>
          <option value="Healthy">Healthy</option>
          <option value="Needs Attention">Needs Attention</option>
          <option value="At Risk">At Risk</option>
        </select>
      </div>

      <div style={{ background: "#fff", borderRadius: "8px", border: "1px solid #e5e7eb", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
              <th style={sortableThStyle} onClick={() => handleSort("name")}>Company Name{arrow("name")}</th>
              <th style={sortableThStyle} onClick={() => handleSort("industry")}>Industry{arrow("industry")}</th>
              <th style={sortableThStyle} onClick={() => handleSort("health")}>Health{arrow("health")}</th>
              <th style={{ ...sortableThStyle, textAlign: "right" }} onClick={() => handleSort("acv")}>ACV{arrow("acv")}</th>
              <th style={{ ...sortableThStyle, textAlign: "center" }} onClick={() => handleSort("contracts")}>Contracts{arrow("contracts")}</th>
              <th style={{ ...sortableThStyle, textAlign: "center" }} onClick={() => handleSort("issues")}>Open Issues{arrow("issues")}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(({ company, acv, contractCount, openIssueCount }) => (
              <tr
                key={company.id}
                onClick={() => navigate(`/companies/${company.id}`)}
                style={{ borderBottom: "1px solid #e5e7eb", cursor: "pointer" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f4ff")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <td style={tdStyle}>
                  <span style={{ fontWeight: 600, color: "#1e40af" }}>{company.name}</span>
                </td>
                <td style={tdStyle}>{company.industry}</td>
                <td style={tdStyle}>
                  <StatusBadge label={company.accountHealth} variant={healthVariant(company.accountHealth)} />
                </td>
                <td style={{ ...tdStyle, textAlign: "right", fontWeight: 600 }}>${acv.toLocaleString()}</td>
                <td style={{ ...tdStyle, textAlign: "center" }}>{contractCount}</td>
                <td style={{ ...tdStyle, textAlign: "center" }}>
                  {openIssueCount > 0 ? (
                    <span style={{ color: "#dc2626", fontWeight: 600 }}>{openIssueCount}</span>
                  ) : (
                    <span style={{ color: "#6b7280" }}>0</span>
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: "24px", textAlign: "center", color: "#9ca3af" }}>
                  No companies match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </PageLayout>
  );
}

const thBase: React.CSSProperties = {
  textAlign: "left",
  padding: "10px 16px",
  fontSize: "12px",
  fontWeight: 600,
  color: "#6b7280",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
};

const thStyle: React.CSSProperties = { ...thBase };

const sortableThStyle: React.CSSProperties = {
  ...thBase,
  cursor: "pointer",
  userSelect: "none",
};

const tdStyle: React.CSSProperties = {
  padding: "12px 16px",
  fontSize: "14px",
};
