import {
  Rocket,
  Link2,
  Send,
  Video,
  Clapperboard,
  Users,
  TrendingUp,
  Target,
  LayoutDashboard,
  Settings,
} from "lucide-preact";
// Maps the `icon` string in shared/plays.ts to a lucide-preact component, so the
// shared play config can stay free of client-only imports.
const ICONS: Record<string, typeof Target> = {
  Rocket,
  Link2,
  Send,
  Video,
  Clapperboard,
  Users,
  TrendingUp,
  Target,
  LayoutDashboard,
  Settings,
};

export function Icon({ name, size = 16 }: { name: string; size?: number }) {
  const C = ICONS[name] ?? Target;
  return <C size={size} />;
}
