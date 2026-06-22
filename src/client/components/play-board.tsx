import { useState, useMemo } from "preact/hooks";
import { Plus, ExternalLink, Trash2, Pencil } from "lucide-preact";
import { useMission } from "../context";
import { Icon } from "../icons";
import { statusesFor, primaryField, type Play, type PlayConfig, type Field } from "../../shared/plays";
import type { Item } from "../types";

export function PlayBoard({ play }: { play: PlayConfig }) {
  const { items, loading, addItem, updateItem, deleteItem } = useMission();
  const [search, setSearch] = useState("");
  const rows = items[play.name] ?? [];
  const statuses = statusesFor(play);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    const cols = play.searchable;
    return rows.filter((r) => cols.some((c) => String(r[c] ?? "").toLowerCase().includes(q)));
  }, [rows, search, play.searchable]);

  const grouped = useMemo(() => {
    const map: Record<string, Item[]> = {};
    for (const s of statuses) map[s] = [];
    for (const r of filtered) (map[r.status] ?? (map[r.status] = [])).push(r);
    return map;
  }, [filtered, statuses]);

  return (
    <div class="mc-view">
      <header class="mc-header">
        <h1 class="mc-title">
          <span class="mc-title-icon" style={{ background: play.color }}>
            <Icon name={play.icon} size={14} />
          </span>
          {play.label}
          <span class="mc-play-tag">Play {play.n}</span>
        </h1>
        <p class="mc-subtitle">{play.blurb}</p>
      </header>

      <div class="toolbar">
        <div class="toolbar-left">
          <div class="search-box">
            <input
              class="search-input"
              placeholder={`Search ${play.label.toLowerCase()}…`}
              value={search}
              onInput={(e) => setSearch((e.target as HTMLInputElement).value)}
            />
          </div>
        </div>
      </div>

      {loading && rows.length === 0 ? (
        <div class="loading-text">Loading…</div>
      ) : (
        <div class="deals-board">
          {statuses.map((status) => (
            <Column
              key={status}
              play={play}
              status={status}
              items={grouped[status] ?? []}
              onAdd={(data) => addItem(play.name, { ...data, status })}
              onMove={(id, s) => updateItem(play.name, id, { status: s })}
              onEdit={(id, data) => updateItem(play.name, id, data)}
              onDelete={(id) => deleteItem(play.name, id)}
              statuses={statuses}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function Column({
  play,
  status,
  items,
  statuses,
  onAdd,
  onMove,
  onEdit,
  onDelete,
}: {
  play: Play;
  status: string;
  items: Item[];
  statuses: string[];
  onAdd: (data: Record<string, unknown>) => Promise<void> | void;
  onMove: (id: number, status: string) => void;
  onEdit: (id: number, data: Record<string, unknown>) => void;
  onDelete: (id: number) => void;
}) {
  const [adding, setAdding] = useState(false);

  return (
    <div class="deals-column">
      <div class="deals-column-header">
        <span class="deals-stage-dot" style={{ background: play.color }} />
        <span class="deals-stage-label">{status}</span>
        <span class="deals-stage-count">{items.length}</span>
        <button class="deals-add-btn" onClick={() => setAdding(true)} aria-label={`Add to ${status}`}>
          <Plus size={14} />
        </button>
      </div>

      {adding && (
        <ItemForm
          play={play}
          onSubmit={async (data) => {
            await onAdd(data);
            setAdding(false);
          }}
          onCancel={() => setAdding(false)}
        />
      )}

      <div class="deals-column-cards">
        {items.map((item) => (
          <Card
            key={item.id}
            play={play}
            item={item}
            statuses={statuses}
            onMove={onMove}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
}

function Card({
  play,
  item,
  statuses,
  onMove,
  onEdit,
  onDelete,
}: {
  play: Play;
  item: Item;
  statuses: string[];
  onMove: (id: number, status: string) => void;
  onEdit: (id: number, data: Record<string, unknown>) => void;
  onDelete: (id: number) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const primary = primaryField(play);

  if (editing) {
    return (
      <div class="deal-card deal-card-editing">
        <ItemForm
          play={play}
          initial={item}
          onSubmit={(data) => {
            onEdit(item.id, data);
            setEditing(false);
          }}
          onCancel={() => setEditing(false)}
        />
      </div>
    );
  }

  const meta = play.fields.filter(
    (f) => f.type !== "status" && f.name !== primary.name && f.name !== "notes" && String(item[f.name] ?? "").trim(),
  );

  return (
    <div class="deal-card">
      <div class="deal-card-name">{String(item[primary.name] ?? "—")}</div>

      {meta.length > 0 && (
        <div class="mc-card-meta">
          {meta.map((f) => (
            <FieldChip key={f.name} field={f} value={item[f.name]} />
          ))}
        </div>
      )}

      {String(item.notes ?? "").trim() && <div class="mc-card-notes">{String(item.notes)}</div>}

      <select
        class="deal-card-move-select"
        value={item.status}
        onChange={(e) => onMove(item.id, (e.target as HTMLSelectElement).value)}
      >
        {statuses.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>

      <div class="deal-card-actions">
        <button class="btn btn-sm" onClick={() => setEditing(true)} aria-label="Edit">
          <Pencil size={13} />
        </button>
        {confirming ? (
          <span class="confirm-bar">
            <button class="btn btn-sm btn-danger" onClick={() => onDelete(item.id)}>
              Delete
            </button>
            <button class="btn btn-sm" onClick={() => setConfirming(false)}>
              Cancel
            </button>
          </span>
        ) : (
          <button class="btn btn-sm" onClick={() => setConfirming(true)} aria-label="Delete">
            <Trash2 size={13} />
          </button>
        )}
      </div>
    </div>
  );
}

function FieldChip({ field, value }: { field: Field; value: unknown }) {
  const v = String(value ?? "");
  if (field.type === "url") {
    return (
      <a class="mc-chip mc-chip-link" href={v} target="_blank" rel="noreferrer">
        <ExternalLink size={11} /> {field.label}
      </a>
    );
  }
  if (field.type === "select") return <span class="pill">{v}</span>;
  return (
    <span class="mc-chip">
      {field.label}: {v}
    </span>
  );
}

function ItemForm({
  play,
  initial,
  onSubmit,
  onCancel,
}: {
  play: Play;
  initial?: Item;
  onSubmit: (data: Record<string, unknown>) => Promise<void> | void;
  onCancel: () => void;
}) {
  const editable = play.fields.filter((f) => f.type !== "status");
  const [form, setForm] = useState<Record<string, string>>(() =>
    Object.fromEntries(editable.map((f) => [f.name, String(initial?.[f.name] ?? "")])),
  );
  const [busy, setBusy] = useState(false);

  const set = (name: string, value: string) => setForm((f) => ({ ...f, [name]: value }));

  const submit = async () => {
    const primary = primaryField(play);
    if (!String(form[primary.name] ?? "").trim()) return;
    setBusy(true);
    try {
      await onSubmit(form);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div class="mc-item-form">
      {editable.map((f) => (
        <label class="mc-form-field" key={f.name}>
          <span>{f.label}</span>
          {f.type === "textarea" ? (
            <textarea
              rows={2}
              placeholder={f.placeholder}
              value={form[f.name]}
              onInput={(e) => set(f.name, (e.target as HTMLTextAreaElement).value)}
            />
          ) : f.type === "select" ? (
            <select value={form[f.name]} onChange={(e) => set(f.name, (e.target as HTMLSelectElement).value)}>
              {f.options?.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          ) : (
            <input
              type={f.type === "number" ? "number" : "text"}
              placeholder={f.placeholder}
              value={form[f.name]}
              onInput={(e) => set(f.name, (e.target as HTMLInputElement).value)}
            />
          )}
        </label>
      ))}
      <div class="mc-form-actions">
        <button class="btn btn-primary btn-sm" disabled={busy} onClick={submit}>
          {initial ? "Save" : "Add"}
        </button>
        <button class="btn btn-sm" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}
