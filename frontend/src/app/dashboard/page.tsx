import { Dashboard } from "@/components/Dashboard";

export const metadata = { title: "My Account — BevSupply" };

export default function DashboardPage() {
  return (
    <div className="container-page py-8">
      <Dashboard />
    </div>
  );
}
