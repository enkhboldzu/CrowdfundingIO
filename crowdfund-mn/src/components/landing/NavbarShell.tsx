"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "./Navbar";

// Suppress the public Navbar on /admin/* — those pages use AdminShell instead
export function NavbarShell() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;
  return <Navbar />;
}
