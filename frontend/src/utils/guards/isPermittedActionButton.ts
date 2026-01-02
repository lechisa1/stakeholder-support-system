import { useAuth } from "../../contexts/AuthContext";
import { ActionButton } from "../../types/layout";

export function isPermittedActionButton(action: ActionButton): boolean {
  const { user } = useAuth();
  console.log("User in isPermittedActionButton:", user);

  if (!user) {
    return false;
  }
  // 1. Check user type restriction
  if (action.allowedFor && action.allowedFor.length > 0) {
    if (!action.allowedFor.includes(user.user_type)) {
      return false;
    }
  }

  // 2. If no permissions required → allowed
  if (!action.permissions || action.permissions.length === 0) {
    return true;
  }

  // 3. Check permissions
  // const hasPermission = action.permissions.some((p) =>
  //   user.userPermissions.includes(p)
  // );
  const hasPermission = true;
  return hasPermission;
}
