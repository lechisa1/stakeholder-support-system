import React, { useCallback, useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Input } from "../ui/cn/input";
import { Button } from "../ui/cn/button";
import { useNavigate, useLocation } from "react-router-dom";
import { PageLayoutProps } from "../../types/layout";
import { FilterPopover } from "./FilterDrawer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectValue,
  SelectTrigger,
} from "../ui/cn/select";

export const PageLayout: React.FC<PageLayoutProps> = ({
  title,
  description,
  toggleActions = [],
  actions = [],
  filters = [],
  children,
  toggle = "table",
  showtoggle = false,
  onToggle = () => {},
  filterColumnsPerRow = 1,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Local state to control input value
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Sync search input with URL query params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setSearchQuery(params.get("search") || "");
  }, [location.search]);

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchQuery(value);

      const params = new URLSearchParams(location.search);
      if (value) {
        params.set("search", value);
      } else {
        params.delete("search");
      }
      params.set("page", "1"); // reset page

      navigate(`${location.pathname}?${params.toString()}`);
    },
    [location.pathname, location.search, navigate]
  );

  return (
    <div className="p-6 border rounded-lg bg-white shadow">
      <div className="space-y-6">
        {/* Page Header - Single Line Layout */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Left side - Title and Description */}
          <div>
            {toggleActions.length > 0 && (
              <div className="flex items-center gap-2  px-3 py-2 rounded-md border border-[#e5e7eb] shadow-sm">
                {toggleActions.map((action, index) => {
                  const isActive = action.variant == "default" ? true : false;

                  return (
                    <button
                      key={index}
                      onClick={action.onClick}
                      className={`
            flex items-center gap-2 px-6 border border-[#e5e7eb] py-2 rounded-md text-sm font-medium
            transition-all duration-300
            ${
              isActive
                ? "bg-[#073954] text-white"
                : "text-[#073954] bg-slate-100 hover:bg-slate-200"
            }
          `}
                    >
                      {action.loading ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      ) : (
                        action.icon && (
                          <span className="h-4 w-4">{action.icon}</span>
                        )
                      )}
                      <span>{action.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          {/* Title and Description */}
          {/* make it to left start of the page */}
          <div className="hidden lg:flex flex-col justify-start items-start mr-auto">
            {title && (
              <div className="text-xl font-bold text-[#094C81]">{title}</div>
            )}
            {description && (
              <div className="text-gray-500 text-sm">{description}</div>
            )}
          </div>


          {/* Right side - Search, Filters, and Actions */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            {showtoggle && (
              <Select
                value={toggle}
                onValueChange={(value: string) => onToggle(value)}
              >
                <SelectTrigger className="w-40 bg-white text-gray-700 border-gray-300 focus:ring-0">
                  <SelectValue placeholder="Table View" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem
                    value="table"
                    className="text-gray-700 hover:bg-gray-200"
                  >
                    Table View
                  </SelectItem>
                  <SelectItem
                    value="hierarchy"
                    className="text-gray-700 hover:bg-gray-200"
                  >
                    Hierarchy View
                  </SelectItem>
                </SelectContent>
              </Select>
            )}
            {/* Filters */}
            {filters.length > 0 && (
              <FilterPopover
                filters={filters}
                columnsPerRow={filterColumnsPerRow}
              />
            )}

            {/* Actions */}
            {actions.length > 0 && (
              <div className="flex items-center space-x-2 text-white">
                {actions.map((action, index) => (
                  <Button
                    key={index}
                    variant={action.variant || "default"}
                    size={
                      ((action.size === "md" ? "default" : action.size) ||
                        "default") as "default" | "sm" | "lg" | "xs" | "icon"
                    }
                    onClick={action.onClick}
                    disabled={action.disabled || action.loading}
                    className="flex items-center space-x-2"
                  >
                    {action.loading ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    ) : (
                      action.icon && (
                        <span className="h-4 w-4">{action.icon}</span>
                      )
                    )}
                    <span>{action.label}</span>
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white">{children}</div>
      </div>
    </div>
  );
};
