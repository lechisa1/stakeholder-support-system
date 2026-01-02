"use client";

import React, { useEffect, useState, useMemo, JSX } from "react";
import { Label } from "../ui/cn/label";
import { Input } from "../ui/cn/input";
import { Button } from "../ui/cn/button";
import { toast } from "sonner";
import {
  XIcon,
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
import { useCreateRoleMutation } from "../../redux/services/roleApi";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/cn/card";

interface CreateRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

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

export const CreateRoleModal: React.FC<CreateRoleModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [expandedResources, setExpandedResources] = useState<Set<string>>(
    new Set()
  );
  const [permissionMatrix, setPermissionMatrix] = useState<PermissionMatrix>(
    {}
  );

  const { data: permissionsData, isLoading: loadingPermissions } =
    useGetPermissionsQuery();
  const [createRole, { isLoading: isCreating }] = useCreateRoleMutation();

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

  const toggleResource = (resource: string) => {
    setExpandedResources((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(resource)) {
        newSet.delete(resource);
      } else {
        newSet.add(resource);
      }
      return newSet;
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
      await createRole({
        name: name.trim(),
        description: description.trim(),
        permission_ids: selectedPermissionIds,
      }).unwrap();

      toast.success("Role created successfully!");
      resetForm();
      onClose();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to create role");
    }
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setPermissionMatrix({});
    setExpandedResources(new Set());
  };

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Shield className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Create New Role
              </h2>
              <p className="text-sm text-gray-600">
                Define role permissions and access levels
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <XIcon className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col h-[calc(90vh-80px)]"
        >
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-gray-900">
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="name"
                      className="text-sm font-medium text-gray-700"
                    >
                      Role Name *
                    </Label>
                    <Input
                      id="name"
                      placeholder="e.g., Project Manager, Developer"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="description"
                      className="text-sm font-medium text-gray-700"
                    >
                      Description
                    </Label>
                    <Input
                      id="description"
                      placeholder="Brief description of the role"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Permission Matrix */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center justify-between">
                  <span>Permission Matrix</span>
                  <div className="flex items-center space-x-2 text-sm">
                    <span className="text-gray-600">Selected:</span>
                    <span className="font-semibold text-blue-600">
                      {getSelectedPermissions().length}
                    </span>
                    <span className="text-gray-400">/</span>
                    <span className="text-gray-600">
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
                  <div className="space-y-2">
                    {resourceGroups.map((group) => {
                      const selectionStatus = getResourceSelectionStatus(
                        group.resource
                      );
                      const isExpanded = expandedResources.has(group.resource);
                      const isAllSelected = selectionStatus === "all";

                      return (
                        <div
                          key={group.resource}
                          className="border border-gray-200 rounded-lg"
                        >
                          {/* Resource Header */}
                          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-t-lg">
                            <div className="flex items-center space-x-3 flex-1">
                              <button
                                type="button"
                                onClick={() => toggleResource(group.resource)}
                                className="p-1 hover:bg-gray-200 rounded"
                              >
                                {isExpanded ? (
                                  <ChevronDown className="h-4 w-4" />
                                ) : (
                                  <ChevronRight className="h-4 w-4" />
                                )}
                              </button>
                              <div className="p-2 bg-white rounded-lg shadow-sm">
                                {group.icon}
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900 capitalize">
                                  {group.resource}
                                </h3>
                                <p className="text-sm text-gray-500">
                                  {group.permissions.length} permissions
                                  available
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <span
                                className={`px-2 py-1 text-xs font-medium border rounded-full ${getSelectionStatusClass(
                                  selectionStatus
                                )}`}
                              >
                                {getSelectionStatusText(selectionStatus)}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  selectAllInResource(
                                    group.resource,
                                    !isAllSelected
                                  )
                                }
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                                  isAllSelected ? "bg-blue-600" : "bg-gray-200"
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

                          {/* Permissions List */}
                          {isExpanded && (
                            <div className="p-4 bg-white rounded-b-lg border-t border-gray-200">
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {group.permissions.map((permission) => (
                                  <label
                                    key={permission.permission_id}
                                    className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors duration-150"
                                  >
                                    <div className="relative">
                                      <input
                                        type="checkbox"
                                        checked={
                                          permissionMatrix[group.resource]?.[
                                            permission.action
                                          ] || false
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
                                          permissionMatrix[group.resource]?.[
                                            permission.action
                                          ]
                                            ? "bg-blue-600 border-blue-600"
                                            : "border-gray-300"
                                        }`}
                                      >
                                        {permissionMatrix[group.resource]?.[
                                          permission.action
                                        ] && (
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
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Footer Actions */}
          <div className="border-t border-gray-200 bg-gray-50 p-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {getSelectedPermissions().length} of{" "}
                {resourceGroups.reduce(
                  (acc, group) => acc + group.permissions.length,
                  0
                )}{" "}
                permissions selected
              </div>
              <div className="flex items-center space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isCreating}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={
                    isCreating ||
                    !name.trim() ||
                    getSelectedPermissions().length === 0
                  }
                  className="min-w-[120px] bg-blue-600 hover:bg-blue-700"
                >
                  {isCreating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating...
                    </>
                  ) : (
                    "Create"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
