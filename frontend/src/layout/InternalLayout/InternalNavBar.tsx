import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { getNavItemsByUserType } from "../../types/userTypeRoutes";
import DynamicIcon from "../../components/common/DynamicIcon";

const InternalNavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { hasAnyPermission, user } = useAuth();
  const userType = user?.user_type || "external_user";
  const filteredNavItems = getNavItemsByUserType(userType);

  const isActive = (path: string) => {
    return (
      location.pathname === path || location.pathname.startsWith(path + "/")
    );
  };

  return (
    <div className="flex w-fit bg-white  items-center gap-2 px-3 py-2 rounded-md border border-[#e5e7eb] shadow-sm">
      {filteredNavItems.map((item, index) => {
        const active = isActive(item.path);

        return (
          <button
            key={index}
            onClick={() => navigate(item.path)}
            className={`
              flex items-center bg-gray-50  gap-2 px-6 border border-[#e5e7eb] py-2 rounded-md text-sm font-medium
              transition-all duration-300
              ${
                active
                  ? "bg-[#073954] text-white"
                  : "text-[#073954] bg-slate-1001 hover:bg-slate-200"
              }
            `}
          >
            <span className="h-4 w-4  text-[#073954] flex items-center justify-center ">
              <DynamicIcon name={item.icon as string} />
            </span>
            <span>{item.name}</span>
          </button>
        );
      })}
    </div>
  );
};

export default InternalNavBar;
