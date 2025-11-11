import {useEffect, useMemo, useState} from "react";

const hashString = (input: string) => {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return hash.toString();
};

const fetchHash = async (url: string) => {
  const response = await fetch(`${url}?cache=${Date.now()}`);
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }
  const text = await response.text();
  return hashString(text);
};

export const useQuickReload = (sources: string[], intervalMs = 2000) => {
  const normalizedSources = useMemo(() => Array.from(new Set(sources)).filter(Boolean), [sources]);
  const [version, setVersion] = useState(0);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!normalizedSources.length) {
      return;
    }

    const previousHashes = new Map<string, string>();
    let cancelled = false;

    const check = async () => {
      let changed = false;
      for (const source of normalizedSources) {
        try {
          const hash = await fetchHash(source);
          if (previousHashes.has(source) && previousHashes.get(source) !== hash) {
            changed = true;
          }
          previousHashes.set(source, hash);
        } catch (error) {
          console.warn("Quick reload watcher failed:", source, error);
        }
        if (cancelled) {
          return;
        }
      }

      if (changed) {
        setVersion((value) => value + 1);
        setToast("🔁 Updated preview after changes");
        setTimeout(() => setToast(null), 1800);
      }
    };

    const id = window.setInterval(check, intervalMs);
    void check();

    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [intervalMs, normalizedSources]);

  return {version, toast};
};
