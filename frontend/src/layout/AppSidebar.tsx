// src/components/layout/AppSidebar.tsx
import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSidebar } from "../context/SidebarContext";
import { useAuth } from "../contexts/AuthContext";
import Logo from "../assets/logo.png";
import { HorizontaLDots } from "../icons";
import { getNavItemsByUserType, NavItem } from "../types/userTypeRoutes";
import DynamicIcon from "../components/common/DynamicIcon";

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const { hasAnyPermission, user } = useAuth();
  const userType = user?.user_type || "external_user";
  const location = useLocation();

  const [openSubmenu, setOpenSubmenu] = useState<{ index: number } | null>(
    null
  );
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {}
  );
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isActive = useCallback(
    (path: string) =>
      location.pathname === path || location.pathname.startsWith(path + "/"),
    [location.pathname]
  );

  // Get user type and filter menu items
  const filteredNavItems = getNavItemsByUserType(userType);

  // Filter menu items based on permissions
  const filterMenuItems = (items: NavItem[]) => {
    return items
      .map((item) => {
        // Check main item permission
        if (item.permission && !hasAnyPermission(item.permission)) {
          return null;
        }
        if (item.anyPermissions && !hasAnyPermission(item.anyPermissions)) {
          return null;
        }

        // Handle subitems
        let newSubItems = item.subItems?.filter((sub) => {
          if (sub.permission && !hasAnyPermission(sub.permission)) {
            return false;
          }
          return true;
        });

        // If no subitems left, hide parent
        if (item.subItems && (!newSubItems || newSubItems.length === 0)) {
          return null;
        }

        return {
          ...item,
          subItems: newSubItems,
        };
      })
      .filter((item) => item !== null) as NavItem[];
  };

  useEffect(() => {
    let submenuMatched = false;
    filteredNavItems.forEach((nav, index) => {
      if (nav.subItems) {
        nav.subItems.forEach((subItem) => {
          if (isActive(subItem.path)) {
            setOpenSubmenu({ index });
            submenuMatched = true;
          }
        });
      }
    });

    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [location, isActive]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number) => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (prevOpenSubmenu && prevOpenSubmenu.index === index) {
        return null;
      }
      return { index };
    });
  };

  const renderMenuItems = (items: NavItem[]) => {
    const filteredItems = filterMenuItems(items);

    if (filteredItems.length === 0) return null;

    return (
      <ul className="flex flex-col gap-4">
        {filteredItems.map((nav, index) => (
          <li key={nav.name}>
            {nav.subItems ? (
              <button
                onClick={() => handleSubmenuToggle(index)}
                className={`menu-item group ${
                  openSubmenu?.index === index
                    ? "menu-item-active"
                    : "menu-item-inactive"
                } cursor-pointer ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "lg:justify-start"
                }`}
              >
                <span
                  className={`menu-item-icon-size  ${
                    openSubmenu?.index === index
                      ? "menu-item-icon-active"
                      : "menu-item-icon-inactive"
                  }`}
                >
                  <DynamicIcon name={nav.icon as string} />
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="menu-item-text">{nav.name}</span>
                )}
                {(isExpanded || isHovered || isMobileOpen) && (
                  <DynamicIcon
                    name="ChevronDownIcon"
                    className={`ml-auto w-5 h-5 transition-transform duration-200 ${
                      openSubmenu?.index === index
                        ? "rotate-180 text-brand-500"
                        : ""
                    }`}
                  />
                )}
              </button>
            ) : (
              nav.path && (
                <Link
                  to={nav.path}
                  className={`menu-item group ${
                    isActive(nav.path)
                      ? "menu-item-active"
                      : "menu-item-inactive"
                  }`}
                >
                  <span
                    className={`menu-item-icon-size ${
                      isActive(nav.path)
                        ? "menu-item-icon-active"
                        : "menu-item-icon-inactive"
                    }`}
                  >
                    <DynamicIcon name={nav.icon as string} />
                  </span>
                  {(isExpanded || isHovered || isMobileOpen) && (
                    <span className="menu-item-text">{nav.name}</span>
                  )}
                </Link>
              )
            )}
            {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
              <div
                ref={(el) => {
                  subMenuRefs.current[`${index}`] = el;
                }}
                className="overflow-hidden transition-all duration-300"
                style={{
                  height:
                    openSubmenu?.index === index
                      ? `${subMenuHeight[`${index}`]}px`
                      : "0px",
                }}
              >
                <ul className="relative mt-2 ml-5">
                  <span className="absolute left-0 top-0 w-[2px] h-full bg-gray-300 dark:bg-gray-600"></span>
                  {nav.subItems.map((subItem) => (
                    <li key={subItem.name} className="relative pl-4">
                      <Link
                        to={subItem.path}
                        className={`menu-dropdown-item block ${
                          isActive(subItem.path)
                            ? "menu-dropdown-item-active"
                            : "menu-dropdown-item-inactive"
                        }`}
                      >
                        {subItem.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <aside
      className={`fixed mt-5 flex flex-col top-0 px-5 left-0 bg-white dark:bg-gray-900 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 dark:border-gray-800 rounded-r-2xl
        ${
          isExpanded || isMobileOpen
            ? "w-[290px]"
            : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-2 flex flex-col mb-4 ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        } border-b border-gray-300`}
      >
        <Link
          to="/"
          className="flex flex-col items-center justify-center group p-2"
        >
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <img
                src={Logo}
                alt="Logo"
                className={
                  isExpanded || isHovered || isMobileOpen ? "w-40" : "w-40"
                }
              />
              <h2 className="mt-2 text-xs uppercase text-center leading-[20px] text-[#094C81] dark:text-[#094C81] font-bold">
                የኢትዮጵያ አርቴፊሻል ኢንተለጀንስ ተቋም
              </h2>
              <h2 className="text-xs uppercase text-center leading-[20px] text-[#094C81] dark:text-[#094C81] font-bold">
                Ethiopian Artificial Intelligence
              </h2>
            </>
          ) : (
            <img src={Logo} alt="Logo" className="w-40" />
          )}
        </Link>
      </div>

      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 dark:text-gray-500 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? null : (
                  <HorizontaLDots className="size-6 text-gray-400 dark:text-gray-500" />
                )}
              </h2>
              {renderMenuItems(filteredNavItems)}
            </div>
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;
