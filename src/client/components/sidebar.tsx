import { useMission } from "../context";
import { Icon } from "../icons";
import { PLAYS } from "../../shared/plays";

export function Sidebar() {
  const { view, setView, stats } = useMission();

  return (
    <aside class="sidebar">
      <div class="sidebar-brand">
        <div class="sidebar-brand-icon">
          <Icon name="Target" size={16} />
        </div>
        YC Playbook
      </div>

      <nav class="sidebar-nav">
        <div class="sidebar-section-title">Overview</div>
        <button
          class={`sidebar-item ${view === "standup" ? "active" : ""}`}
          onClick={() => setView("standup")}
        >
          <span class="sidebar-entity-icon" style={{ background: "#111827" }}>
            <Icon name="LayoutDashboard" size={12} />
          </span>
          Standup
        </button>

        <div class="sidebar-section-title">The 7 plays</div>
        {PLAYS.map((play) => (
          <button
            key={play.name}
            class={`sidebar-item ${view === play.name ? "active" : ""}`}
            onClick={() => setView(play.name)}
            title={play.title}
          >
            <span class="sidebar-entity-icon" style={{ background: play.color }}>
              <Icon name={play.icon} size={12} />
            </span>
            {play.label}
            <span class="sidebar-badge">{stats?.plays[play.name]?.total ?? 0}</span>
          </button>
        ))}

        <div class="sidebar-section-title">Setup</div>
        <button
          class={`sidebar-item ${view === "settings" ? "active" : ""}`}
          onClick={() => setView("settings")}
        >
          <span class="sidebar-entity-icon" style={{ background: "#6b7280" }}>
            <Icon name="Settings" size={12} />
          </span>
          Settings
        </button>
      </nav>
    </aside>
  );
}
