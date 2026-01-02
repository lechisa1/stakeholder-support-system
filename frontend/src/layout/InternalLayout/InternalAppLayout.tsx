import React from "react";
import { Outlet } from "react-router";
import InternalAppHeader from "./InternalAppHeader";
import InternalNavBar from "./InternalNavBar";

const InternalAppLayout: React.FC = () => {
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

export default InternalAppLayout;
