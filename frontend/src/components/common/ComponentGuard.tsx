import React from "react";
import { useAuth } from "../../contexts/AuthContext";

interface ComponentGuardProps {
  permissions?: string[]; // required permissions
  fallback?: React.ReactNode; // optional fallback UI
  children: React.ReactNode;
}

export const ComponentGuard: React.FC<ComponentGuardProps> = ({
  permissions,
  fallback = null,
  children,
}) => {
  const { hasAnyPermission } = useAuth();

  // No permission required → always render
  if (!permissions || permissions.length === 0) {
    return <>{children}</>;
  }

  // Permission check
  const allowed = hasAnyPermission(permissions);

  if (!allowed) return <>{fallback}</>;

  return <>{children}</>;
};
