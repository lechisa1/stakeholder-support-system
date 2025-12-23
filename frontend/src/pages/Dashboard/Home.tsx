import VariantStatasCard from "../../components/dashboard/cards/VariantStatasCard";
import ChartRadialText01 from "../../components/dashboard/charts/ChartRadialText01";
import DashboardLayout from "../../components/dashboard/layout/DashboardLayout";

function Home() {
  return (
    <div className="flex flex-col space-y-6">
      <VariantStatasCard />
      <DashboardLayout />
    </div>
  );
}

export default Home;
