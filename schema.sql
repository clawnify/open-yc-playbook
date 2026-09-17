-- Mission Control — the YC "first 100 customers" playbook as a shared spine.
-- Seven plays, one shape: every play is a list of items moving through a status
-- pipeline. Agents read/write these tables; the Standup view aggregates them.

-- ── Settings (single row, id = 1) ───────────────────────────────────
-- The shared context every agent reads before acting: who we are, who we
-- target, who we're stealing share from.
CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  product TEXT DEFAULT '',           -- one-line product description
  icp TEXT DEFAULT '',               -- ideal customer profile (prose)
  competitors TEXT DEFAULT '',       -- newline-separated competitor names/domains
  goal_customers INTEGER DEFAULT 100,
  updated_at TEXT DEFAULT (datetime('now'))
);
-- The row itself is created by the app (ensureSeed in index.ts): schema.sql is DDL only.

-- ── Play 1: Launch-max ──────────────────────────────────────────────
-- Launch on every platform, 3x minimum. status: planned → scheduled → live → done
CREATE TABLE IF NOT EXISTS launches (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  platform TEXT NOT NULL,            -- Product Hunt, Hacker News, Peerlist, Indie Hackers, Devhunt, BetaList...
  url TEXT DEFAULT '',               -- live listing URL once posted
  scheduled_for TEXT DEFAULT '',     -- ISO date of the launch
  status TEXT NOT NULL DEFAULT 'planned',
  result TEXT DEFAULT '',            -- e.g. "#3 of the day, 240 upvotes"
  notes TEXT DEFAULT '',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- ── Play 2: Steal competitor backlinks ──────────────────────────────
-- status: found → drafting → outreach_sent → listed → declined
CREATE TABLE IF NOT EXISTS backlinks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  competitor TEXT DEFAULT '',        -- whose backlink this is
  source_site TEXT NOT NULL,         -- the site that links to them (e.g. "saashub.com")
  source_url TEXT DEFAULT '',        -- the specific page/article
  our_url TEXT DEFAULT '',           -- the better version we made
  status TEXT NOT NULL DEFAULT 'found',
  notes TEXT DEFAULT '',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- ── Play 3: Warm outbound ───────────────────────────────────────────
-- Scrape who engages with competitors, qualify, message personally.
-- status: found → qualified → messaged → replied → booked → customer → passed
CREATE TABLE IF NOT EXISTS prospects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  company TEXT DEFAULT '',
  title TEXT DEFAULT '',
  profile_url TEXT DEFAULT '',       -- LinkedIn / X profile
  channel TEXT DEFAULT 'linkedin',   -- linkedin | x | email
  source TEXT DEFAULT '',            -- e.g. "liked <competitor> post on 6/14"
  icp_fit INTEGER DEFAULT 0,         -- 0-100 fit score (agent-scored)
  status TEXT NOT NULL DEFAULT 'found',
  notes TEXT DEFAULT '',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- ── Play 4: UGC creators ────────────────────────────────────────────
-- status: sourced → contacted → hired → delivered → paid → passed
CREATE TABLE IF NOT EXISTS creators (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  platform TEXT DEFAULT 'tiktok',    -- tiktok | instagram | youtube
  profile_url TEXT DEFAULT '',
  rate REAL DEFAULT 0,               -- per-video rate (USD)
  deliverable_url TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'sourced',
  notes TEXT DEFAULT '',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- ── Play 5: Videos > everything ─────────────────────────────────────
-- Use-case content for X / LinkedIn. status: idea → scripting → recording → scheduled → posted
CREATE TABLE IF NOT EXISTS content_posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  hook TEXT NOT NULL,                -- the angle / title
  platform TEXT DEFAULT 'x',         -- x | linkedin | tiktok | youtube
  format TEXT DEFAULT 'video',       -- video | image | text
  status TEXT NOT NULL DEFAULT 'idea',
  url TEXT DEFAULT '',               -- live post URL
  views INTEGER DEFAULT 0,
  notes TEXT DEFAULT '',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- ── Play 6: Show up where customers are ─────────────────────────────
-- status: found → joined → pitched → featured → passed
CREATE TABLE IF NOT EXISTS communities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  type TEXT DEFAULT 'slack',         -- slack | discord | newsletter | podcast | forum
  url TEXT DEFAULT '',
  audience TEXT DEFAULT '',          -- size / who's there
  status TEXT NOT NULL DEFAULT 'found',
  notes TEXT DEFAULT '',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- ── Play 7: Ride every relevant trend ───────────────────────────────
-- status: spotted → drafted → posted → passed
CREATE TABLE IF NOT EXISTS trends (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  topic TEXT NOT NULL,
  source TEXT DEFAULT 'x',           -- where it's trending
  trend_url TEXT DEFAULT '',
  angle TEXT DEFAULT '',             -- how we fold the product in
  status TEXT NOT NULL DEFAULT 'spotted',
  post_url TEXT DEFAULT '',          -- our reply/quote-tweet
  notes TEXT DEFAULT '',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- ── The weekly number ───────────────────────────────────────────────
-- YC's "are we growing?" — one row per week. new_customers is THE number.
CREATE TABLE IF NOT EXISTS weekly_metrics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  week_start TEXT NOT NULL UNIQUE,   -- ISO date of the Monday
  new_customers INTEGER DEFAULT 0,
  leads_added INTEGER DEFAULT 0,
  outreach_sent INTEGER DEFAULT 0,
  posts_published INTEGER DEFAULT 0,
  notes TEXT DEFAULT '',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_launches_status ON launches(status);
CREATE INDEX IF NOT EXISTS idx_backlinks_status ON backlinks(status);
CREATE INDEX IF NOT EXISTS idx_prospects_status ON prospects(status);
CREATE INDEX IF NOT EXISTS idx_prospects_fit ON prospects(icp_fit);
CREATE INDEX IF NOT EXISTS idx_creators_status ON creators(status);
CREATE INDEX IF NOT EXISTS idx_content_status ON content_posts(status);
CREATE INDEX IF NOT EXISTS idx_communities_status ON communities(status);
CREATE INDEX IF NOT EXISTS idx_trends_status ON trends(status);
CREATE INDEX IF NOT EXISTS idx_weekly_week ON weekly_metrics(week_start);
