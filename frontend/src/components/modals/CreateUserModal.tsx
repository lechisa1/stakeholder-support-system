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
  useCreateUserMutation,
  CreateUserDto,
} from "../../redux/services/userApi";

import {
  useGetInstitutesQuery,
  Institute,
} from "../../redux/services/instituteApi";
import { Check, XIcon } from "lucide-react";
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
  const [instituteId, setInstituteId] = useState<string>("");
  const [selectAll, setSelectAll] = useState(false);
  const [open, setOpen] = useState(false);
  const [roleSearch, setRoleSearch] = useState("");

  // Add error states
  const [errors, setErrors] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    institute: "",
    roles: "",
    metrics: "",
  });

  const fullNameRegex = /^[A-Za-z\s]*$/;
  const phoneRegex = /^[0-9+]*$/;

  const { data: institutes, isLoading: loadingInstitutes } =
    useGetInstitutesQuery();
  const {
    data: metricsData,
    isLoading: loadingMetrics,
    isError,
  } = useGetProjectMetricsQuery({});
  const { data: rolesResponse } = useGetRolesQuery({
    role_type: user_type === "internal_user" ? "internal" : "external",
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

  // Update selectAll state
  useEffect(() => {
    if (metrics.length > 0) {
      setSelectAll(projectMetricsIds.length === metrics.length);
    }
  }, [projectMetricsIds, metrics]);

  // Clear errors when modal closes
  useEffect(() => {
    if (!isOpen) {
      setErrors({
        fullName: "",
        email: "",
        phoneNumber: "",
        institute: "",
        roles: "",
        metrics: "",
      });
    }
  }, [isOpen]);

  const handleMetricSelect = (metricId: string) => {
    setProjectMetricsIds((prev) =>
      prev.includes(metricId)
        ? prev.filter((id) => id !== metricId)
        : [...prev, metricId]
    );
    // Clear metric error when user selects something
    if (errors.metrics) {
      setErrors((prev) => ({ ...prev, metrics: "" }));
    }
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setProjectMetricsIds([]);
      setSelectAll(false);
    } else {
      const allMetricIds = metrics.map((metric) => metric.project_metric_id);
      setProjectMetricsIds(allMetricIds);
      setSelectAll(true);
    }
    // Clear metric error when selecting/deselecting all
    if (errors.metrics) {
      setErrors((prev) => ({ ...prev, metrics: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {
      fullName: "",
      email: "",
      phoneNumber: "",
      institute: "",
      roles: "",
      metrics: "",
    };
    let isValid = true;

    // Validate full name
    if (!fullName.trim()) {
      newErrors.fullName = "Please enter full name";
      isValid = false;
    } else if (!/^[A-Za-z\s]+$/.test(fullName.trim())) {
      newErrors.fullName = "Full name must contain only letters and spaces";
      isValid = false;
    }

    // Validate email
    if (!email.trim()) {
      newErrors.email = "Please enter email";
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = "Please enter a valid email address";
      isValid = false;
    }

    // Validate phone number (if provided)
    if (phoneNumber && !/^\+?[0-9]{9,15}$/.test(phoneNumber.trim())) {
      newErrors.phoneNumber =
        "Phone number must contain only digits and may start with + (9–15 digits)";
      isValid = false;
    }

    // Validate institute for external users
    if (user_type === "external_user" && !instituteId) {
      newErrors.institute = "Please select an institute for external users";
      isValid = false;
    }

    // Validate roles
    if (!selectedRoles.length) {
      newErrors.roles = "Please select at least one role";
      isValid = false;
    }

    // Validate metrics for internal users
    if (user_type === "internal_user" && projectMetricsIds.length === 0) {
      newErrors.metrics =
        "Please select at least one project metric for internal users";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async () => {
    // Clear previous errors
    setErrors({
      fullName: "",
      email: "",
      phoneNumber: "",
      institute: "",
      roles: "",
      metrics: "",
    });

    // Validate form
    if (!validateForm()) {
      return;
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
    setInstituteId("");
    setProjectMetricsIds([]);
    setSelectAll(false);
    setSelectedRoles([]);
    setErrors({
      fullName: "",
      email: "",
      phoneNumber: "",
      institute: "",
      roles: "",
      metrics: "",
    });
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) handleClose();
  };

  const handleFullNameChange = (value: string) => {
    if (fullNameRegex.test(value)) {
      setFullName(value.replace(/\s{2,}/g, " "));
    }
    // Clear error when user starts typing
    if (errors.fullName) {
      setErrors((prev) => ({ ...prev, fullName: "" }));
    }
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    // Clear error when user starts typing
    if (errors.email) {
      setErrors((prev) => ({ ...prev, email: "" }));
    }
  };

  const handlePhoneNumberChange = (value: string) => {
    let newValue = value;

    if (!newValue.startsWith("+251")) {
      newValue = "+251" + newValue.replace(/^\+?251?/, "");
    }

    if (/^\+251\d*$/.test(newValue)) {
      setPhoneNumber(newValue);
    }
    // Clear error when user starts typing
    if (errors.phoneNumber) {
      setErrors((prev) => ({ ...prev, phoneNumber: "" }));
    }
  };

  const handleInstituteChange = (value: string) => {
    setInstituteId(value);
    // Clear error when user selects something
    if (errors.institute) {
      setErrors((prev) => ({ ...prev, institute: "" }));
    }
  };

  const handleRoleSelect = (roleId: string) => {
    setSelectedRoles((prev) =>
      prev.includes(roleId)
        ? prev.filter((id) => id !== roleId)
        : [...prev, roleId]
    );
    // Clear error when user selects something
    if (errors.roles) {
      setErrors((prev) => ({ ...prev, roles: "" }));
    }
  };

  if (!isOpen) return null;

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
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 mt-2 pr-2">
            {showInstituteSelect && (
              <div className="space-y-2">
                <Label className="block text-sm text-[#094C81] font-medium mb-2">
                  Institute <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={instituteId}
                  onValueChange={handleInstituteChange}
                  disabled={loadingInstitutes}
                >
                  <SelectTrigger
                    className={`w-full h-12 border px-4 py-3 rounded-md focus:ring focus:ring-[#094C81] focus:border-transparent transition-all duration-200 outline-none ${
                      errors.institute ? "border-red-500" : "border-gray-300"
                    }`}
                  >
                    <SelectValue
                      className="text-sm text-[#094C81] font-medium"
                      placeholder="Select Institute"
                    />
                  </SelectTrigger>
                  <SelectContent className="text-sm bg-white text-[#094C81] font-medium">
                    {institutes?.map((inst: Institute) => (
                      <SelectItem
                        key={inst.institute_id}
                        value={inst.institute_id}
                      >
                        {inst.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.institute && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.institute}
                  </p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label className="block text-sm text-[#094C81] font-medium mb-2">
                Full Name <span className="text-red-500">*</span>
              </Label>
              <Input
                value={fullName}
                onChange={(e) => handleFullNameChange(e.target.value)}
                placeholder="John Doe"
                className={`w-full h-12 border px-4 py-3 rounded-md focus:ring focus:ring-[#094C81] focus:border-transparent transition-all duration-200 outline-none ${
                  errors.fullName ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.fullName && (
                <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="block text-sm text-[#094C81] font-medium mb-2">
                Phone Number
              </Label>
              <Input
                value={phoneNumber}
                onFocus={() => {
                  if (!phoneNumber) {
                    setPhoneNumber("+251");
                  }
                }}
                onChange={(e) => handlePhoneNumberChange(e.target.value)}
                placeholder="+2519XXXXXXXX"
                className={`w-full h-12 border px-4 py-3 rounded-md focus:ring focus:ring-[#094C81] ${
                  errors.phoneNumber ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.phoneNumber && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.phoneNumber}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="block text-sm text-[#094C81] font-medium mb-2">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                placeholder="john@example.com"
                className={`w-full h-12 border px-4 py-3 rounded-md focus:ring focus:ring-[#094C81] focus:border-transparent transition-all duration-200 outline-none ${
                  errors.email ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            {/* ROLE MULTI SELECT */}
            <div className="w-full space-y-2">
              <Label className="text-sm font-medium text-[#094C81]">
                Role <span className="text-red-500">*</span>
              </Label>

              {/* Selector box */}
              <button
                type="button"
                onClick={() => setOpen((prev) => !prev)}
                className={`w-full border rounded h-12 px-4 flex items-center justify-between text-left focus:ring-2 focus:ring-[#094C81] ${
                  errors.roles ? "border-red-500" : "border-gray-300"
                }`}
              >
                <span className="text-sm text-[#094C81] truncate">
                  {selectedRoles.length === 0
                    ? "Select Role"
                    : selectedRoles
                        .map((id) => roles.find((r) => r.role_id === id)?.name)
                        .join(", ")}
                </span>
                <span className="text-[#094C81]">{open ? "▲" : "▼"}</span>
              </button>

              {errors.roles && (
                <p className="text-red-500 text-xs mt-1">{errors.roles}</p>
              )}

              {/* Dropdown PANEL (pushes content down) */}
              <div
                className={`border rounded-md transition-all duration-300 overflow-hidden ${
                  open ? "max-h-64 opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                {/* Search */}
                <input
                  type="text"
                  placeholder="Search roles..."
                  className="w-full px-3 py-2 border-b text-sm focus:outline-none"
                  value={roleSearch}
                  onChange={(e) => setRoleSearch(e.target.value)}
                />

                {/* Roles list */}
                <div className="max-h-48 overflow-y-auto">
                  {roles
                    .filter((r) =>
                      r.name.toLowerCase().includes(roleSearch.toLowerCase())
                    )
                    .map((r) => {
                      const isSelected = selectedRoles.includes(r.role_id);
                      return (
                        <div
                          key={r.role_id}
                          onClick={() => handleRoleSelect(r.role_id)}
                          className={`flex items-center justify-between px-4 py-2 cursor-pointer hover:bg-[#094C81]/10 ${
                            isSelected ? "bg-[#094C81]/10" : ""
                          }`}
                        >
                          <span className="text-[#094C81] truncate">
                            {r.name}
                          </span>
                          {isSelected && (
                            <Check className="w-4 h-4 text-[#094C81]" />
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          </div>

          {/* Metrics */}
          {showMetricsSelect && (
            <div className="w-full border border-gray-200 flex flex-col gap-4 p-5 shadow-sm rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-[#094C81] font-semibold text-lg">
                    User Skills
                  </h3>
                </div>
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
                      {selectAll && <Check className="w-3 h-3 stroke-3" />}
                    </div>
                    <span className="font-medium text-sm text-[#094C81]">
                      Select All
                    </span>
                  </div>
                )}
              </div>

              {errors.metrics && (
                <p className="text-red-500 text-xs mb-2">{errors.metrics}</p>
              )}

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
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 max-h-[400px] overflow-y-auto overflow-x-hidden pr-2 pb-2 custom-scrollbar">
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
                          ) && <Check className="w-2.5 h-2.5 stroke-3" />}
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
