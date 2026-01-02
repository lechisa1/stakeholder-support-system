import { useGetUserPositionsQuery } from "../../redux/services/userApi";

export function getUserPositionId(
  loggedUserType?: string,
  createUserType?: string,
  isCreateMode: boolean = false
): string {
  if (!loggedUserType || !createUserType) {
    return "";
  }
  const { data, isLoading } = useGetUserPositionsQuery();

  if (isLoading || !data) return "";

  const positions = data.data || [];

  const adminPosition = positions.find(
    (p: any) => p.name === "adminstrative_user"
  );
  const ictPosition = positions.find((p: any) => p.name === "ict_support_user");

  if (loggedUserType === "internal_user") {
    if (createUserType === "external_user") {
      return adminPosition?.user_position_id || "";
    }
    return "";
  } else {
    if (isCreateMode === true) {
      return ictPosition?.user_position_id || "";
    }
    return null as any;
  }
}
