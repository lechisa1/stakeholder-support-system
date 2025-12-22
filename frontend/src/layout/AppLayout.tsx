// src/layout/AppLayout.tsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { SidebarProvider, useSidebar } from "../context/SidebarContext";
import { useAuth } from "../contexts/AuthContext";
import AppHeader from "./AppHeader";
import AppSidebar from "./AppSidebar";
import Backdrop from "./Backdrop";
import InternalAppHeader from "./InternalLayout/InternalAppHeader";
import InternalNavBar from "./InternalLayout/InternalNavBar";
import { getNavItemsCountByUserType } from "../types/userTypeRoutes";

const LayoutWithSidebar: React.FC = () => {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  return (
    <div className="min-h-screen xl:flex">
      <div>
        <AppSidebar />
        <Backdrop />
      </div>
      <div
        className={`flex-1 transition-all duration-300 ease-in-out ${
          isExpanded || isHovered ? "lg:ml-[290px]" : "lg:ml-[90px]"
        } ${isMobileOpen ? "ml-0" : ""}`}
      >
        <AppHeader />
        <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

const LayoutWithOutSidebar: React.FC = () => {
  return (
    <div>
      <InternalAppHeader />
      {/* buttons like navigation bar */}

      <div className="p-4 mx-auto max-w-(--breakpoint-2xl)  md:p-6">
        <div className="flex justify-start mb-4">
          <InternalNavBar />
        </div>
        <Outlet />
      </div>
    </div>
  );
};

// src/layout/AppLayout.tsx (updated LayoutContent)
const LayoutContent: React.FC = () => {
  const { isAuthenticated, loading, user } = useAuth();
  const userType = user?.user_type || "external_user";
  const navItemLength = getNavItemsCountByUserType(userType);
  const location = useLocation();

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#269A99] border-r-transparent"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (navItemLength <= 3) {
    return <LayoutWithOutSidebar />;
  } else {
    return (
      <SidebarProvider>
        <LayoutWithSidebar />
      </SidebarProvider>
    );
  }
};

const AppLayout: React.FC = () => {
  return <LayoutContent />;
};

export default AppLayout;
