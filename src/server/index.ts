import { createApp } from "@clawnify/app";
import { query, get, run } from "./db";
import { PLAYS, type Resource, type Col } from "../shared/plays";

type Env = { Bindings: { DB: D1Database } };

// createApp bakes in the standard skeleton: OpenAPIHono construction, the
// per-request D1/Storage init middleware, and API discovery (GET
// /api/openapi.json + GET /llms.txt from the live routes).
const app = createApp<Env>({
  title: "YC Playbook",
  version: "1.0.0",
  description:
    "Get your first 100 customers with the YC growth playbook — seven plays over one shared pipeline with a single weekly growth number.",
});

// Surface real error messages instead of Hono's opaque "Internal Server Error"
// so the dashboard toast (and logs) say what actually failed.
app.onError((err, c) => {
  console.error("[api error]", err);
  const message = err instanceof Error ? err.message : String(err);
  return c.json({ error: message }, 500);
});

let seeded = false;
async function ensureSeed() {
  if (seeded) return;
  await run(`INSERT OR IGNORE INTO settings (id) VALUES (1)`);
  seeded = true;
}

// DB init is baked into createApp; this middleware only handles the one-time seed.
app.use("*", async (c, next) => {
  await ensureSeed();
  await next();
});

// ── Generic play resource (all 7 plays share this shape) ─────────────
// Every play is a list of items moving through a status pipeline, so list /
// create / update / delete are identical bar the column set. One implementation,
// configured by PLAYS.

function coerce(col: Col, v: unknown): string | number {
  if (col.kind === "int") return Math.trunc(Number(v) || 0);
  if (col.kind === "real") return Number(v) || 0;
  return v == null ? "" : String(v);
}

const SORTABLE_META = ["id", "created_at", "updated_at", "status"];

function registerResource(r: Resource) {
  const table = r.name;
  const writable = r.cols.map((c) => c.name);

  // LIST — ?status= filter, ?search= over searchable cols, ?sort=&order=
  app.get(`/api/${table}`, async (c) => {
    const { status, search, sort, order } = c.req.query();
    const where: string[] = [];
    const params: (string | number)[] = [];
    if (status) {
      where.push("status = ?");
      params.push(status);
    }
    if (search && r.searchable.length) {
      where.push("(" + r.searchable.map((s) => `${s} LIKE ?`).join(" OR ") + ")");
      for (const _ of r.searchable) params.push(`%${search}%`);
    }
    const sortCol =
      sort && (writable.includes(sort) || SORTABLE_META.includes(sort)) ? sort : r.defaultSort;
    const dir = order === "asc" ? "ASC" : "DESC";
    const sql =
      `SELECT * FROM ${table}` +
      (where.length ? ` WHERE ${where.join(" AND ")}` : "") +
      ` ORDER BY ${sortCol} ${dir} LIMIT 500`;
    return c.json(await query<Record<string, unknown>>(sql, params));
  });

  // CREATE
  app.post(`/api/${table}`, async (c) => {
    const b = await c.req.json<Record<string, unknown>>();
    for (const req of r.required) {
      if (!String(b[req] ?? "").trim()) return c.json({ error: `${req} is required` }, 400);
    }
    const cols = r.cols.filter((col) => b[col.name] !== undefined);
    if (!cols.length) return c.json({ error: "No fields to insert" }, 400);
    const res = await run(
      `INSERT INTO ${table} (${cols.map((c) => c.name).join(", ")}) VALUES (${cols.map(() => "?").join(", ")})`,
      cols.map((col) => coerce(col, b[col.name])),
    );
    const row = await get<Record<string, unknown>>(`SELECT * FROM ${table} WHERE id = ?`, [
      res.lastInsertRowid,
    ]);
    return c.json(row, 201);
  });

  // UPDATE (partial)
  app.patch(`/api/${table}/:id`, async (c) => {
    const id = Number(c.req.param("id"));
    const b = await c.req.json<Record<string, unknown>>();
    const cols = r.cols.filter((col) => b[col.name] !== undefined);
    if (!cols.length) return c.json({ error: "No fields to update" }, 400);
    await run(
      `UPDATE ${table} SET ${cols.map((c) => `${c.name} = ?`).join(", ")}, updated_at = datetime('now') WHERE id = ?`,
      [...cols.map((col) => coerce(col, b[col.name])), id],
    );
    const row = await get<Record<string, unknown>>(`SELECT * FROM ${table} WHERE id = ?`, [id]);
    if (!row) return c.json({ error: "Not found" }, 404);
    return c.json(row);
  });

  // DELETE
  app.delete(`/api/${table}/:id`, async (c) => {
    await run(`DELETE FROM ${table} WHERE id = ?`, [Number(c.req.param("id"))]);
    return c.json({ ok: true });
  });
}

for (const play of PLAYS) registerResource(play);

// ── Settings (the shared context every agent reads first) ────────────
app.get("/api/settings", async (c) => {
  const row = await get<Record<string, unknown>>("SELECT * FROM settings WHERE id = 1");
  return c.json(row ?? {});
});

app.put("/api/settings", async (c) => {
  const b = await c.req.json<Record<string, unknown>>();
  const fields = ["product", "icp", "competitors", "goal_customers"].filter(
    (k) => b[k] !== undefined,
  );
  if (fields.length) {
    await run(
      `UPDATE settings SET ${fields.map((f) => `${f} = ?`).join(", ")}, updated_at = datetime('now') WHERE id = 1`,
      fields.map((f) => (f === "goal_customers" ? Math.trunc(Number(b[f]) || 0) : String(b[f] ?? ""))),
    );
  }
  return c.json(await get<Record<string, unknown>>("SELECT * FROM settings WHERE id = 1"));
});

// ── Weekly metrics (the YC "are we growing?" number) ─────────────────
app.get("/api/metrics", async (c) => {
  return c.json(
    await query<Record<string, unknown>>("SELECT * FROM weekly_metrics ORDER BY week_start DESC LIMIT 52"),
  );
});

// Upsert by week_start so an agent can post "this week's number" idempotently.
app.post("/api/metrics", async (c) => {
  const b = await c.req.json<Record<string, unknown>>();
  const week = String(b.week_start ?? "").trim();
  if (!week) return c.json({ error: "week_start is required (ISO Monday date)" }, 400);
  const nums = ["new_customers", "leads_added", "outreach_sent", "posts_published"];
  await run(
    `INSERT INTO weekly_metrics (week_start, ${nums.join(", ")}, notes) VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT(week_start) DO UPDATE SET
       ${nums.map((n) => `${n} = excluded.${n}`).join(", ")},
       notes = excluded.notes, updated_at = datetime('now')`,
    [week, ...nums.map((n) => Math.trunc(Number(b[n]) || 0)), String(b.notes ?? "")],
  );
  return c.json(await get<Record<string, unknown>>("SELECT * FROM weekly_metrics WHERE week_start = ?", [week]));
});

// ── Stats — totals + per-status breakdown for every play ─────────────
app.get("/api/stats", async (c) => {
  const plays: Record<string, { total: number; byStatus: Record<string, number> }> = {};
  for (const play of PLAYS) {
    const rows = await query<{ status: string; n: number }>(
      `SELECT status, COUNT(*) as n FROM ${play.name} GROUP BY status`,
    );
    const byStatus: Record<string, number> = {};
    let total = 0;
    for (const row of rows) {
      byStatus[row.status] = row.n;
      total += row.n;
    }
    plays[play.name] = { total, byStatus };
  }
  const settings = await get<{ goal_customers: number }>(
    "SELECT goal_customers FROM settings WHERE id = 1",
  );
  const customers =
    (await get<{ n: number }>("SELECT COALESCE(SUM(new_customers), 0) as n FROM weekly_metrics"))?.n ?? 0;
  const latest = await get<Record<string, unknown>>(
    "SELECT * FROM weekly_metrics ORDER BY week_start DESC LIMIT 1",
  );
  return c.json({
    plays,
    goal: settings?.goal_customers ?? 100,
    customers,
    latestWeek: latest ?? null,
  });
});

// ── Standup — the in-app "Conductor": today's highest-leverage moves ─
// Rule-based: each play has one bottleneck status that means "a human/agent
// needs to act next." We surface the count + the items waiting there.
const STANDUP_RULES: { play: string; status: string; action: string }[] = [
  { play: "prospects", status: "qualified", action: "Send the first personal message" },
  { play: "prospects", status: "replied", action: "Book the call — they replied" },
  { play: "backlinks", status: "found", action: "Write a better version, then pitch the site" },
  { play: "backlinks", status: "drafting", action: "Send the replacement-link outreach" },
  { play: "launches", status: "planned", action: "Schedule the launch" },
  { play: "content_posts", status: "idea", action: "Script the video" },
  { play: "content_posts", status: "scheduled", action: "Confirm it goes live" },
  { play: "trends", status: "spotted", action: "Draft the product-folded reply" },
  { play: "communities", status: "found", action: "Join and start adding value" },
  { play: "creators", status: "contacted", action: "Close the brief and hire" },
];

app.get("/api/standup", async (c) => {
  const moves: { play: string; status: string; action: string; count: number; ids: number[] }[] = [];
  for (const rule of STANDUP_RULES) {
    const rows = await query<{ id: number }>(
      `SELECT id FROM ${rule.play} WHERE status = ? ORDER BY updated_at ASC LIMIT 25`,
      [rule.status],
    );
    if (rows.length) {
      moves.push({ ...rule, count: rows.length, ids: rows.map((r) => r.id) });
    }
  }
  // Highest-leverage first: more waiting = more leverage to clear it.
  moves.sort((a, b) => b.count - a.count);
  return c.json({ moves });
});

export default app;
