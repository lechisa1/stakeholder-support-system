import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermissions?: string[];
  anyPermissions?: string[];
  requiredRole?: string;
  fallbackPath?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredPermissions = [],
  anyPermissions = [],
  requiredRole,
  fallbackPath = "/dashboard",
}) => {
  const { isAuthenticated, loading, hasPermission, hasAnyPermission, hasRole } =
    useAuth();
  const location = useLocation();

  // 1️⃣ wait for auth to load
  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/80 z-50">
        <div className="h-10 w-10 border-4 border-teal-600 border-r-transparent rounded-full animate-spin" />
        <p className="mt-4 text-gray-600">Authenticating...</p>
      </div>
    );
  }

  // 2️⃣ block unauthenticated users completely
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3️⃣ role requirement
  if (requiredRole && !hasRole(requiredRole)) {
    return <Navigate to={fallbackPath} replace />;
  }

  // 4️⃣ permissions: all required
  if (
    requiredPermissions.length > 0 &&
    !requiredPermissions.every((p) => hasPermission(p))
  ) {
    return <Navigate to={fallbackPath} replace />;
  }

  // 5️⃣ permissions: any required
  if (anyPermissions.length > 0 && !hasAnyPermission(anyPermissions)) {
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;

// Usage Example:
{
  /* <Route
  path="/users"
  element={
    <ProtectedRoute requiredPermissions={["user_read"]}>
      <Users />
    </ProtectedRoute>
  }
/> */
}
