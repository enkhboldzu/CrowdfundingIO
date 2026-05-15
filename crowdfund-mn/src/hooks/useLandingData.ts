"use client";

import { useState, useEffect } from "react";
import type { PublicStats } from "@/lib/db/stats";
import type { Project } from "@/types";

export interface LandingData {
  stats:          PublicStats;
  projects:       Project[];
  featured:       Project[];
  trending:       Project[];
  categoryCounts: Record<string, number>;
}

const EMPTY: LandingData = {
  stats:          { totalSuccessfulProjects: 0, totalFundingRaised: 0, totalBackers: 0, successRate: 0 },
  projects:       [],
  featured:       [],
  trending:       [],
  categoryCounts: {},
};

/* Module-level cache — one fetch per page load regardless of how many components use the hook */
let _cache:   LandingData | null          = null;
let _promise: Promise<LandingData> | null = null;

function fetchLanding(): Promise<LandingData> {
  if (!_promise) {
    _promise = fetch("/api/landing", { cache: "no-store" })
      .then((r) => r.json() as Promise<LandingData>)
      .then((data) => { _cache = data; return data; })
      .catch(() => { _cache = EMPTY; return EMPTY; });
  }
  return _promise;
}

export function useLandingData(): { data: LandingData | null; loading: boolean } {
  const [data,    setData]    = useState<LandingData | null>(_cache);
  const [loading, setLoading] = useState(!_cache);

  useEffect(() => {
    if (_cache) { setData(_cache); setLoading(false); return; }
    let cancelled = false;
    fetchLanding().then((d) => {
      if (!cancelled) { setData(d); setLoading(false); }
    });
    return () => { cancelled = true; };
  }, []);

  return { data, loading };
}
