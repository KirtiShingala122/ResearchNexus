import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Users,
  Tags,
  Network,
  TrendingUp,
  Search,
  Settings,
  FlaskConical,
} from "lucide-react";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/papers", icon: FileText, label: "Papers" },
  { to: "/authors", icon: Users, label: "Authors" },
  { to: "/topics", icon: Tags, label: "Topics" },
  { to: "/networks", icon: Network, label: "Networks" },
  { to: "/trends", icon: TrendingUp, label: "Trends" },
  { to: "/search", icon: Search, label: "Semantic Search" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

export default function Sidebar({ collapsed, onToggle }) {
  return (
    <aside
      className={`sidebar ${collapsed ? "sidebar--collapsed" : ""}`}
      aria-label="Main navigation"
    >
      {/* Brand */}
      <div className="sidebar__brand">
        <FlaskConical className="sidebar__brand-icon" size={28} />
        {!collapsed && <span className="sidebar__brand-text">ResearchNexus</span>}
      </div>

      {/* Navigation */}
      <nav className="sidebar__nav">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `sidebar__link ${isActive ? "sidebar__link--active" : ""}`
            }
            title={label}
          >
            <Icon size={20} />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Collapse toggle */}
      <button
        className="sidebar__toggle"
        onClick={onToggle}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? "»" : "«"}
      </button>
    </aside>
  );
}
