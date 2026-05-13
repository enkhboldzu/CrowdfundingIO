"use client";

import { usePathname } from "next/navigation";
import { ChatBotWidget } from "./ChatBotWidget";

export function ChatBotShell() {
  const pathname = usePathname();

  if (pathname.startsWith("/admin")) return null;

  return <ChatBotWidget />;
}
