"use client";

import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";

/*
  useAuthGuard — action-level authentication check.

  Usage:
    const { guard } = useAuthGuard();

    // Wrap any protected action:
    <button onClick={() => guard(() => doSomething())}>Дэмжих</button>

    // Or just as a boolean gate:
    <button onClick={() => guard()}>Дэмжих</button>

  If the user is not logged in:
    1. Shows a toast: "Та үйлдэл хийхийн тулд нэвтрэх шаардлагатай"
    2. Redirects to /login?from=<current-path>
    3. Returns false (action is NOT executed)

  If logged in: executes action, returns true.
*/
export function useAuthGuard() {
  const { isLoggedIn } = useAuth();
  const { show }       = useToast();
  const router         = useRouter();
  const pathname       = usePathname();

  function guard(action?: () => void): boolean {
    if (!isLoggedIn) {
      show("Та нэвтрэх шаардлагатай", "info");
      router.push(`/login?from=${encodeURIComponent(pathname)}`);
      return false;
    }
    action?.();
    return true;
  }

  return { guard, isLoggedIn };
}
