// Updated CreateUserModal with normal div modal instead of Dialog
"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { Input } from "../ui/cn/input";
import { Label } from "../ui/cn/label";
import { Button } from "../ui/cn/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../ui/cn/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui/cn/popover";

import {
  useCreateUserMutation,
  CreateUserDto,
} from "../../redux/services/userApi";

import {
  useGetInstitutesQuery,
  Institute,
} from "../../redux/services/instituteApi";
import { Check, XIcon, ChevronDown } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { getUserPositionId } from "../../utils/helper/userPosition";
import { useGetRolesQuery } from "../../redux/services/roleApi";
import { useGetProjectMetricsQuery } from "../../redux/services/projectMetricApi";

interface CreateUserModalProps {
  logged_user_type: string;
  user_type: string;
  user_type_id: string;
  inistitute_id: string;
  isOpen: boolean;
  onClose: () => void;
}

interface ProjectMetric {
  project_metric_id: string;
  name: string;
  description: string;
  weight: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  projects: any[];
  users: any[];
}

export const CreateUserModal: React.FC<CreateUserModalProps> = ({
  logged_user_type,
  user_type,
  user_type_id,
  inistitute_id,
  isOpen,
  onClose,
}) => {
  const { user } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [projectMetricsIds, setProjectMetricsIds] = useState<string[]>([]);
  const [position, setPosition] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [instituteId, setInstituteId] = useState<string>("");
  const [selectAll, setSelectAll] = useState(false);

  const { data: institutes, isLoading: loadingInstitutes } =
    useGetInstitutesQuery();
  const {
    data: metricsData,
    isLoading: loadingMetrics,
    isError,
  } = useGetProjectMetricsQuery({});
  const { data: rolesResponse } = useGetRolesQuery({
    role_type: user_type == "internal_user" ? "internal" : "external",
  });
  const roles = rolesResponse?.data || [];
  const metrics: ProjectMetric[] = metricsData || [];

  const [createUser, { isLoading }] = useCreateUserMutation();

  // Set initial ID on modal open
  useEffect(() => {
    const id = user?.institute?.institute_id || inistitute_id || "";
    setInstituteId(id);
  }, [user, inistitute_id, isOpen]);
  const positionId = getUserPositionId(logged_user_type, user_type, true);

  // Update selectAll state based on current selection
  useEffect(() => {
    if (metrics.length > 0) {
      setSelectAll(projectMetricsIds.length === metrics.length);
    }
  }, [projectMetricsIds, metrics]);

  const handleMetricSelect = (metricId: string) => {
    setProjectMetricsIds((prev) => {
      if (prev.includes(metricId)) {
        return prev.filter((id) => id !== metricId);
      } else {
        return [...prev, metricId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectAll) {
      // Deselect all
      setProjectMetricsIds([]);
      setSelectAll(false);
    } else {
      // Select all
      const allMetricIds = metrics.map((metric) => metric.project_metric_id);
      setProjectMetricsIds(allMetricIds);
      setSelectAll(true);
    }
  };

  const handleSubmit = async () => {
    if (!fullName || !email || !user_type_id || !selectedRoles.length) {
      toast.error("Please fill all required fields");
      return;
    }

    if (user_type === "external_user") {
      const finalInstituteId = user?.institute?.institute_id || instituteId;
      if (!finalInstituteId) {
        toast.error("Please select an institute for external users");
        return;
      }
    }
    if (user_type === "internal_user") {
      if (projectMetricsIds.length === 0) {
        toast.error(
          "Please select at least one project metric for internal users"
        );
        return;
      }
    }
    const finalInstituteId = user?.institute?.institute_id || instituteId;

    const payload: CreateUserDto = {
      full_name: fullName,
      email,
      phone_number: phoneNumber || undefined,
      user_type_id: user_type_id,
      role_ids: selectedRoles || [],
      project_metrics_ids:
        projectMetricsIds.length > 0 ? projectMetricsIds : undefined,
      position: position || undefined,
      ...(user_type === "external_user" && {
        institute_id: finalInstituteId,
        user_position_id: positionId,
      }),
    };

    try {
      await createUser(payload).unwrap();
      toast.success("User created successfully!");
      handleClose();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to create user");
    }
  };

  const handleClose = () => {
    setFullName("");
    setEmail("");
    setPhoneNumber("");
    setPosition("");
    setIsActive(true);
    setInstituteId("");
    setProjectMetricsIds([]);
    setSelectAll(false);
    setSelectedRoles([]);
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) handleClose();
  };

  if (!isOpen) return null;

  // Determine if institute selection should be shown
  const showInstituteSelect =
    logged_user_type === "internal_user" && user_type === "external_user";
  const showMetricsSelect =
    logged_user_type === "internal_user" && user_type === "internal_user";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="bg-white p-6 rounded-2xl w-full max-w-[700px] shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-[#094C81]">Create User</h2>
          <button
            onClick={handleClose}
            className="text-[#094C81] hover:text-gray-600 transition"
          >
            <XIcon className="w-6 h-6 cursor-pointer" />
          </button>
        </div>

        {/* Content */}
        <div className="w-full flex flex-col space-y-4">
          {/* User Detail */}
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4  mt-2 pr-2">
            {showInstituteSelect && (
              <div className="space-y-2">
                <Label className="block text-sm text-[#094C81] font-medium mb-2">
                  Institute <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={instituteId}
                  onValueChange={setInstituteId}
                  disabled={loadingInstitutes}
                >
                  <SelectTrigger className="w-[300px] h-12 border border-gray-300 px-4 py-3 rounded-md focus:ring focus:ring-[#094C81] focus:border-transparent transition-all duration-200 outline-none">
                    <SelectValue
                      className="text-sm text-[#094C81] font-medium"
                      placeholder="Select Institute"
                    />
                  </SelectTrigger>
                  <SelectContent className="text-sm bg-white text-[#094C81] font-medium">
                    {institutes?.map((inst: Institute) => (
                      <SelectItem
                        className="text-sm text-[#094C81] font-medium"
                        key={inst.institute_id}
                        value={inst.institute_id}
                      >
                        {inst.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <Label className="block text-sm text-[#094C81] font-medium mb-2">
                Full Name <span className="text-red-500">*</span>
              </Label>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                className="w-full h-12 border border-gray-300 px-4 py-3 rounded-md focus:ring focus:ring-[#094C81] focus:border-transparent transition-all duration-200 outline-none"
              />
            </div>
            <div className="space-y-2">
              <Label className="block text-sm text-[#094C81] font-medium mb-2">
                Phone Number <span className="text-red-500">*</span>
              </Label>
              <Input
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+251 9xxxxxxx"
                className="w-full h-12 border border-gray-300 px-4 py-3 rounded-md focus:ring focus:ring-[#094C81] focus:border-transparent transition-all duration-200 outline-none"
              />
            </div>
            <div className="space-y-2">
              <Label className="block text-sm text-[#094C81] font-medium mb-2">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
                className="w-full h-12 border border-gray-300 px-4 py-3 rounded-md focus:ring focus:ring-[#094C81] focus:border-transparent transition-all duration-200 outline-none"
              />
            </div>
            {/* ROLE MULTI SELECT */}

            <div className="w-full space-y-2">
              <Label className="text-sm font-medium text-[#094C81]">
                Role <span className="text-red-500">*</span>
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="w-full max-h-28 min-h-12 h-fit border border-gray-300 p-2 rounded-md mt-1 text-[#094C81] bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#094C81] focus:ring-offset-2 transition-all duration-200"
                  >
                    <div className="flex flex-wrap items-center gap-2 w-full">
                      {selectedRoles.length === 0 && (
                        <span className="text-sm w-full justify-between text-gray-400 flex items-center gap-2">
                          Select Role
                          <ChevronDown className="h-4 w-4 ml-auto" />
                        </span>
                      )}

                      {selectedRoles.map((roleId) => {
                        const r = roles.find(
                          (rr: any) => rr.role_id === roleId
                        );
                        if (!r) return null;

                        return (
                          <span
                            key={roleId}
                            className="inline-flex items-center gap-1 rounded-md justify-center bg-[#094C81]/10 text-[#094C81] px-2 py-1 text-xs"
                          >
                            <span className="truncate max-w-[120px]">
                              {r.name}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedRoles((prev) =>
                                  prev.filter((id) => id !== roleId)
                                );
                              }}
                              className="flex h-4 w-4 items-center justify-center rounded-full hover:bg-[#094C81]/20 transition-colors"
                              aria-label={`Remove ${r.name}`}
                            >
                              <XIcon className="h-3 w-3" />
                            </button>
                          </span>
                        );
                      })}
                      {selectedRoles.length > 0 && (
                        <ChevronDown className="h-4 w-4 ml-auto text-gray-400" />
                      )}
                    </div>
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-[300px] p-2 bg-white"
                  align="start"
                >
                  <div className="max-h-64 overflow-y-auto">
                    {roles
                      .filter((r: any) => !selectedRoles.includes(r.role_id))
                      .map((r: any) => (
                        <button
                          key={r.role_id}
                          type="button"
                          onClick={() => {
                            setSelectedRoles((prev) => [...prev, r.role_id]);
                          }}
                          className="w-full text-left px-3 py-2 text-sm text-[#094C81] hover:bg-[#094C81]/10 rounded-md cursor-pointer transition-colors"
                        >
                          <span className="block truncate">{r.name}</span>
                        </button>
                      ))}
                    {roles.filter((r: any) => !selectedRoles.includes(r.role_id)).length === 0 && (
                      <div className="px-3 py-2 text-sm text-gray-400 text-center">
                        All roles selected
                      </div>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
          {/* metrics panel */}
          {showMetricsSelect && (
            <div className="w-full border border-gray-200 flex flex-col gap-4 p-5 shadow-sm rounded-lg">
              {/* Header with count */}
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-[#094C81] font-semibold text-lg">
                    User Skills
                  </h3>
                </div>
                {/* Global Select All Checkbox */}
                {metrics.length > 0 && (
                  <div
                    className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-[#094C81]/10 cursor-pointer transition-all duration-200 border border-gray-200 bg-white"
                    onClick={handleSelectAll}
                  >
                    <div
                      className={`w-4 h-4 border-2 rounded flex items-center justify-center transition-all duration-200 ${
                        selectAll
                          ? "bg-[#094C81] border-[#094C81] text-white"
                          : "border-gray-300 bg-white"
                      }`}
                    >
                      {selectAll ? (
                        <Check className="w-3 h-3 stroke-3" />
                      ) : null}
                    </div>
                    <span className="font-medium text-sm text-[#094C81]">
                      Select All
                    </span>
                  </div>
                )}
              </div>

              {loadingMetrics ? (
                <div className="text-center py-8 text-gray-500 text-sm">
                  <div className="animate-pulse">Loading skills...</div>
                </div>
              ) : isError ? (
                <div className="text-center py-8 text-red-500 text-sm bg-red-50 rounded-md border border-red-200">
                  Failed to load skills. Please try again.
                </div>
              ) : metrics.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-sm bg-gray-50 rounded-md border border-gray-200">
                  No skills available
                </div>
              ) : (
                <div className="relative">
                  {/* Scrollable container with better height */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 max-h-[400px] overflow-y-auto overflow-x-hidden pr-2 pb-2 custom-scrollbar">
                    {/* Metrics List */}
                    {metrics.map((metric) => (
                      <div
                        key={metric.project_metric_id}
                        className={`flex items-center gap-2.5 p-2.5 border rounded-md cursor-pointer transition-all duration-200 ${
                          projectMetricsIds.includes(metric.project_metric_id)
                            ? "bg-[#094C81]/10 border-[#094C81] shadow-sm"
                            : "bg-white border-gray-200 hover:border-[#094C81]/50 hover:bg-gray-50"
                        }`}
                        onClick={() =>
                          handleMetricSelect(metric.project_metric_id)
                        }
                      >
                        <div
                          className={`w-4 h-4 border-2 rounded flex items-center justify-center transition-all duration-200 shrink-0 ${
                            projectMetricsIds.includes(metric.project_metric_id)
                              ? "bg-[#094C81] border-[#094C81] text-white"
                              : "border-gray-300 bg-white"
                          }`}
                        >
                          {projectMetricsIds.includes(
                            metric.project_metric_id
                          ) ? (
                            <Check className="w-2.5 h-2.5 stroke-3" />
                          ) : null}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div
                            className="font-medium text-xs text-gray-900 truncate leading-tight"
                            title={metric.name}
                          >
                            {metric.name}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Scroll indicator hint for many items */}
                  {metrics.length > 12 && (
                    <div className="absolute bottom-0 left-0 right-2 h-8 bg-gradient-to-t from-gray-50/50 to-transparent pointer-events-none rounded-b-lg" />
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="min-w-24"
          >
            {isLoading ? "Creating..." : "Create"}
          </Button>
        </div>
      </div>
    </div>
  );
};
