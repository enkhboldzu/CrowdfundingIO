"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";

/*
  Wraps page children in a motion.div keyed on the pathname.
  On every route change the entering page fades in from y:10.
  No exit animation needed — Next.js App Router unmounts the old
  page before the new one mounts, so exit never fires.
*/
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col flex-1"
    >
      {children}
    </motion.div>
  );
}
