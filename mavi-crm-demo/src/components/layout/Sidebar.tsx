import { NavLink } from "react-router-dom";

const navItems = [
  { to: "/", label: "Dashboard", icon: "📊" },
  { to: "/companies", label: "Companies", icon: "🏢" },
  { to: "/contracts", label: "Contracts", icon: "📄" },
  { to: "/talent", label: "Talent", icon: "👤" },
  { to: "/issues", label: "Issues", icon: "🎫" },
  { to: "/reports", label: "Reports", icon: "📈" },
  { to: "/email-check-ins", label: "Email Check-Ins", icon: "✉️" },
  { to: "/upsells", label: "Upsells", icon: "💰" },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h1>MAVI CRM</h1>
      </div>
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "sidebar-link--active" : ""}`
            }
          >
            <span className="sidebar-icon">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
