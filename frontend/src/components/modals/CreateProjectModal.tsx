"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Label } from "../ui/cn/label";
import { Button } from "../ui/cn/button";
import DatePicker from "react-datepicker";
import { useCreateProjectMutation } from "../../redux/services/projectApi";
import { XIcon, CalendarIcon, Check } from "lucide-react";

// Import react-datepicker styles
import "react-datepicker/dist/react-datepicker.css";
import { useGetProjectMetricsQuery } from "../../redux/services/projectMetricApi";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  projectSchema,
  type ProjectFormData,
} from "../../utils/validation/schemas";
import TextArea from "../form/input/TextArea";
import Input from "../form/input/InputField";

interface CreateProjectModalProps {
  instituteId: string;
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

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  instituteId,
  isOpen,
  onClose,
}) => {
  const [isActive, setIsActive] = useState(true);
  const [selectAll, setSelectAll] = useState(false);

  const [createProject, { isLoading }] = useCreateProjectMutation();
  const {
    data: metricsData,
    isLoading: loadingMetrics,
    isError,
  } = useGetProjectMetricsQuery({});
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: "",
      description: "",
      is_active: true,
      maintenance_start: undefined,
      maintenance_end: undefined,
      project_metrics_ids: [],
    },
  });
  const maintenanceStart = watch("maintenance_start");
  const maintenanceEnd = watch("maintenance_end");
  const projectMetricsIds = watch("project_metrics_ids") || [];

  const metrics: ProjectMetric[] = metricsData?.data || [];

  // Update selectAll state based on current selection
  useEffect(() => {
    if (metrics.length > 0) {
      setSelectAll(projectMetricsIds.length === metrics.length);
    }
  }, [projectMetricsIds, metrics]);

  // Fix setProjectMetricsIds to use setValue:
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
  const handleClose = () => {
    reset();
    onClose();
  };
  const onSubmit = async (data: ProjectFormData) => {
    const payload = {
      name: data.name,
      description: data.description || undefined,
      is_active: data.is_active ?? true,
      institute_id: instituteId || undefined,
      maintenance_start: data.maintenance_start
        ? data.maintenance_start.toISOString().split("T")[0]
        : undefined,
      maintenance_end: data.maintenance_end
        ? data.maintenance_end.toISOString().split("T")[0]
        : undefined,
      project_metrics_ids:
        (data.project_metrics_ids?.length ?? 0) > 0
          ? data.project_metrics_ids
          : undefined,
    };

    try {
      await createProject(payload).unwrap();
      // console.log("payload: ", payload);
      toast.success("Project created successfully!");
      handleClose();
    } catch (error: unknown) {
      toast.error(error?.data?.message || "Failed to create project");
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) handleClose();
  };

  const CustomDateInput = React.forwardRef<HTMLInputElement, any>(
    ({ value, onClick, onChange, onBlur, error }, ref) => (
      <div className="relative w-full">
        <input
          type="text"
          value={value || ""}
          onChange={onChange}
          onBlur={onBlur}
          onClick={onClick}
          ref={ref}
          placeholder="MM/DD/YYYY"
          className={`w-full min-w-[330px] h-12 px-4 py-2 pr-10 rounded-md shadow-sm outline-none transition-all duration-200 bg-white text-gray-900
            ${
              error
                ? "border border-red-300 focus:ring-2 focus:ring-red-500/20 focus:border-red-400"
                : "border border-gray-300 focus:ring-2 focus:ring-[#094C81]/20 focus:border-[#094C81]"
            }
          `}
        />
        <button
          type="button"
          onClick={onClick}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
          tabIndex={-1}
        >
          <CalendarIcon className="w-4 h-4" />
        </button>
      </div>
    )
  );
  CustomDateInput.displayName = "CustomDateInput";

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity duration-200"
      onClick={handleBackdropClick}
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-6 rounded-2xl w-full max-w-[800px] shadow-2xl transform transition-all duration-200"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[24px] font-bold text-[#094C81]">
            Create Project
          </h2>
          <button
            onClick={handleClose}
            className="text-[#094C81] hover:text-gray-600 transition-colors duration-200"
          >
            <XIcon className="w-6 h-6 cursor-pointer" />
          </button>
        </div>
        <div className="flex flex-col gap-6">
          <div className="flex w-full gap-4">
            {/* Left Panel: Project Info (without title) */}

            <div className="w-1/2 border flex flex-col gap-6 p-4 shadow-sm rounded-md">
              <h3 className="text-[#094C81] font-semibold text-lg ">
                Project Info
              </h3>
              <div className="w-full">
                <Label className="block text-sm text-[#094C81] font-medium mb-2">
                  Project Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="Enter project name"
                  {...register("name")}
                  error={!!errors.name}
                  hint={errors.name?.message}
                />
              </div>

              <div className="w-full">
                <Label className="block text-sm text-[#094C81] font-medium mb-2">
                  Description
                </Label>
                <TextArea
                  id="description"
                  placeholder="Project description"
                  value={watch("description") || ""}
                  onChange={(value) => {
                    setValue("description", value);
                    trigger("description");
                  }}
                  error={!!errors.description}
                  hint={errors.description?.message}
                  className="w-full min-h-[40px] max-w-[350px]"
                />
              </div>
            </div>

            {/* Right Panel: Maintenance Timeline (keep title) */}
            <div className="w-1/2 border flex flex-col gap-6 p-4 shadow-sm rounded-md">
              <h3 className="text-[#094C81] font-semibold text-lg ">
                Maintenance and Support Timeline
              </h3>

              <div className="w-full">
                <div className="w-full">
                  <Label className="block text-sm text-[#094C81] font-medium mb-2">
                    Start Date
                  </Label>
                  <DatePicker
                    selected={maintenanceStart}
                    onChange={(date) =>
                      setValue("maintenance_start", date ?? undefined, {
                        shouldValidate: true,
                        shouldDirty: true,
                      })
                    }
                    selectsStart
                    startDate={maintenanceStart}
                    endDate={maintenanceEnd}
                    minDate={new Date()}
                    customInput={
                      <CustomDateInput error={!!errors.maintenance_start} />
                    }
                    dateFormat="MM/dd/yyyy"
                  />
                </div>
                {errors.maintenance_start && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.maintenance_start.message}
                  </p>
                )}
              </div>
              <div className="w-full">
                <div className="w-full">
                  <Label className="block text-sm text-[#094C81] font-medium mb-2">
                    End Date
                  </Label>
                  <DatePicker
                    selected={maintenanceEnd}
                    onChange={(date) =>
                      setValue("maintenance_end", date ?? undefined, {
                        shouldValidate: true,
                        shouldDirty: true,
                      })
                    }
                    selectsEnd
                    startDate={maintenanceStart}
                    endDate={maintenanceEnd}
                    minDate={maintenanceStart || new Date()}
                    customInput={
                      <CustomDateInput error={!!errors.maintenance_end} />
                    }
                    dateFormat="MM/dd/yyyy"
                  />
                </div>

                {errors.maintenance_end && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.maintenance_end.message}
                  </p>
                )}
              </div>
            </div>
          </div>
          {/* Bottom Panel: Project Metrics Selection */}
          <div className="w-full border border-gray-200 flex flex-col  p-5 shadow-sm rounded-lg">
            {/* Header with count */}
            <div className="flex mb-5 items-center justify-between ">
              <div className="flex items-center gap-3">
                <h3 className="text-[#094C81] font-semibold text-lg">
                  Project Human Resources
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
                    {selectAll ? <Check className="w-3 h-3 stroke-3" /> : null}
                  </div>
                  <span className="font-medium text-sm text-[#094C81]">
                    Select All
                  </span>
                </div>
              )}
            </div>

            {loadingMetrics ? (
              <div className="text-center py-8 text-gray-500 text-sm">
                <div className="animate-pulse">Loading human resources...</div>
              </div>
            ) : isError ? (
              <div className="text-center py-8 text-red-500 text-sm bg-red-50 rounded-md border border-red-200">
                Failed to load human resources. Please try again.
              </div>
            ) : metrics.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm bg-gray-50 rounded-md border border-gray-200">
                No human resources available
              </div>
            ) : (
              <div className="relative">
                {/* Scrollable container with better height */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 max-h-[400px] overflow-y-auto overflow-x-hidden pr-2 pb-2 custom-scrollbar">
                  {/* Human Resources List */}
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
                          className="font-medium text-sm text-gray-900 truncate leading-tight"
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

        <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting || isLoading}>
            {isLoading ? "Creating..." : "Create"}
          </Button>
        </div>
      </form>
    </div>
  );
};
