"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { cn } from "@/lib/utils";

interface GuardedLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  onNavigate?: () => void;
}

export function GuardedLink({ href, children, className, onNavigate }: GuardedLinkProps) {
  const { guard } = useAuthGuard();
  const router    = useRouter();
  const [loading, setLoading] = useState(false);

  function handleClick() {
    if (loading) return;
    setLoading(true);
    const authed = guard(() => {
      router.push(href);
      onNavigate?.();
    });
    if (!authed) setTimeout(() => setLoading(false), 600);
  }

  return (
    <motion.button
      type="button"
      onClick={handleClick}
      disabled={loading}
      whileHover={!loading ? { scale: 1.02 } : undefined}
      whileTap={!loading ? { scale: 0.97 } : undefined}
      transition={{ type: "spring", stiffness: 500, damping: 22 }}
      className={cn(className, loading && "opacity-70 cursor-wait pointer-events-none")}
    >
      {loading ? (
        <span className="inline-flex items-center gap-2">
          <svg className="w-4 h-4 animate-spin flex-shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden>
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3V4a8 8 0 00-8 8h4z" />
          </svg>
          {children}
        </span>
      ) : children}
    </motion.button>
  );
}
