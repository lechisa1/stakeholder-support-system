import AreaChart01 from "../charts/AreaChart01";
import BarChart01 from "../charts/BarChart01";
import BarChart08 from "../charts/BarChart08";
import PieChart11 from "../charts/PieChart11";

const DashboardLayout = () => {
  return (
    <div className="gap-10 rounded-xl flex flex-col justify-between bg-white">
      <div className="grid grid-cols-5 gap-10">
        <div className="col-span-3  ">
          <AreaChart01 />
        </div>
        <div className="col-span-2  ">
          <BarChart08 />
        </div>
      </div>
      <div className="grid grid-cols-5 gap-10">
        <div className="col-span-3  ">
          <BarChart01 />
        </div>
        <div className="col-span-2  ">
          <PieChart11 />
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
