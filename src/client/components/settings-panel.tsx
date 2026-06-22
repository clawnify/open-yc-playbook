import { useState, useEffect } from "preact/hooks";
import { useMission } from "../context";

export function SettingsPanel() {
  const { settings, saveSettings } = useMission();
  const [form, setForm] = useState({ product: "", icp: "", competitors: "", goal_customers: "100" });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (settings) {
      setForm({
        product: settings.product ?? "",
        icp: settings.icp ?? "",
        competitors: settings.competitors ?? "",
        goal_customers: String(settings.goal_customers ?? 100),
      });
    }
  }, [settings]);

  const submit = () => {
    setSaving(true);
    setSaved(false);
    saveSettings({
      product: form.product,
      icp: form.icp,
      competitors: form.competitors,
      goal_customers: parseInt(form.goal_customers, 10) || 100,
    })
      .then(() => setSaved(true))
      .finally(() => setSaving(false));
  };

  return (
    <div class="mc-view mc-view-narrow">
      <header class="mc-header">
        <h1 class="mc-title">Settings</h1>
        <p class="mc-subtitle">
          The shared context every play and agent reads before acting. Keep it sharp.
        </p>
      </header>

      <div class="mc-settings">
        <label class="mc-form-field">
          <span>What you sell (one line)</span>
          <input
            placeholder="e.g. AI bookkeeping for Shopify stores"
            value={form.product}
            onInput={(e) => setForm({ ...form, product: (e.target as HTMLInputElement).value })}
          />
        </label>

        <label class="mc-form-field">
          <span>Ideal customer profile</span>
          <textarea
            rows={4}
            placeholder="Who exactly are the 100? Role, company size, the pain they feel today…"
            value={form.icp}
            onInput={(e) => setForm({ ...form, icp: (e.target as HTMLTextAreaElement).value })}
          />
        </label>

        <label class="mc-form-field">
          <span>Competitors (one per line)</span>
          <textarea
            rows={3}
            placeholder={"acme.com\nrival.io"}
            value={form.competitors}
            onInput={(e) => setForm({ ...form, competitors: (e.target as HTMLTextAreaElement).value })}
          />
        </label>

        <label class="mc-form-field">
          <span>Customer goal</span>
          <input
            type="number"
            value={form.goal_customers}
            onInput={(e) => setForm({ ...form, goal_customers: (e.target as HTMLInputElement).value })}
          />
        </label>

        <div class="mc-form-actions">
          <button class="btn btn-primary" disabled={saving} onClick={submit}>
            {saving ? "Saving…" : "Save"}
          </button>
          {saved && <span class="muted">Saved</span>}
        </div>
      </div>
    </div>
  );
}
