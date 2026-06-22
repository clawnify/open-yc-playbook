# YC Playbook — agent operating guide

This app is the shared brain for getting a startup to its first 100 customers. It
runs the YC playbook as **seven plays**, each a list of items moving through a
status pipeline, over one D1 database. You (the agent) do the grind; the founder
keeps the few high-judgment moves.

**Before anything, read the shared context** — `GET /api/settings` returns the
product one-liner, the ICP, the competitor list, and the customer goal. Everything
you do is in service of that ICP. If `product` or `icp` is empty, ask the founder
to fill in Settings first (or set them via `PUT /api/settings`). On first deploy,
seed `settings` from the deploy prompts (`product`, `icp`, `competitors`,
`goal_customers`).

## The daily loop

1. `GET /api/standup` → the highest-leverage moves waiting right now (items sitting
   in a "needs action" status), already sorted by leverage. Work the top moves.
2. For each move, open that play, do the work, and advance the item's `status`.
3. At the end of the week, log the number: `POST /api/metrics` with `week_start`
   (the ISO Monday) and `new_customers`. That's the YC "are we growing?" number.

## The seven plays

Each play is a table with a generic REST surface:

- `GET    /api/<play>`         — list (`?status=`, `?search=`, `?sort=`, `?order=`)
- `POST   /api/<play>`         — create (JSON body of the writable fields)
- `PATCH  /api/<play>/:id`     — update any fields, including `status`
- `DELETE /api/<play>/:id`     — remove

| # | Play | `<play>` | Status pipeline | You do |
|---|------|----------|-----------------|--------|
| 1 | Launch-max | `launches` | planned → scheduled → live → done | Prep the listing + assets for every platform (Product Hunt, HN, Peerlist, Indie Hackers, BetaList…), schedule. Founder presses go-live. |
| 2 | Steal backlinks | `backlinks` | found → drafting → outreach_sent → listed → declined | Map where competitors get listed, write a better version, draft the site outreach. Founder approves the send/publish. |
| 3 | Warm outbound | `prospects` | found → qualified → messaged → replied → booked → customer → passed | Scrape who engages with competitors, score `icp_fit` (0-100), send routine follow-ups. Founder writes the first personal touch. |
| 4 | UGC creators | `creators` | sourced → contacted → hired → delivered → paid → passed | Source 20-30 creators, draft briefs, track pay/performance. Founder approves the hire + budget. |
| 5 | Videos > everything | `content_posts` | idea → scripting → recording → scheduled → posted | Draft video scripts + use-case posts for X/LinkedIn, schedule. Founder approves the post. |
| 6 | Communities | `communities` | found → joined → pitched → featured → passed | Find the Slack/Discord groups, newsletters, podcasts the ICP lives in, draft shoutout outreach. Founder OKs paid placements. |
| 7 | Ride trends | `trends` | spotted → drafted → posted → passed | Weekly: pull trending topics, find viral GTM posts, draft a product-folded reply/quote. Founder approves the post. |

The exact writable fields per play are the columns in `src/server/schema.sql`. New
items default to the first status; advance them with `PATCH … {"status": "…"}`.

## Autonomy boundary (semi-autonomous)

Act on your own for the grind: discovery, enrichment, scoring, drafting, and routine
follow-ups. **Escalate to the founder** the few moves that carry their voice or
their money: the first personal outbound message, anything published under the
company name, creator hires, and paid placements. When in doubt, draft it and leave
the item one status short of "sent" for the founder to approve.

## Overview endpoints

- `GET /api/stats`     — per-play totals + status breakdown, customer count vs goal.
- `GET /api/standup`   — today's moves (what to work next).
- `GET /api/metrics`   — weekly numbers (last 52 weeks).
- `GET/PUT /api/settings` — the shared context.
