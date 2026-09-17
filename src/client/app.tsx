import { useEffect } from "preact/hooks";
import { AppNav, embedded, reportLocation, type AppNavGroup } from "@clawnify/app/client";
import { MissionContext } from "./context";
import { useMissionState } from "./hooks/use-mission";
import { Sidebar } from "./components/sidebar";
import { Standup } from "./components/standup";
import { PlayBoard } from "./components/play-board";
import { SettingsPanel } from "./components/settings-panel";
import { ErrorBanner } from "./components/error-banner";
import { PLAYS } from "../shared/plays";

export function App() {
  const state = useMissionState();
  const play = PLAYS.find((p) => p.name === state.view);

  useEffect(() => {
    const url = new URL(window.location.href);
    if (state.view === "standup") url.searchParams.delete("view");
    else url.searchParams.set("view", state.view);
    window.history.replaceState(null, "", url);
    reportLocation(url.pathname + url.search);
  }, [state.view]);

  const hostNav: AppNavGroup[] = [
    { items: [
      { id: "standup", label: "Standup", icon: "layout-dashboard", href: "/", home: true },
      ...PLAYS.map((p) => ({
        id: p.name, label: p.label, icon: NAV_ICONS[p.name], href: `/?view=${p.name}`,
        count: state.stats?.plays[p.name]?.total ?? 0,
      })),
    ] },
    { label: "Setup", items: [{ id: "settings", label: "Settings", icon: "settings", href: "/?view=settings" }] },
  ];

  return (
    <MissionContext.Provider value={state}>
      <div class="layout">
        {embedded ? (
          <AppNav title="YC Playbook" icon="target" active={state.view} groups={hostNav}
            onNavigate={(item) => state.setView(item.id)} />
        ) : (
          <Sidebar />
        )}
        <main class="main-content">
          {state.view === "standup" && <Standup />}
          {state.view === "settings" && <SettingsPanel />}
          {play && <PlayBoard play={play} />}
        </main>
      </div>
      <ErrorBanner />
    </MissionContext.Provider>
  );
}

// Dashboard sidebar glyphs (the dashboard draws only its shared icon set).
const NAV_ICONS: Record<string, string> = {
  launches: "zap",
  backlinks: "link",
  prospects: "send",
  creators: "video",
  content_posts: "play",
  communities: "users",
  trends: "activity",
};
