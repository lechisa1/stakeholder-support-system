import DashboardStatsCards from "../../components/dashboard/cards/DashboardStatsCards";
import ChartRadialText01 from "../../components/dashboard/charts/ChartRadialText01";
import DashboardLayout from "../../components/dashboard/layout/DashboardLayout";

function Home() {
  return (
    <div className="flex flex-col space-y-6">
      <DashboardStatsCards />
      <DashboardLayout />
      <ChartRadialText01 />
    </div>
  );
}

export default Home;
