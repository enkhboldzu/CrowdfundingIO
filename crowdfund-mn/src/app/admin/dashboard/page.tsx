import { AdminDashboardClient } from "./AdminDashboardClient";

export const metadata = { title: "Admin Dashboard — crowdfund.mn" };

// Suspense is already provided by src/app/admin/layout.tsx (AdminShell)
export default function AdminDashboardPage() {
  return <AdminDashboardClient />;
}
