"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Label } from "../ui/cn/label";
import { Button } from "../ui/cn/button";
import DatePicker from "react-datepicker";
import { useCreateProjectMutation } from "../../redux/services/projectApi";
import { XIcon, CalendarIcon, Check } from "lucide-react";
import { Textarea } from "../ui/cn/textarea";

// Import react-datepicker styles
import "react-datepicker/dist/react-datepicker.css";
import { useGetProjectMetricsQuery } from "../../redux/services/projectMetricApi";

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
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [maintenanceStart, setMaintenanceStart] = useState<Date | null>(null);
  const [maintenanceEnd, setMaintenanceEnd] = useState<Date | null>(null);
  const [projectMetricsIds, setProjectMetricsIds] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  const [createProject, { isLoading }] = useCreateProjectMutation();
  const {
    data: metricsData,
    isLoading: loadingMetrics,
    isError,
  } = useGetProjectMetricsQuery({});

  const metrics: ProjectMetric[] = metricsData || [];

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
    if (!name) {
      toast.error("Please provide a project name");
      return;
    }

    if (
      maintenanceStart &&
      maintenanceEnd &&
      maintenanceStart > maintenanceEnd
    ) {
      toast.error("Maintenance start date cannot be later than end date");
      return;
    }

    const payload = {
      name,
      description: description || undefined,
      is_active: isActive,
      institute_id: instituteId || undefined,
      maintenance_start: maintenanceStart
        ? maintenanceStart.toISOString().split("T")[0]
        : undefined,
      maintenance_end: maintenanceEnd
        ? maintenanceEnd.toISOString().split("T")[0]
        : undefined,
      project_metrics_ids:
        projectMetricsIds.length > 0 ? projectMetricsIds : undefined,
    };

    try {
      await createProject(payload).unwrap();
      toast.success("Project created successfully!");
      onClose();
      resetForm();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to create project");
    }
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setMaintenanceStart(null);
    setMaintenanceEnd(null);
    setIsActive(true);
    setProjectMetricsIds([]);
    setSelectAll(false);
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  // Handle manual date input parsing
  const parseDateInput = (inputValue: string): Date | null => {
    if (!inputValue) return null;
    
    // Try parsing MM/DD/YYYY format
    const dateMatch = inputValue.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if (dateMatch) {
      const month = parseInt(dateMatch[1], 10) - 1; // Month is 0-indexed
      const day = parseInt(dateMatch[2], 10);
      const year = parseInt(dateMatch[3], 10);
      const date = new Date(year, month, day);
      
      // Validate the date
      if (
        date.getFullYear() === year &&
        date.getMonth() === month &&
        date.getDate() === day
      ) {
        return date;
      }
    }
    
    // Try parsing as ISO date string
    const isoDate = new Date(inputValue);
    if (!isNaN(isoDate.getTime())) {
      return isoDate;
    }
    
    return null;
  };

  // Custom input component for DatePicker to allow manual input
  const CustomDateInput = React.forwardRef<HTMLInputElement, any>(
    ({ value, onClick, onChange, onBlur }, ref) => (
      <div className="relative w-full">
        <input
          type="text"
          value={value || ""}
          onChange={onChange}
          onBlur={onBlur}
          onClick={onClick}
          ref={ref}
          placeholder="MM/DD/YYYY "
          className="w-full min-w-[330px] h-12 border border-gray-300 px-4 py-2 pr-10 rounded-md shadow-sm focus:ring-2 focus:ring-[#094C81] focus:border-transparent transition-all duration-200 outline-none bg-white text-gray-900"
        />
        <button
          type="button"
          onClick={onClick}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
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
      <div className="bg-white p-6 rounded-2xl w-full max-w-[800px] shadow-2xl transform transition-all duration-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[24px] font-bold text-[#094C81]">
            Create Project
          </h2>
          <button
            onClick={onClose}
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
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter project name"
                  className="w-full border border-gray-300 px-4 py-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none"
                />
              </div>

              <div className="w-full">
                <Label className="block text-sm text-[#094C81] font-medium mb-2">
                  Description
                </Label>
                <Textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Project description"
                  className="w-full min-h-[40px] max-w-[350px] border border-gray-300 px-4 py-2 rounded-md focus:ring-2 focus:ring-[#094C81] focus:border-transparent transition-all duration-200 outline-none"
                />
              </div>
            </div>

            {/* Right Panel: Maintenance Timeline (keep title) */}
            <div className="w-1/2 border flex flex-col gap-6 p-4 shadow-sm rounded-md">
              <h3 className="text-[#094C81] font-semibold text-lg ">
                Maintenance and Support Timeline
              </h3>

              <div className="w-full">
                <Label className="block text-sm text-[#094C81] font-medium mb-2">
                  Start Date
                </Label>
                <DatePicker
                  selected={maintenanceStart}
                  onChange={(date) => setMaintenanceStart(date)}
                  onChangeRaw={(e: React.ChangeEvent<HTMLInputElement>) => {
                    if (e && e.target) {
                      const inputValue = e.target.value;
                      const parsedDate = parseDateInput(inputValue);
                      if (parsedDate && parsedDate >= new Date()) {
                        setMaintenanceStart(parsedDate);
                      }
                    }
                  }}
                  selectsStart
                  startDate={maintenanceStart}
                  endDate={maintenanceEnd}
                  customInput={<CustomDateInput />}
                  dateFormat="MM/dd/yyyy"
                  showYearDropdown
                  showMonthDropdown
                  dropdownMode="select"
                  allowSameDay={false}
                  minDate={new Date()}
                  yearDropdownItemNumber={100}
                  scrollableYearDropdown
                  strictParsing={false}
                  openToDate={maintenanceStart || new Date()}
                />
              </div>

              <div className="w-full">
                <Label className="block text-sm text-[#094C81] font-medium mb-2">
                  End Date
                </Label>
                <DatePicker
                  selected={maintenanceEnd}
                  onChange={(date) => setMaintenanceEnd(date)}
                  onChangeRaw={(e: React.ChangeEvent<HTMLInputElement>) => {
                    if (e && e.target) {
                      const inputValue = e.target.value;
                      const parsedDate = parseDateInput(inputValue);
                      const minDate = maintenanceStart || new Date();
                      if (parsedDate && parsedDate >= minDate) {
                        setMaintenanceEnd(parsedDate);
                      }
                    }
                  }}
                  selectsEnd
                  startDate={maintenanceStart}
                  endDate={maintenanceEnd}
                  minDate={maintenanceStart || new Date()}
                  customInput={<CustomDateInput />}
                  dateFormat="MM/dd/yyyy"
                  showYearDropdown
                  showMonthDropdown
                  dropdownMode="select"
                  allowSameDay={false}
                  yearDropdownItemNumber={100}
                  scrollableYearDropdown
                  strictParsing={false}
                  openToDate={maintenanceEnd || maintenanceStart || new Date()}
                />
              </div>
            </div>
          </div>
          {/* Bottom Panel: Project Metrics Selection */}
          <div className="w-full border border-gray-200 flex flex-col gap-4 p-5 shadow-sm rounded-lg">
            {/* Header with count */}
            <div className="flex items-center justify-between mb-1">
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
                      onClick={() => handleMetricSelect(metric.project_metric_id)}
                    >
                      <div
                        className={`w-4 h-4 border-2 rounded flex items-center justify-center transition-all duration-200 shrink-0 ${
                          projectMetricsIds.includes(metric.project_metric_id)
                            ? "bg-[#094C81] border-[#094C81] text-white"
                            : "border-gray-300 bg-white"
                        }`}
                      >
                        {projectMetricsIds.includes(metric.project_metric_id) ? (
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
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "Creating..." : "Create"}
          </Button>
        </div>
      </div>
    </div>
  );
};
