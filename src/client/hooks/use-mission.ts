import { useState, useEffect, useCallback } from "preact/hooks";
import { api } from "../api";
import type { MissionContextValue } from "../context";
import type { View, Item, Stats, StandupMove, Settings, Metric } from "../types";

export function useMissionState(): MissionContextValue {
  const [view, setView] = useState<View>("standup");
  const [stats, setStats] = useState<Stats | null>(null);
  const [standup, setStandup] = useState<StandupMove[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [items, setItems] = useState<Record<string, Item[]>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fail = useCallback((e: unknown) => setError((e as Error).message), []);

  const refreshOverview = useCallback(async () => {
    try {
      const [s, su] = await Promise.all([
        api<Stats>("GET", "/api/stats"),
        api<{ moves: StandupMove[] }>("GET", "/api/standup"),
      ]);
      setStats(s);
      setStandup(su.moves);
    } catch (e) {
      fail(e);
    }
  }, [fail]);

  const loadPlay = useCallback(
    async (name: string) => {
      setLoading(true);
      try {
        const rows = await api<Item[]>("GET", `/api/${name}`);
        setItems((m) => ({ ...m, [name]: rows }));
      } catch (e) {
        fail(e);
      } finally {
        setLoading(false);
      }
    },
    [fail],
  );

  // Initial load: settings, metrics, and the overview (stats + standup).
  useEffect(() => {
    api<Settings>("GET", "/api/settings").then(setSettings).catch(fail);
    api<Metric[]>("GET", "/api/metrics").then(setMetrics).catch(fail);
    refreshOverview();
  }, [fail, refreshOverview]);

  // Load a play's items the first time (and whenever) it becomes active.
  useEffect(() => {
    if (view !== "standup" && view !== "settings") loadPlay(view);
  }, [view, loadPlay]);

  const addItem = useCallback(
    async (play: string, data: Record<string, unknown>) => {
      try {
        await api<Item>("POST", `/api/${play}`, data);
        await loadPlay(play);
        refreshOverview();
      } catch (e) {
        fail(e);
        throw e;
      }
    },
    [loadPlay, refreshOverview, fail],
  );

  const updateItem = useCallback(
    async (play: string, id: number, data: Record<string, unknown>) => {
      // Optimistic: reflect the change locally before the round-trip.
      setItems((m) => ({
        ...m,
        [play]: (m[play] ?? []).map((it) => (it.id === id ? { ...it, ...data } : it)),
      }));
      try {
        await api<Item>("PATCH", `/api/${play}/${id}`, data);
        refreshOverview();
      } catch (e) {
        fail(e);
        loadPlay(play); // revert from server
      }
    },
    [refreshOverview, loadPlay, fail],
  );

  const deleteItem = useCallback(
    async (play: string, id: number) => {
      setItems((m) => ({ ...m, [play]: (m[play] ?? []).filter((it) => it.id !== id) }));
      try {
        await api("DELETE", `/api/${play}/${id}`);
        refreshOverview();
      } catch (e) {
        fail(e);
        loadPlay(play);
      }
    },
    [refreshOverview, loadPlay, fail],
  );

  const saveSettings = useCallback(
    async (data: Partial<Settings>) => {
      try {
        const next = await api<Settings>("PUT", "/api/settings", data);
        setSettings(next);
        refreshOverview();
      } catch (e) {
        fail(e);
        throw e;
      }
    },
    [refreshOverview, fail],
  );

  const saveMetric = useCallback(
    async (data: Partial<Metric>) => {
      try {
        await api<Metric>("POST", "/api/metrics", data);
        setMetrics(await api<Metric[]>("GET", "/api/metrics"));
        refreshOverview();
      } catch (e) {
        fail(e);
        throw e;
      }
    },
    [refreshOverview, fail],
  );

  return {
    view,
    setView,
    stats,
    standup,
    settings,
    metrics,
    items,
    loading,
    error,
    setError,
    addItem,
    updateItem,
    deleteItem,
    saveSettings,
    saveMetric,
  };
}
