import {
  LayoutDashboard,
  FileText,
  Users,
  Tags,
  Network,
  TrendingUp,
  Search,
  Database,
  Activity,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useHealthCheck } from "../hooks/useHealthCheck";

const modules = [
  {
    to: "/papers",
    icon: FileText,
    label: "Papers",
    desc: "Browse and search collected scientific papers",
    color: "var(--color-papers)",
  },
  {
    to: "/authors",
    icon: Users,
    label: "Authors",
    desc: "Explore author profiles and collaboration patterns",
    color: "var(--color-authors)",
  },
  {
    to: "/topics",
    icon: Tags,
    label: "Topics",
    desc: "Discover research topics via keyword and topic modeling",
    color: "var(--color-topics)",
  },
  {
    to: "/networks",
    icon: Network,
    label: "Networks",
    desc: "Visualize co-authorship and citation networks",
    color: "var(--color-networks)",
  },
  {
    to: "/trends",
    icon: TrendingUp,
    label: "Trends",
    desc: "Analyze temporal publication and citation trends",
    color: "var(--color-trends)",
  },
  {
    to: "/search",
    icon: Search,
    label: "Semantic Search",
    desc: "Find papers using natural language queries",
    color: "var(--color-search)",
  },
];

export default function DashboardPage() {
  const { health, loading, error } = useHealthCheck();

  return (
    <div className="dashboard">
      {/* Hero section */}
      <section className="dashboard__hero">
        <div className="dashboard__hero-content">
          <LayoutDashboard size={36} className="dashboard__hero-icon" />
          <div>
            <h2 className="dashboard__hero-title">Welcome to ResearchNexus</h2>
            <p className="dashboard__hero-desc">
              AI-powered bibliometric analysis and research discovery platform.
              Collect scientific papers, analyze citation networks, and uncover
              research trends.
            </p>
          </div>
        </div>

        {/* System status */}
        <div className="dashboard__status-row">
          <div className="dashboard__status-card">
            <Activity size={18} />
            <span>
              Backend:{" "}
              {loading
                ? "Connecting…"
                : error
                ? "Offline"
                : health?.status === "ok"
                ? "Online"
                : "Unknown"}
            </span>
            <span
              className={`dashboard__dot ${
                loading
                  ? "dashboard__dot--loading"
                  : error
                  ? "dashboard__dot--error"
                  : "dashboard__dot--ok"
              }`}
            />
          </div>
          <div className="dashboard__status-card">
            <Database size={18} />
            <span>Data Collection: Not started</span>
          </div>
        </div>
      </section>

      {/* Module grid */}
      <section className="dashboard__grid">
        {modules.map(({ to, icon: Icon, label, desc, color }) => (
          <Link key={to} to={to} className="dashboard__card" style={{ "--card-accent": color }}>
            <div className="dashboard__card-icon-wrap">
              <Icon size={28} />
            </div>
            <h3 className="dashboard__card-title">{label}</h3>
            <p className="dashboard__card-desc">{desc}</p>
            <span className="dashboard__card-arrow">→</span>
          </Link>
        ))}
      </section>
    </div>
  );
}
