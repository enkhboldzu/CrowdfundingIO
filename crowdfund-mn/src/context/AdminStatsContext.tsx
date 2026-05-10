"use client";

import {
  createContext, useContext, useState, useCallback, useEffect, type ReactNode,
} from "react";

interface AdminStatsCtx {
  pendingCount:     number;
  refreshPending:   () => void;
  decrementPending: () => void;
}

const AdminStatsContext = createContext<AdminStatsCtx>({
  pendingCount:     0,
  refreshPending:   () => {},
  decrementPending: () => {},
});

export function AdminStatsProvider({ children }: { children: ReactNode }) {
  const [pendingCount, setPending] = useState(0);

  const refreshPending = useCallback(() => {
    fetch("/api/admin/stats")
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setPending(d.pendingCount ?? 0); })
      .catch(() => {});
  }, []);

  const decrementPending = useCallback(() => {
    setPending(c => Math.max(0, c - 1));
  }, []);

  useEffect(() => { refreshPending(); }, [refreshPending]);

  return (
    <AdminStatsContext.Provider value={{ pendingCount, refreshPending, decrementPending }}>
      {children}
    </AdminStatsContext.Provider>
  );
}

export function useAdminStats() {
  return useContext(AdminStatsContext);
}
