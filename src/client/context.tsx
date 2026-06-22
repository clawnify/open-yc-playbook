import { createContext } from "preact";
import { useContext } from "preact/hooks";
import type { View, Item, Stats, StandupMove, Settings, Metric } from "./types";

export interface MissionContextValue {
  view: View;
  setView: (v: View) => void;
  stats: Stats | null;
  standup: StandupMove[];
  settings: Settings | null;
  metrics: Metric[];
  items: Record<string, Item[]>;
  loading: boolean;
  error: string | null;
  setError: (msg: string | null) => void;

  addItem: (play: string, data: Record<string, unknown>) => Promise<void>;
  updateItem: (play: string, id: number, data: Record<string, unknown>) => Promise<void>;
  deleteItem: (play: string, id: number) => Promise<void>;
  saveSettings: (data: Partial<Settings>) => Promise<void>;
  saveMetric: (data: Partial<Metric>) => Promise<void>;
}

export const MissionContext = createContext<MissionContextValue>(null!);

export function useMission() {
  return useContext(MissionContext);
}
