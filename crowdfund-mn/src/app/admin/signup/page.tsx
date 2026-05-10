import { redirect } from "next/navigation";

/* Any attempt to reach /admin/signup is silently bounced to the admin login tab. */
export default function AdminSignupPage() {
  redirect("/login?role=admin");
}
