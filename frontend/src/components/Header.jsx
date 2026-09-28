import { useHealthCheck } from "../hooks/useHealthCheck";
import { Activity, Wifi, WifiOff } from "lucide-react";

export default function Header() {
  const { health, loading, error } = useHealthCheck();

  return (
    <header className="header">
      <div className="header__left">
        <h1 className="header__title">ResearchLens</h1>
        <span className="header__subtitle">
          AI-Powered Bibliometric &amp; Research Discovery
        </span>
      </div>

      <div className="header__right">
        {/* Backend status indicator */}
        <div className="header__status" title={error || "Backend connected"}>
          {loading ? (
            <Activity size={16} className="header__status-icon header__status-icon--loading" />
          ) : error ? (
            <WifiOff size={16} className="header__status-icon header__status-icon--error" />
          ) : (
            <Wifi size={16} className="header__status-icon header__status-icon--ok" />
          )}
          <span className="header__status-text">
            {loading ? "Connecting…" : error ? "Offline" : `API ${health?.version || ""}`}
          </span>
        </div>
      </div>
    </header>
  );
}
