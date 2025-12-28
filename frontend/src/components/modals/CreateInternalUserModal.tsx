// CreateInternalUserModal for internal users
"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import Input from "../form/input/InputField";

import { Label } from "../ui/cn/label";
import { Button } from "../ui/cn/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui/cn/popover";

import {
  useCreateUserMutation,
  CreateUserDto,
} from "../../redux/services/userApi";

import { Check, XIcon, ChevronDown } from "lucide-react";
import { useGetRolesQuery } from "../../redux/services/roleApi";
import { useGetProjectMetricsQuery } from "../../redux/services/projectMetricApi";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createInternalUserSchema,
  type CreateInternalUserFormData,
} from "../../utils/validation/schemas";

interface CreateInternalUserModalProps {
  user_type_id: string;
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
  projects: unknown[];
  users: unknown[];
}

export const CreateInternalUserModal: React.FC<CreateInternalUserModalProps> = ({
  user_type_id,
  isOpen,
  onClose,
}) => {
  const [selectAll, setSelectAll] = useState(false);

  const {
    data: metricsData,
    isLoading: loadingMetrics,
    isError,
  } = useGetProjectMetricsQuery({});
  const { data: rolesResponse } = useGetRolesQuery({
    role_type: "internal",
  });
  const roles = rolesResponse?.data || [];
  const metrics: ProjectMetric[] = metricsData || [];

  const [createUser, { isLoading }] = useCreateUserMutation();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateInternalUserFormData>({
    resolver: zodResolver(createInternalUserSchema),
    reValidateMode: "onChange",
    defaultValues: {
      full_name: "",
      email: "",
      phone_number: "",
      position: "",
      role_ids: [],
      project_metrics_ids: [],
    },
  });

  const selectedRoles = watch("role_ids") || [];
  const projectMetricsIds = watch("project_metrics_ids") || [];

  // Update selectAll state based on current selection
  useEffect(() => {
    if (metrics.length > 0) {
      setSelectAll(projectMetricsIds.length === metrics.length);
    }
  }, [projectMetricsIds.length, metrics.length]);

  const handleMetricSelect = (metricId: string) => {
    const currentIds = projectMetricsIds || [];
    const newIds = currentIds.includes(metricId)
      ? currentIds.filter((id) => id !== metricId)
      : [...currentIds, metricId];
    setValue("project_metrics_ids", newIds, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setValue("project_metrics_ids", [], {
        shouldValidate: true,
        shouldDirty: true,
      });
      setSelectAll(false);
    } else {
      const allMetricIds = metrics.map((metric) => metric.project_metric_id);
      setSelectAll(true);
      setValue("project_metrics_ids", allMetricIds, {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  };

  const onSubmit = async (data: CreateInternalUserFormData) => {
    const payload: CreateUserDto = {
      full_name: data.full_name,
      email: data.email,
      phone_number: data.phone_number || undefined,
      user_type_id: user_type_id,
      role_ids: data.role_ids || [],
      project_metrics_ids:
        data.project_metrics_ids && data.project_metrics_ids.length > 0
          ? data.project_metrics_ids
          : undefined,
      position: data.position || undefined,
    };

    try {
      await createUser(payload).unwrap();
      toast.success("User created successfully!");
      handleClose();
    } catch (error: unknown) {
      const errorMessage = (error as { data?: { message?: string } })?.data?.message || "Failed to create user";
      toast.error(errorMessage);
    }
  };

  const handleClose = () => {
    reset();
    setSelectAll(false);
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) handleClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-6 rounded-2xl w-full max-w-[700px] shadow-2xl max-h-[90vh] overflow-y-auto"
      >
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
            <div className="space-y-2">
              <Label className="block text-sm text-[#094C81] font-medium mb-2">
                Full Name <span className="text-red-500">*</span>
              </Label>
              <Input
                {...register("full_name")}
                placeholder="John Doe"
                className={`w-full h-12 border px-4 py-3 rounded-md focus:ring focus:ring-[#094C81] focus:border-transparent transition-all duration-200 outline-none ${
                  errors.full_name
                    ? "border-red-300 focus:ring-red-500/20"
                    : "border-gray-300"
                }`}
              />
              {errors.full_name && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.full_name.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label className="block text-sm text-[#094C81] font-medium mb-2">
                Phone Number <span className="text-red-500">*</span>
              </Label>
              <Input
                {...register("phone_number")}
                placeholder="+251 9xxxxxxx"
                className={`w-full h-12 border px-4 py-3 rounded-md focus:ring focus:ring-[#094C81] focus:border-transparent transition-all duration-200 outline-none ${
                  errors.phone_number
                    ? "border-red-300 focus:ring-red-500/20"
                    : "border-gray-300"
                }`}
              />
              {errors.phone_number && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.phone_number.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label className="block text-sm text-[#094C81] font-medium mb-2">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                {...register("email")}
                placeholder="john@example.com"
                className={`w-full h-12 border px-4 py-3 rounded-md focus:ring focus:ring-[#094C81] focus:border-transparent transition-all duration-200 outline-none ${
                  errors.email
                    ? "border-red-300 focus:ring-red-500/20"
                    : "border-gray-300"
                }`}
              />
              {errors.email && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.email.message}
                </p>
              )}
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
                          (rr: { role_id: string; name: string }) => rr.role_id === roleId
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
                                const newRoles = selectedRoles.filter(
                                  (id) => id !== roleId
                                );
                                setValue("role_ids", newRoles, {
                                  shouldValidate: true,
                                  shouldDirty: true,
                                });
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
                      .filter((r: { role_id: string; name: string }) => !selectedRoles.includes(r.role_id))
                      .map((r: { role_id: string; name: string }) => (
                        <button
                          key={r.role_id}
                          type="button"
                          onClick={() => {
                            const newRoles = [...selectedRoles, r.role_id];
                            setValue("role_ids", newRoles, {
                              shouldValidate: true,
                              shouldDirty: true,
                            });
                          }}
                          className="w-full text-left px-3 py-2 text-sm text-[#094C81] hover:bg-[#094C81]/10 rounded-md cursor-pointer transition-colors"
                        >
                          <span className="block truncate">{r.name}</span>
                        </button>
                      ))}
                    {roles.filter((r: { role_id: string; name: string }) => !selectedRoles.includes(r.role_id)).length === 0 && (
                      <div className="px-3 py-2 text-sm text-gray-400 text-center">
                        All roles selected
                      </div>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
              {errors.role_ids && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.role_ids.message}
                </p>
              )}
            </div>
          </div>
          {/* metrics panel */}
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
            {errors.project_metrics_ids && (
              <p className="text-xs text-red-500 mt-2">
                {errors.project_metrics_ids.message}
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
          <Button variant="outline" onClick={handleClose} type="button">
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || isLoading}
            className="min-w-24"
          >
            {isLoading ? "Creating..." : "Create"}
          </Button>
        </div>
      </form>
    </div>
  );
};

