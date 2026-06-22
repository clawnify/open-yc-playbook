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

  return (
    <MissionContext.Provider value={state}>
      <div class="layout">
        <Sidebar />
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
