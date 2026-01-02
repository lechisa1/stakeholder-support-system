import VariantStatasCard from "../../components/dashboard/cards/VariantStatasCard";
import DashboardLayout from "../../components/dashboard/layout/DashboardLayout";

function InternalDashboard() {
  return (
    <div className="flex flex-col space-y-6">
      <VariantStatasCard />
      <DashboardLayout />
    </div>
  );
}

export default InternalDashboard;
