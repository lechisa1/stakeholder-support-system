"use client";

import React, { useEffect, useState, useMemo, useCallback, JSX } from "react";
import {
  Shield,
  Activity,
  RefreshCw,
  Search,
  Settings,
  ChevronDown,
  ChevronRight,
  Users,
  Folder,
  BarChart3,
} from "lucide-react";
import { Button } from "../../ui/cn/button";
import { PageLayout } from "../../common/PageLayout";
import {
  useGetPermissionsQuery,
  useTogglePermissionMutation,
} from "../../../redux/services/permissionApi";
import { AnimatePresence, motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/cn/card";
import { Input } from "../../ui/cn/input";
import { MdToggleOff, MdToggleOn } from "react-icons/md";
import { useAuth } from "../../../contexts/AuthContext";
// Types
interface Permission {
  permission_id: string;
  resource: string;
  action: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

interface PermissionStats {
  total: number;
  active: number;
  inactive: number;
}

interface ResourceGroup {
  resource: string;
  icon: JSX.Element;
  permissions: Permission[];
  isExpanded: boolean;
  activeCount: number;
  totalCount: number;
}

// Loading Skeleton Component
const Skeleton: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`bg-gray-200 animate-pulse rounded ${className}`} />
);

// Empty State Component
const EmptyState: React.FC<{
  title: string;
  description: string;
  action?: React.ReactNode;
}> = ({ title, description, action }) => (
  <div className="text-center py-12">
    <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
      <Shield className="h-10 w-10 text-gray-400" />
    </div>
    <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600 max-w-md mx-auto mb-6">{description}</p>
    {action}
  </div>
);

// Statistics Component
const PermissionStats: React.FC<{ stats: PermissionStats }> = ({ stats }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
    {/* Total Card */}
    <Card className="bg-white border border-gray-200 rounded-lg shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">
              Total Permissions
            </p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg">
            <Shield className="h-6 w-6 text-blue-600" />
          </div>
        </div>
      </CardContent>
    </Card>

    {/* Active Card */}
    <Card className="bg-white border border-gray-200 rounded-lg shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Active</p>
            <p className="text-2xl font-bold text-green-600">{stats.active}</p>
          </div>
          <div className="p-3 bg-green-50 rounded-lg">
            <Activity className="h-6 w-6 text-green-600" />
          </div>
        </div>
      </CardContent>
    </Card>

    {/* Inactive Card */}
    <Card className="bg-white border border-gray-200 rounded-lg shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Inactive</p>
            <p className="text-2xl font-bold text-red-600">{stats.inactive}</p>
          </div>
          <div className="p-3 bg-red-50 rounded-lg">
            <Settings className="h-6 w-6 text-red-600" />
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

// Permission Item Component
const PermissionItem: React.FC<{
  permission: Permission;
  onToggle: (id: string) => Promise<void>;
  isToggling: boolean;
}> = ({ permission, onToggle, isToggling }) => {
  const { hasAnyPermission } = useAuth();
  const isActive = !!permission.is_active;

  const handleToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await onToggle(permission.permission_id);
  };

  const togglePermission = hasAnyPermission(["PERMISSIONS:UPDATE"]);

  return (
    <div className="flex items-center justify-between py-1 px-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
      <div className="flex items-center space-x-3 flex-1">
        <span className="text-sm font-medium text-gray-700 capitalize">
          {permission.action.replace("_", " ")}
        </span>
      </div>

      {togglePermission ? (
        <button
          className={` p-0 transition-all duration-200 ${
            isActive ? " text-green-700" : "   text-red-700"
          }`}
          onClick={handleToggle}
          disabled={isToggling}
          title={isActive ? "Deactivate permission" : "Activate permission"}
        >
          {isToggling ? (
            <div className="w-10 h-10 flex items-center justify-center">
              <div className="h-6 w-6 border-2 border-current border-t-transparent rounded-full animate-spin" />
            </div>
          ) : isActive ? (
            <MdToggleOn className="h-10 w-10 " />
          ) : (
            <MdToggleOff className="h-10 w-10 " />
          )}
        </button>
      ) : (
        <div
          className={`w-10 h-10 flex items-center justify-center ${
            isActive ? "text-green-700" : "text-red-700"
          } opacity-50`}
        ></div>
      )}
    </div>
  );
};

// Resource Group Component
const ResourceGroup: React.FC<{
  group: ResourceGroup;
  onToggle: (id: string) => Promise<void>;
  isToggling: boolean;
  onToggleExpand: (resource: string) => void;
}> = ({ group, onToggle, isToggling, onToggleExpand }) => {
  const isAllActive = group.activeCount === group.totalCount;
  const isSomeActive =
    group.activeCount > 0 && group.activeCount < group.totalCount;

  const getSelectionStatusText = () => {
    if (isAllActive) return "All Active";
    if (isSomeActive) return "Partial";
    return "All Inactive";
  };

  const getSelectionStatusClass = () => {
    if (isAllActive) return "bg-green-100 text-green-800 border-green-200";
    if (isSomeActive) return "bg-yellow-100 text-yellow-800 border-yellow-200";
    return "bg-gray-100 text-gray-600 border-gray-200";
  };

  return (
    <div className="border border-gray-200 rounded-lg self-start">
      {/* Resource Header */}
      <div
        onClick={() => onToggleExpand(group.resource)}
        className="flex transition-all hover:bg-[#094C81]/10 duration-200 cursor-pointer items-center justify-between p-4 bg-gray-50 rounded-t-lg"
      >
        <div className="flex items-center space-x-3 flex-1">
          <button
            type="button"
            onClick={() => onToggleExpand(group.resource)}
            className="p-1 hover:bg-gray-200 rounded"
          >
            {group.isExpanded ? (
              <ChevronDown
                onClick={() => onToggleExpand(group.resource)}
                className="h-5 w-5  text-[#094C81] hover:text-[#073954] cursor-pointer"
              />
            ) : (
              <ChevronRight
                onClick={() => onToggleExpand(group.resource)}
                className="h-5 w-5 text-[#094C81] hover:text-[#073954] cursor-pointer"
              />
            )}
          </button>
          <div className="p-2 text-[#094C81] bg-white rounded-lg shadow-sm">
            {group.icon}
          </div>
          <div>
            <h3 className="font-semibold text-[#094C81] capitalize">
              {group.resource}
            </h3>
            <p className="text-sm text-[#094C81]">
              {group.totalCount} permissions • {group.activeCount} active
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <span
            className={`px-2 py-1 text-xs font-medium border rounded-full text-[#094C81] ${getSelectionStatusClass()}`}
          >
            {getSelectionStatusText()}
          </span>
        </div>
      </div>

      {/* Permissions List with Animation */}
      <AnimatePresence>
        {group.isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="p-4 bg-white rounded-b-lg border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {group.permissions.map((permission) => (
                  <PermissionItem
                    key={permission.permission_id}
                    permission={permission}
                    onToggle={onToggle}
                    isToggling={isToggling}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Loading Skeleton
const PermissionSkeleton: React.FC = () => (
  <div className="space-y-4">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm"
        >
          <Skeleton className="h-8 w-20 mb-2" />
          <Skeleton className="h-6 w-12" />
        </div>
      ))}
    </div>
    {[...Array(3)].map((_, i) => (
      <div
        key={i}
        className="border border-gray-200 rounded-lg overflow-hidden"
      >
        <div className="p-4 bg-gray-50">
          <Skeleton className="h-6 w-32 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="p-4 space-y-3">
          {[...Array(2)].map((_, j) => (
            <div key={j} className="flex items-center space-x-4">
              <Skeleton className="h-12 w-12 rounded-lg" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-8 w-8 rounded-md" />
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
);

export default function PermissionList() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [expandedResource, setExpandedResource] = useState<string | null>(null);

  const { data, isLoading, isError, refetch } = useGetPermissionsQuery();
  const [togglePermissionMutation, { isLoading: isToggling }] =
    useTogglePermissionMutation();

  // Resource icons mapping
  const resourceIcons: { [key: string]: JSX.Element } = {
    users: <Users className="h-4 w-4" />,
    roles: <Shield className="h-4 w-4" />,
    projects: <Folder className="h-4 w-4" />,
    issues: <BarChart3 className="h-4 w-4" />,
    system: <Settings className="h-4 w-4" />,
  };

  // Calculate statistics
  const stats: PermissionStats = useMemo(
    () => ({
      total: permissions.length,
      active: permissions.filter((p) => p.is_active).length,
      inactive: permissions.filter((p) => !p.is_active).length,
    }),
    [permissions]
  );

  const togglePermission = useCallback(
    async (id: string) => {
      try {
        await togglePermissionMutation(id).unwrap();
      } catch (err) {
        console.error("Toggle permission failed", err);
      }
    },
    [togglePermissionMutation]
  );

  // Process API data
  useEffect(() => {
    if (!isError && !isLoading && data) {
      const normalized = data.data.map((p: any) => ({
        ...p,
        is_active: p.is_active ?? false,
      }));
      setPermissions(normalized);
    }
  }, [data, isError, isLoading]);

  // Group permissions by resource
  const resourceGroups = useMemo(() => {
    const grouped = permissions.reduce((acc, permission) => {
      if (!acc[permission.resource]) {
        acc[permission.resource] = [];
      }
      acc[permission.resource].push(permission);
      return acc;
    }, {} as Record<string, Permission[]>);

    return Object.entries(grouped).map(([resource, permissions]) => {
      const activeCount = permissions.filter((p) => p.is_active).length;
      return {
        resource,
        icon: resourceIcons[resource] || <Shield className="h-4 w-4" />,
        permissions,
        isExpanded: expandedResource === resource,
        activeCount,
        totalCount: permissions.length,
      };
    });
  }, [permissions, expandedResource]);

  // Filtered resource groups with search
  const filteredResourceGroups = useMemo(() => {
    let filtered = resourceGroups;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (group) =>
          group.resource.toLowerCase().includes(query) ||
          group.permissions.some((p) => p.action.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [resourceGroups, searchQuery]);

  const toggleResourceExpand = useCallback((resource: string) => {
    setExpandedResource((prev) => {
      // If clicking the same resource, collapse it
      if (prev === resource) {
        return null;
      }
      // Otherwise, expand the new resource (this automatically collapses the previous one)
      return resource;
    });
  }, []);

  const handleRefresh = () => {
    refetch();
  };

  if (isLoading) {
    return (
      <PageLayout>
        <PermissionSkeleton />
      </PageLayout>
    );
  }

  if (isError) {
    return (
      <div className="w-full">
        <EmptyState
          title="Unable to load permissions"
          description="There was an error loading the permissions data. Please try again."
          action={
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="w-full flex items-center justify-center bg-white rounded-lg p-4">
      <div className="w-full ">
        {/* Header */}
        <div className="flex mb-10 rounded-t-lg items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Shield className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Permission Management
              </h2>
              <p className="text-sm text-gray-600">
                Manage and configure system permissions
              </p>
            </div>
          </div>
        </div>
        {/* Permissions Accordion */}
        <Card className="w-full">
          <CardHeader className="pb-4 w-full">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center space-x-2 w-full">
                <CardTitle className="text-xl font-bold text-[#094C81]">
                  Permissions List
                </CardTitle>
              </div>
              <div className="flex flex-col w-full items-end">
                <div className="relative ">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#094C81]" />
                  <Input
                    type="text"
                    placeholder="Search permissions "
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 h-11 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#094C81] focus:border-[#094C81] outline-none transition-colors text-sm text-gray-700"
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredResourceGroups.length === 0 ? (
              <EmptyState
                title="No permissions found"
                description={
                  searchQuery
                    ? "Try adjusting your search criteria."
                    : "No permissions have been configured yet."
                }
                action={
                  searchQuery && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchQuery("");
                      }}
                    >
                      Clear search
                    </Button>
                  )
                }
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                {filteredResourceGroups.map((group) => (
                  <ResourceGroup
                    key={group.resource}
                    group={group}
                    onToggle={togglePermission}
                    isToggling={isToggling}
                    onToggleExpand={toggleResourceExpand}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
