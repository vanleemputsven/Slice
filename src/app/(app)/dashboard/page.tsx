import { DashboardClient } from "@/components/dashboard/dashboard-client";

export const metadata = {
  title: "Overview",
  description:
    "Monthly and yearly subscription totals, your share, upcoming payments, and work time.",
};

export default function DashboardPage() {
  return <DashboardClient />;
}
