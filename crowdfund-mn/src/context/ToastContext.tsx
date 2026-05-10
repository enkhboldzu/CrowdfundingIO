"use client";

import { createContext, useContext, useState, useCallback } from "react";
import { cn } from "@/lib/utils";

type Toast = { id: number; message: string; type: "info" | "warning" | "error" };

interface ToastCtx {
  show: (message: string, type?: Toast["type"]) => void;
}

const ToastContext = createContext<ToastCtx>({ show: () => {} });

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const show = useCallback((message: string, type: Toast["type"] = "info") => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}

      {/* Toast container — fixed bottom-center, above everything */}
      <div
        aria-live="polite"
        className="fixed bottom-6 inset-x-0 flex flex-col items-center gap-2 z-[9999] pointer-events-none px-4"
      >
        {toasts.map(t => (
          <div
            key={t.id}
            className={cn(
              "flex items-center gap-2.5 px-5 py-3.5 rounded-2xl shadow-2xl text-sm font-semibold pointer-events-auto animate-fade-up max-w-sm w-full sm:w-auto",
              t.type === "error"   && "bg-red-600 text-white",
              t.type === "warning" && "bg-amber-500 text-white",
              t.type === "info"    && "bg-slate-900 text-white",
            )}
          >
            {/* icon */}
            {t.type === "info" && (
              <svg className="w-4 h-4 flex-shrink-0 text-blue-300" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd"/>
              </svg>
            )}
            {t.type === "warning" && (
              <svg className="w-4 h-4 flex-shrink-0 text-yellow-200" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"/>
              </svg>
            )}
            {t.type === "error" && (
              <svg className="w-4 h-4 flex-shrink-0 text-red-200" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd"/>
              </svg>
            )}
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
