export type View = "standup" | "settings" | string; // string = a play name

export type Item = Record<string, unknown> & {
  id: number;
  status: string;
  created_at: string;
  updated_at: string;
};

export interface PlayStat {
  total: number;
  byStatus: Record<string, number>;
}

export interface Metric {
  week_start: string;
  new_customers: number;
  leads_added: number;
  outreach_sent: number;
  posts_published: number;
  notes: string;
}

export interface Stats {
  plays: Record<string, PlayStat>;
  goal: number;
  customers: number;
  latestWeek: Metric | null;
}

export interface StandupMove {
  play: string;
  status: string;
  action: string;
  count: number;
  ids: number[];
}

export interface Settings {
  product: string;
  icp: string;
  competitors: string;
  goal_customers: number;
}
