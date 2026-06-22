import { useState } from "preact/hooks";
import { ArrowRight } from "lucide-preact";
import { useMission } from "../context";
import { PLAYS } from "../../shared/plays";
import type { Metric } from "../types";

const PLAY_BY_NAME = Object.fromEntries(PLAYS.map((p) => [p.name, p]));

function currentMonday(): string {
  const d = new Date();
  const day = (d.getDay() + 6) % 7; // days since Monday
  d.setDate(d.getDate() - day);
  return d.toISOString().slice(0, 10);
}

export function Standup() {
  const { stats, standup, setView, metrics, saveMetric } = useMission();
  const goal = stats?.goal ?? 100;
  const customers = stats?.customers ?? 0;
  const pct = Math.min(100, goal ? Math.round((customers / goal) * 100) : 0);

  const week = currentMonday();
  const thisWeek = metrics.find((m) => m.week_start === week);

  return (
    <div class="mc-view">
      <header class="mc-header">
        <h1 class="mc-title">Standup</h1>
        <p class="mc-subtitle">Your highest-leverage moves to the first {goal} customers.</p>
      </header>

      {/* The one number that matters */}
      <div class="mc-hero">
        <div class="mc-hero-number">
          {customers}
          <span class="mc-hero-goal"> / {goal}</span>
        </div>
        <div class="mc-hero-label">customers won</div>
        <div class="mc-progress">
          <div class="mc-progress-fill" style={{ width: `${pct}%` }} />
        </div>
        <div class="mc-hero-meta">
          {thisWeek ? `+${thisWeek.new_customers} this week` : "No number logged this week yet"}
        </div>
      </div>

      {/* Today's moves */}
      <section class="mc-section">
        <h2 class="mc-section-title">Today's moves</h2>
        {standup.length === 0 ? (
          <div class="mc-empty">
            Nothing waiting. Add prospects, launches, backlinks or trends and the next move shows
            up here.
          </div>
        ) : (
          <div class="mc-moves">
            {standup.map((m) => {
              const play = PLAY_BY_NAME[m.play];
              return (
                <button class="mc-move" key={`${m.play}-${m.status}`} onClick={() => setView(m.play)}>
                  <span class="mc-move-dot" style={{ background: play?.color ?? "#6b7280" }} />
                  <span class="mc-move-body">
                    <span class="mc-move-action">{m.action}</span>
                    <span class="mc-move-sub">
                      {m.count} in {play?.label ?? m.play}
                    </span>
                  </span>
                  <span class="mc-move-count">{m.count}</span>
                  <ArrowRight size={15} class="mc-move-arrow" />
                </button>
              );
            })}
          </div>
        )}
      </section>

      <WeeklyNumber week={week} current={thisWeek} onSave={saveMetric} />
    </div>
  );
}

function WeeklyNumber({
  week,
  current,
  onSave,
}: {
  week: string;
  current?: Metric;
  onSave: (data: Partial<Metric>) => Promise<void>;
}) {
  const fields: { key: keyof Metric; label: string }[] = [
    { key: "new_customers", label: "New customers" },
    { key: "leads_added", label: "Leads added" },
    { key: "outreach_sent", label: "Outreach sent" },
    { key: "posts_published", label: "Posts published" },
  ];
  const [form, setForm] = useState<Record<string, string>>(() =>
    Object.fromEntries(fields.map((f) => [f.key, String(current?.[f.key] ?? "")])),
  );
  const [saving, setSaving] = useState(false);

  const submit = () => {
    setSaving(true);
    onSave({
      week_start: week,
      ...Object.fromEntries(fields.map((f) => [f.key, parseInt(form[f.key], 10) || 0])),
    })
      .finally(() => setSaving(false));
  };

  return (
    <section class="mc-section">
      <h2 class="mc-section-title">This week's number — {week}</h2>
      <div class="mc-metric-form">
        {fields.map((f) => (
          <label class="mc-metric-field" key={f.key}>
            <span>{f.label}</span>
            <input
              type="number"
              value={form[f.key]}
              onInput={(e) => setForm({ ...form, [f.key]: (e.target as HTMLInputElement).value })}
            />
          </label>
        ))}
        <button class="btn btn-primary" disabled={saving} onClick={submit}>
          {saving ? "Saving…" : "Save week"}
        </button>
      </div>
    </section>
  );
}
