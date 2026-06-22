import { useEffect } from "preact/hooks";
import { useMission } from "../context";

export function ErrorBanner() {
  const { error, setError } = useMission();

  useEffect(() => {
    if (!error) return;
    const t = setTimeout(() => setError(null), 5000);
    return () => clearTimeout(t);
  }, [error, setError]);

  if (!error) return null;
  return <div class="error-banner">{error}</div>;
}
