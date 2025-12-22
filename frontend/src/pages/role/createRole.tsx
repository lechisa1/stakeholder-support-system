"use client";

import React, { useEffect, useState, useMemo, JSX } from "react";
import { Label } from "../../components/ui/cn/label";
import { Input } from "../../components/ui/cn/input";
import { Button } from "../../components/ui/cn/button";
import { toast } from "sonner";
import {
  Shield,
  Users,
  Folder,
  Settings,
  BarChart3,
  Check,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { useGetPermissionsQuery } from "../../redux/services/permissionApi";
import {
  useCreateRoleMutation,
  useGetRoleByIdQuery,
  useUpdateRoleMutation,
} from "../../redux/services/roleApi";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/cn/card";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Textarea } from "../../components/ui/cn/textarea";
import { AnimatePresence, motion } from "framer-motion";
import DetailHeader from "../../components/common/DetailHeader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/cn/select";
import { useBreadcrumbTitleEffect } from "../../hooks/useBreadcrumbTitleEffect";
import { useAuth } from "../../contexts/AuthContext";

interface Permission {
  permission_id: string;
  resource: string;
  action: string;
  is_active: boolean | null;
}

interface ResourceGroup {
  resource: string;
  icon: JSX.Element;
  permissions: Permission[];
  selected: boolean;
}

interface PermissionMatrix {
  [resource: string]: {
    [action: string]: boolean;
  };
}

export default function CreateRole() {
  const { id } = useParams<{ id?: string }>();
  const { hasAnyPermission } = useAuth();
  const location = useLocation();
  const isEditMode = Boolean(id && id !== "create");
  const updatePermission = hasAnyPermission(["ROLES:UPDATE", "ROLES:CREATE"]);
  // role_type
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [roleType, setRoleType] = useState("");
  const [expandedResource, setExpandedResource] = useState<string | null>(null);
  const navigate = useNavigate();
  const [permissionMatrix, setPermissionMatrix] = useState<PermissionMatrix>(
    {}
  );

  const { data: permissionsData, isLoading: loadingPermissions } =
    useGetPermissionsQuery();

  // Fetch role data if in edit mode
  const {
    data: roleData,
    isLoading: loadingRole,
    isError: roleError,
  } = useGetRoleByIdQuery(id!, { skip: !isEditMode });

  const role = roleData?.data;

  // Set dynamic breadcrumb title when in edit mode
  // Pass the role name when available, or pass undefined (which won't clear if we're still loading)
  // Only pass null when we're definitely not in edit mode to clear the breadcrumb
  useBreadcrumbTitleEffect(
    isEditMode ? role?.name || undefined : null,
    isEditMode && id ? id : undefined
  );

  const [createRole, { isLoading: isCreating }] = useCreateRoleMutation();
  const [updateRole, { isLoading: isUpdating }] = useUpdateRoleMutation();

  const isLoading = isCreating || isUpdating;

  // Group permissions by resource with icons
  const resourceGroups = useMemo((): ResourceGroup[] => {
    if (!permissionsData?.data) return [];

    const activePermissions = permissionsData.data.filter(
      (p: Permission) => p.is_active === true
    );

    const resourceIcons: { [key: string]: JSX.Element } = {
      users: <Users className="h-4 w-4" />,
      roles: <Shield className="h-4 w-4" />,
      projects: <Folder className="h-4 w-4" />,
      issues: <BarChart3 className="h-4 w-4" />,
      system: <Settings className="h-4 w-4" />,
    };

    const grouped = activePermissions.reduce(
      (acc: { [key: string]: Permission[] }, permission) => {
        if (!acc[permission.resource]) {
          acc[permission.resource] = [];
        }
        acc[permission.resource].push(permission);
        return acc;
      },
      {}
    );

    return Object.entries(grouped).map(([resource, permissions]) => ({
      resource,
      icon: resourceIcons[resource] || <Shield className="h-4 w-4" />,
      permissions: permissions as Permission[],
      selected: false,
    }));
  }, [permissionsData]);

  // Initialize permission matrix
  useEffect(() => {
    const matrix: PermissionMatrix = {};
    resourceGroups.forEach((group) => {
      matrix[group.resource] = {};
      group.permissions.forEach((permission) => {
        matrix[group.resource][permission.action] = false;
      });
    });
    setPermissionMatrix(matrix);
  }, [resourceGroups]);

  // Populate form when role data is loaded (edit mode)
  useEffect(() => {
    if (isEditMode && roleData?.data && resourceGroups.length > 0) {
      const role = roleData.data;

      // Normalize role_type to lowercase internal/external
      const type =
        role.role_type?.toLowerCase() === "external" ? "external" : "internal";

      // Set name and description
      setName(role.name || "");
      setDescription(role.description || "");
      setRoleType(type);
      console.log(role.role_type, "role type here");

      // Populate permission matrix with existing permissions
      if (role.rolePermissions && role.rolePermissions.length > 0) {
        const matrix: PermissionMatrix = {};

        // Initialize all to false first
        resourceGroups.forEach((group) => {
          matrix[group.resource] = {};
          group.permissions.forEach((permission) => {
            matrix[group.resource][permission.action] = false;
          });
        });

        // Set selected permissions to true
        role.rolePermissions.forEach((rp: any) => {
          if (rp.permission && rp.is_active) {
            const permissionId = rp.permission.permission_id;
            const permission = resourceGroups
              .flatMap((g) => g.permissions)
              .find((p) => p.permission_id === permissionId);

            if (permission) {
              if (!matrix[permission.resource]) {
                matrix[permission.resource] = {};
              }
              matrix[permission.resource][permission.action] = true;
            }
          }
        });

        setPermissionMatrix(matrix);
      }
    }
  }, [isEditMode, roleData, resourceGroups]);

  const toggleResource = (resource: string) => {
    setExpandedResource((prev) => {
      // If clicking the same resource, collapse it
      if (prev === resource) {
        return null;
      }
      // Otherwise, expand the new resource (this automatically collapses the previous one)
      return resource;
    });
  };

  const togglePermission = (resource: string, action: string) => {
    setPermissionMatrix((prev) => ({
      ...prev,
      [resource]: {
        ...prev[resource],
        [action]: !prev[resource]?.[action],
      },
    }));
  };

  const selectAllInResource = (resource: string, select: boolean) => {
    setPermissionMatrix((prev) => ({
      ...prev,
      [resource]: Object.keys(prev[resource] || {}).reduce((acc, action) => {
        acc[action] = select;
        return acc;
      }, {} as { [key: string]: boolean }),
    }));
  };

  const getSelectedPermissions = (): string[] => {
    const selected: string[] = [];
    Object.entries(permissionMatrix).forEach(([resource, actions]) => {
      Object.entries(actions).forEach(([action, isSelected]) => {
        if (isSelected) {
          const permission = resourceGroups
            .find((g) => g.resource === resource)
            ?.permissions.find((p) => p.action === action);
          if (permission) {
            selected.push(permission.permission_id);
          }
        }
      });
    });
    return selected;
  };

  const getResourceSelectionStatus = (resource: string) => {
    const actions = permissionMatrix[resource] || {};
    const actionsList = Object.values(actions);
    if (actionsList.length === 0) return "none";
    if (actionsList.every((val) => val)) return "all";
    if (actionsList.some((val) => val)) return "some";
    return "none";
  };

  const getSelectionStatusText = (status: string) => {
    switch (status) {
      case "all":
        return "All Selected";
      case "some":
        return "Partial";
      default:
        return "None";
    }
  };

  const getSelectionStatusClass = (status: string) => {
    switch (status) {
      case "all":
        return "bg-green-100 text-green-800 border-green-200";
      case "some":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Role name is required");
      return;
    }

    const selectedPermissionIds = getSelectedPermissions();

    if (selectedPermissionIds.length === 0) {
      toast.error("Please select at least one permission");
      return;
    }

    try {
      if (isEditMode) {
        await updateRole({
          id: id!,
          name: name.trim(),
          description: description.trim(),
          role_type: roleType,
          permission_ids: selectedPermissionIds,
        }).unwrap();

        toast.success("Role updated successfully!");
        navigate("/role");
      } else {
        await createRole({
          name: name.trim(),
          description: description.trim(),
          role_type: roleType,
          permission_ids: selectedPermissionIds,
        }).unwrap();

        toast.success("Role created successfully!");
        resetForm();
        navigate("/role");
      }
    } catch (error: any) {
      toast.error(
        error?.data?.message ||
          `Failed to ${isEditMode ? "update" : "create"} role`
      );
    }
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setRoleType("");
    setPermissionMatrix({});
    setExpandedResource(null);
  };

  // Show loading state while fetching role data
  if (isEditMode && loadingRole) {
    return (
      <div className="w-full flex items-center justify-center bg-white rounded-lg p-4">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#094C81] mx-auto mb-4"></div>
          <p className="text-[#094C81] text-lg">Loading role data...</p>
        </div>
      </div>
    );
  }

  // Show error state if role not found
  if (isEditMode && roleError) {
    return (
      <div className="w-full flex items-center justify-center bg-white rounded-lg p-4">
        <div className="text-center py-12">
          <p className="text-red-600 text-lg mb-4">Role not found</p>
          <Button
            onClick={() => navigate("/role")}
            className="bg-[#094C81] hover:bg-[#073954]"
          >
            Back to Roles
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <DetailHeader
        className="mb-5 mt-2"
        breadcrumbs={[
          { title: "Roles", link: "" },
          { title: isEditMode ? "Edit Role" : "Create New Role", link: "" },
        ]}
      />

      <div className="w-full flex items-center justify-center bg-white rounded-lg p-4">
        <div className=" w-full" onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="flex rounded-t-lg items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {isEditMode ? "Edit Role" : "Create New Role"}
                </h2>
                <p className="text-sm text-gray-600">
                  {isEditMode
                    ? "Update role permissions and access levels"
                    : "Define role permissions and access levels"}
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col  ">
            <div className="flex-1 overflow-y-auto py-5 space-y-6">
              {/* Basic Information */}
              <Card className="">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl w-full mb-2 font-bold text-[#094C81]">
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2 flex col-span-1 flex-col gap-2">
                      <Label
                        htmlFor="name"
                        className="text-sm font-medium text-[#094C81] "
                      >
                        Role Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="name"
                        placeholder="e.g., Project Manager, Developer"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="w-full h-11 border border-gray-300 px-4 py-3 rounded-md focus:ring focus:ring-[#094C81] focus:border-transparent transition-all duration-200 outline-none"
                      />
                    </div>
                    {/* Role Type Dropdown */}
                    <div className="space-y-2 flex col-span-1 flex-col gap-2">
                      <Label
                        htmlFor="role_type"
                        className="text-sm font-medium text-[#094C81]"
                      >
                        Role Type <span className="text-red-500">*</span>
                      </Label>

                      <Select
                        id="role_type"
                        value={roleType}
                        onValueChange={(value) => setRoleType(value)}
                        className="w-[full] border px-4 py-3 border-gray-300 rounded-md focus:ring focus:ring-[#094C81] focus:border-transparent transition-all duration-200 outline-none"
                      >
                        <SelectTrigger className="h-11">
                          <SelectValue
                            placeholder={roleType ? "" : "Select role type"}
                          >
                            {roleType === "internal" && "Internal"}
                            {roleType === "external" && "External"}
                            {!roleType && "Select role type"}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="internal">Internal</SelectItem>
                          <SelectItem value="external">External</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2 flex col-span-1 flex-col gap-2">
                      <Label
                        htmlFor="description"
                        className="text-sm font-medium text-[#094C81] "
                      >
                        Description <span className="text-red-500">*</span>
                      </Label>
                      <Textarea
                        id="description"
                        placeholder="Brief description of the role"
                        rows={4}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full h-11 border border-gray-300 px-4 py-3 rounded-md focus:ring focus:ring-[#094C81] focus:border-transparent transition-all duration-200 outline-none"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Permission Matrix */}
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl w-full pr-1 mb-2 font-bold text-[#094C81] flex items-center justify-between">
                    <span>Permission Matrix</span>
                    <div className="flex items-center space-x-2 text-sm">
                      <span className="text-[#094C81]">Selected:</span>
                      <span className="font-semibold text-[#094C81]">
                        {getSelectedPermissions().length}
                      </span>
                      <span className="text-[#094C81]">/</span>
                      <span className="text-[#094C81]">
                        {resourceGroups.reduce(
                          (acc, group) => acc + group.permissions.length,
                          0
                        )}
                      </span>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingPermissions ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="text-sm text-gray-500 mt-2">
                        Loading permissions...
                      </p>
                    </div>
                  ) : resourceGroups.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No permissions available
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                      {resourceGroups.map((group) => {
                        const selectionStatus = getResourceSelectionStatus(
                          group.resource
                        );
                        const isExpanded = expandedResource === group.resource;
                        const isAllSelected = selectionStatus === "all";

                        return (
                          <div
                            key={group.resource}
                            className="border border-gray-200 rounded-lg self-start"
                          >
                            {/* Resource Header */}
                            <div
                              onClick={() => toggleResource(group.resource)}
                              className="flex  transition-all hover:bg-[#094C81]/10 duration-200 cursor-pointer items-center justify-between p-4 bg-gray-50 rounded-t-lg"
                            >
                              <div className="flex items-center space-x-3 flex-1">
                                <button
                                  type="button"
                                  onClick={() => toggleResource(group.resource)}
                                  className="p-1 hover:bg-gray-200 rounded"
                                >
                                  {isExpanded ? (
                                    <ChevronDown
                                      onClick={() =>
                                        toggleResource(group.resource)
                                      }
                                      className="h-5 w-5 text-[#094C81] hover:text-[#073954] cursor-pointer"
                                    />
                                  ) : (
                                    <ChevronRight
                                      onClick={() =>
                                        toggleResource(group.resource)
                                      }
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
                                    {group.permissions.length} permissions
                                    available
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-3">
                                <span
                                  className={`px-2 py-1 text-xs font-medium border rounded-full text-[#094C81] ${getSelectionStatusClass(
                                    selectionStatus
                                  )}`}
                                >
                                  {getSelectionStatusText(selectionStatus)}
                                </span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    selectAllInResource(
                                      group.resource,
                                      !isAllSelected
                                    );
                                  }}
                                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                                    isAllSelected
                                      ? "bg-green-600"
                                      : "bg-gray-400"
                                  }`}
                                >
                                  <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                                      isAllSelected
                                        ? "translate-x-6"
                                        : "translate-x-1"
                                    }`}
                                  />
                                </button>
                              </div>
                            </div>

                            {/* Permissions List with Animation */}
                            <AnimatePresence>
                              {isExpanded && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.25 }}
                                  className="overflow-hidden"
                                >
                                  <div className="p-4 bg-white rounded-b-lg border-t border-gray-200">
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                      {group.permissions.map((permission) => (
                                        <label
                                          key={permission.permission_id}
                                          className="flex w-full items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors duration-150"
                                        >
                                          <div className="relative">
                                            <input
                                              type="checkbox"
                                              checked={
                                                permissionMatrix[
                                                  group.resource
                                                ]?.[permission.action] || false
                                              }
                                              onChange={() =>
                                                togglePermission(
                                                  group.resource,
                                                  permission.action
                                                )
                                              }
                                              className="sr-only"
                                            />
                                            <div
                                              className={`w-5 h-5 border-2 rounded flex items-center justify-center transition-all duration-200 ${
                                                permissionMatrix[
                                                  group.resource
                                                ]?.[permission.action]
                                                  ? "bg-[#094C81] border-[#094C81]"
                                                  : "border-[#094C81]"
                                              }`}
                                            >
                                              {permissionMatrix[
                                                group.resource
                                              ]?.[permission.action] && (
                                                <Check className="h-3 w-3 text-white" />
                                              )}
                                            </div>
                                          </div>

                                          <span className="text-sm font-medium text-gray-700 capitalize">
                                            {permission.action}
                                          </span>
                                        </label>
                                      ))}
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Footer Actions */}
            {updatePermission && (
              <div className="border-t border-gray-200  p-6">
                <div className="flex items-center justify-end">
                  <div className="flex items-center space-x-3">
                    <Button
                      type="button"
                      variant="outline"
                      className="min-w-[150px] text-[#094C81] text-base bg-gray-200 hover:bg-gray-300"
                      onClick={() => {
                        navigate("/role");
                      }}
                      disabled={isLoading}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={
                        isLoading ||
                        !name.trim() ||
                        getSelectedPermissions().length === 0
                      }
                      className="min-w-[150px] text-base bg-[#094C81] hover:bg-[#073954]"
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          {isEditMode ? "Updating..." : "Creating..."}
                        </>
                      ) : isEditMode ? (
                        "Update"
                      ) : (
                        "Create"
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </>
  );
}
