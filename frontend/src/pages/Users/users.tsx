import { Users } from "lucide-react";
import UserList from "../../components/tables/lists/userList";
import { ActionButton } from "../../types/layout";
import { useEffect, useState } from "react";
import { useGetUserTypesQuery } from "../../redux/services/userApi";
import { isPermittedActionButton } from "../../utils/guards/isPermittedActionButton";
import { useAuth } from "../../contexts/AuthContext";

// import { useTranslation } from "react-i18next";
export default function UsersPage() {
  // const { t } = useTranslation();
  const { user } = useAuth();
  console.log(user, "logged in user from users page");
  const { data: userTypesResponse, isLoading: loadingUserTypes } =
    useGetUserTypesQuery();
  const internalUserType = userTypesResponse?.data?.find(
    (t: any) => t.name === "internal_user"
  );

  const externalUserType = userTypesResponse?.data?.find(
    (t: any) => t.name === "external_user"
  );

  const [activeTab, setActiveTab] = useState<"internal" | "external">(
    "internal"
  );

  const [showTabOptions, setShowTabOptions] = useState(true);

  const actions: ActionButton[] = [
    {
      label: "Internal Users",
      icon: <Users className="h-4 w-4" />,
      variant: activeTab === "internal" ? "default" : "outline",
      size: "default",
      onClick: () => setActiveTab("internal"),
      allowedFor: ["internal_user"],
    },
    {
      label: "External Users",
      icon: <Users className="h-4 w-4" />,
      variant: activeTab === "external" ? "default" : "outline",
      size: "default",
      onClick: () => setActiveTab("external"),
      allowedFor: ["internal_user", "external_user"],
    },
  ];

  // Filter the actions once
  const permittedActions = actions.filter((action) =>
    isPermittedActionButton(action)
  );

  useEffect(() => {
    if (permittedActions.length === 1) {
      const singleAction = permittedActions[0];
      if (singleAction.label === "Internal Users") {
        setActiveTab("internal");
      } else if (singleAction.label === "External Users") {
        setActiveTab("external");
      }
      setShowTabOptions(false);
    }
  }, [permittedActions]);

  return (
    <>
      {activeTab === "internal" && (
        <UserList
          user_type="internal_user"
          logged_user_type={user?.user_type}
          user_type_id={internalUserType?.user_type_id}
          toggleActions={showTabOptions ? permittedActions : undefined}
        />
      )}

      {activeTab === "external" && (
        <UserList
          logged_user_type={user?.user_type}
          user_type_id={externalUserType?.user_type_id}
          user_type="external_user"
          toggleActions={showTabOptions ? permittedActions : undefined}
        />
      )}
    </>
  );
}
