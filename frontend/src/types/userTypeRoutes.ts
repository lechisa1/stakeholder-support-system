export type SubNavItem = {
  name: string;
  path: string;
  permission?: string[];
  allowedFor?: string[];
};

export type NavItem = {
  name: string;
  icon: React.ReactNode | string;
  path?: string;
  subItems?: SubNavItem[];
  permission?: string[];
  anyPermissions?: string[];
  allowedFor?: string[];
};

export const navItems: NavItem[] = [
  // Shared
  {
    icon: "Home",
    name: "Dashboard",
    path: "/dashboard",
    allowedFor: ["internal_user", "external_user"],
  },

  // Shared parent but sub routes restricted
  {
    icon: "Users",
    name: "User Management",
    path: "/users",
    allowedFor: ["internal_user", "external_user"],
    subItems: [
      {
        name: "User List",
        path: "/users",
        allowedFor: ["internal_user", "external_user"],
      },
      {
        name: "Role Management",
        path: "/role",
        allowedFor: ["internal_user"],
      },
      {
        name: "Permission Management",
        path: "/permission",
        allowedFor: ["internal_user"],
      },
    ],
  },

  // internal_user Only
  {
    icon: "Building2",
    name: "Organization Management",
    path: "/inistitutes",
    allowedFor: ["internal_user"],
  },

  // External_user Only
  {
    icon: "Landmark",
    name: "Projects",
    path: "/project",
    allowedFor: ["external_user"],
  },

  {
    icon: "Database",
    name: "BaseData",
    path: "/basedata",
    allowedFor: ["internal_user"],
  },

  {
    icon: "FileWarning",
    name: "My Issue",
    path: "/my_issue",
    allowedFor: ["external_user"],
  },

  {
    icon: "ClipboardCheck",
    name: "Task List",
    path: "/task_list",
    allowedFor: ["internal_user"],
  },

  {
    icon: "ClipboardList",
    name: "Task List",
    path: "/task",
    allowedFor: ["external_user"],
  },
  {
    icon: "PlugIcon",
    name: "System Settings",
    subItems: [
      {
        name: "Profile",
        path: "/profile",
        allowedFor: ["external_user", "internal_user"],
      },
      {
        name: "Organization Profile",
        path: "/organization_profile",
        allowedFor: ["external_user", "internal_user"],
      },
      {
        name: "Settings",
        path: "/settings",
        allowedFor: ["external_user", "internal_user"],
      },
    ],
    allowedFor: ["external_user", "internal_user"],
  },
];

export const getNavItemsByUserType = (userType: string): NavItem[] => {
  return navItems
    .map((item) => {
      const filteredSubItems = item.subItems?.filter((sub) =>
        sub.allowedFor?.includes(userType)
      );

      return {
        ...item,
        subItems: filteredSubItems,
      };
    })
    .filter((item) => {
      const mainAllowed = item.allowedFor?.includes(userType);
      const hasVisibleSubs = item.subItems && item.subItems.length > 0;

      if (item.subItems && item.subItems.length > 0) {
        return hasVisibleSubs;
      }

      return mainAllowed;
    });
};

export const getNavItemsCountByUserType = (userType: string): number => {
  const items = getNavItemsByUserType(userType);

  let count = 0;

  items.forEach((item) => {
    if (item.subItems && item.subItems.length > 0) {
      count += item.subItems.length;
    } else {
      count += 1;
    }
  });

  return count;
};
