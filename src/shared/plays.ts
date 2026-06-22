/**
 * The 7 plays of the YC "first 100 customers" playbook, defined once and shared
 * by the server (CRUD + status pipelines) and the client (board + forms).
 *
 * Every play is the same shape: a list of items moving through a status
 * pipeline. A play is fully described by its fields — the server derives its
 * writable columns / required / searchable set from them, and the client
 * derives its board columns and add/edit form from them. Add a play here and
 * both ends light up (the matching table must exist in schema.sql).
 */

export type FieldKind = "text" | "int" | "real";

export interface Field {
  name: string;
  label: string;
  type: "text" | "url" | "number" | "textarea" | "select" | "status";
  kind?: FieldKind; // db storage kind, defaults to "text"
  required?: boolean;
  search?: boolean; // included in the list search
  options?: string[]; // for select / status
  placeholder?: string;
  primary?: boolean; // the headline column shown on the card
}

export interface Play {
  name: string; // table name + /api/<name> route segment
  label: string; // sidebar label
  n: number; // play number (1-7)
  title: string; // the YC play name
  blurb: string; // one-line description of the play
  icon: string; // lucide-preact icon name (resolved client-side)
  color: string;
  defaultSort: string;
  fields: Field[];
}

// What the server needs to run generic CRUD for a play.
export interface Col {
  name: string;
  kind?: FieldKind;
}
export interface Resource {
  name: string;
  cols: Col[];
  required: string[];
  searchable: string[];
  defaultSort: string;
}

// A fully-resolved play: display config (Play) plus the server's CRUD config
// (Resource), derived from the field list below.
export type PlayConfig = Play & Resource;

const NOTES: Field = { name: "notes", label: "Notes", type: "textarea", search: true };

const RAW_PLAYS: Play[] = [
  {
    name: "launches",
    label: "Launches",
    n: 1,
    title: "Launch-max",
    blurb: "Launch on every platform — 3× minimum. More launches = more eyeballs.",
    icon: "Rocket",
    color: "#7c3aed",
    defaultSort: "scheduled_for",
    fields: [
      { name: "platform", label: "Platform", type: "text", required: true, search: true, primary: true, placeholder: "Product Hunt, Hacker News, Peerlist, Indie Hackers, BetaList…" },
      { name: "scheduled_for", label: "Launch date", type: "text", placeholder: "2026-07-01" },
      { name: "url", label: "Listing URL", type: "url" },
      { name: "result", label: "Result", type: "text", search: true, placeholder: "#3 of the day, 240 upvotes" },
      { name: "status", label: "Status", type: "status", options: ["planned", "scheduled", "live", "done"] },
      NOTES,
    ],
  },
  {
    name: "backlinks",
    label: "Backlinks",
    n: 2,
    title: "Steal competitor backlinks",
    blurb: "Find where competitors get listed, make a better version, get listed (or replace).",
    icon: "Link2",
    color: "#0ea5e9",
    defaultSort: "updated_at",
    fields: [
      { name: "source_site", label: "Source site", type: "text", required: true, search: true, primary: true, placeholder: "saashub.com" },
      { name: "competitor", label: "Competitor", type: "text", search: true },
      { name: "source_url", label: "Source page", type: "url", search: true },
      { name: "our_url", label: "Our better version", type: "url" },
      { name: "status", label: "Status", type: "status", options: ["found", "drafting", "outreach_sent", "listed", "declined"] },
      NOTES,
    ],
  },
  {
    name: "prospects",
    label: "Warm outbound",
    n: 3,
    title: "Warm outbound",
    blurb: "Scrape who engages with competitors, qualify against ICP, message them personally.",
    icon: "Send",
    color: "#16a34a",
    defaultSort: "icp_fit",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, search: true, primary: true },
      { name: "company", label: "Company", type: "text", search: true },
      { name: "title", label: "Title", type: "text", search: true },
      { name: "profile_url", label: "Profile", type: "url" },
      { name: "channel", label: "Channel", type: "select", options: ["linkedin", "x", "email"] },
      { name: "source", label: "Source", type: "text", search: true, placeholder: "liked <competitor> post on 6/14" },
      { name: "icp_fit", label: "ICP fit", type: "number", kind: "int", placeholder: "0-100" },
      { name: "status", label: "Status", type: "status", options: ["found", "qualified", "messaged", "replied", "booked", "customer", "passed"] },
      NOTES,
    ],
  },
  {
    name: "creators",
    label: "UGC creators",
    n: 4,
    title: "Hire UGC creators",
    blurb: "Source 20-30 creators, brief them, pay per video with performance incentives.",
    icon: "Video",
    color: "#db2777",
    defaultSort: "updated_at",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, search: true, primary: true },
      { name: "platform", label: "Platform", type: "select", options: ["tiktok", "instagram", "youtube"], search: true },
      { name: "profile_url", label: "Profile", type: "url" },
      { name: "rate", label: "Rate ($/video)", type: "number", kind: "real" },
      { name: "deliverable_url", label: "Deliverable", type: "url" },
      { name: "status", label: "Status", type: "status", options: ["sourced", "contacted", "hired", "delivered", "paid", "passed"] },
      NOTES,
    ],
  },
  {
    name: "content_posts",
    label: "Content",
    n: 5,
    title: "Videos > everything",
    blurb: "Post product use-cases on X / LinkedIn. Video beats image/text 10×.",
    icon: "Clapperboard",
    color: "#ea580c",
    defaultSort: "updated_at",
    fields: [
      { name: "hook", label: "Hook / angle", type: "text", required: true, search: true, primary: true },
      { name: "platform", label: "Platform", type: "select", options: ["x", "linkedin", "tiktok", "youtube"] },
      { name: "format", label: "Format", type: "select", options: ["video", "image", "text"] },
      { name: "url", label: "Post URL", type: "url" },
      { name: "views", label: "Views", type: "number", kind: "int" },
      { name: "status", label: "Status", type: "status", options: ["idea", "scripting", "recording", "scheduled", "posted"] },
      NOTES,
    ],
  },
  {
    name: "communities",
    label: "Communities",
    n: 6,
    title: "Show up where customers are",
    blurb: "Find the Slack/Discord groups, newsletters and podcasts your customers live in.",
    icon: "Users",
    color: "#0d9488",
    defaultSort: "updated_at",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, search: true, primary: true },
      { name: "type", label: "Type", type: "select", options: ["slack", "discord", "newsletter", "podcast", "forum"] },
      { name: "url", label: "URL", type: "url" },
      { name: "audience", label: "Audience", type: "text", search: true, placeholder: "12k indie founders" },
      { name: "status", label: "Status", type: "status", options: ["found", "joined", "pitched", "featured", "passed"] },
      NOTES,
    ],
  },
  {
    name: "trends",
    label: "Trends",
    n: 7,
    title: "Ride every relevant trend",
    blurb: "Jump on a fresh trend each week and fold your product in.",
    icon: "TrendingUp",
    color: "#d97706",
    defaultSort: "updated_at",
    fields: [
      { name: "topic", label: "Topic", type: "text", required: true, search: true, primary: true },
      { name: "source", label: "Source", type: "text", placeholder: "x" },
      { name: "trend_url", label: "Trend URL", type: "url" },
      { name: "angle", label: "Our angle", type: "textarea", search: true, placeholder: "how we fold the product in" },
      { name: "post_url", label: "Our post", type: "url" },
      { name: "status", label: "Status", type: "status", options: ["spotted", "drafted", "posted", "passed"] },
      NOTES,
    ],
  },
];

// Derive each play's server CRUD config (columns / required / searchable) from
// its field list, so the field definitions stay the single source of truth.
export const PLAYS: PlayConfig[] = RAW_PLAYS.map((p) => ({
  ...p,
  cols: p.fields.map((f) => ({ name: f.name, kind: f.kind ?? "text" })),
  required: p.fields.filter((f) => f.required).map((f) => f.name),
  searchable: p.fields.filter((f) => f.search).map((f) => f.name),
}));

export function statusesFor(play: Play): string[] {
  return play.fields.find((f) => f.type === "status")?.options ?? [];
}

export function primaryField(play: Play): Field {
  return play.fields.find((f) => f.primary) ?? play.fields[0];
}
