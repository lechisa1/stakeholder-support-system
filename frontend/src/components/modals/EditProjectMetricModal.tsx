"use client";

import React, { useEffect } from "react";
import { toast } from "sonner";
import Input from "../form/input/InputField";
import { Label } from "../ui/cn/label";
import { Button } from "../ui/cn/button";
import { XIcon } from "lucide-react";
import {
  useGetProjectMetricByIdQuery,
  useUpdateProjectMetricMutation,
} from "../../redux/services/projectMetricApi";
import { projectMetricSchema, type ProjectMetricFormData } from "../../utils/validation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";

interface EditHumanResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  metricId: string;
}

export const EditHumanResourceModal: React.FC<EditHumanResourceModalProps> = ({
  isOpen,
  onClose,
  metricId,
}) => {
  const { t } = useTranslation();

  // Fetch metric data when modal opens
  const {
    data: metric,
    isLoading: isFetching,
    refetch,
  } = useGetProjectMetricByIdQuery(metricId, {
    skip: !isOpen,
    refetchOnMountOrArgChange: true,
  });

  const [updateProjectMetric, { isLoading: isUpdating }] =
    useUpdateProjectMetricMutation();

  const {
    register,
    handleSubmit,
    reset,
    setError: setFormError,
    formState: { errors, isSubmitting },
  } = useForm<ProjectMetricFormData>({
    resolver: zodResolver(projectMetricSchema),
    defaultValues: {
      name: "",
    },
  });

  // Populate form when metric is fetched
  useEffect(() => {
    if (!metric) return;
    reset({
      name: metric.name || "",
    });
  }, [metric, reset]);

  // Reset form on close
  const handleClose = () => {
    if (metric) {
      reset({
        name: metric.name || "",
      });
    } else {
      reset({
        name: "",
      });
    }
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) handleClose();
  };

  const onSubmit = async (data: ProjectMetricFormData) => {
    try {
      await updateProjectMetric({ id: metricId, ...data }).unwrap();
      toast.success("Project human resource updated successfully!");
      handleClose();
    } catch (error: any) {
      const message =
        error?.data?.message ||
        t("projectMetric.generic_error") ||
        "Failed to update project human resource";
      setFormError("root", { message });
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity duration-200"
      onClick={handleBackdropClick}
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-6 rounded-2xl w-full max-w-[400px] shadow-2xl transform transition-all duration-200"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[20px] font-bold text-[#094C81]">
            Edit Project Human Resource
          </h2>
          <button
            onClick={handleClose}
            className="text-[#094C81] hover:text-gray-600 transition-colors duration-200"
            type="button"
          >
            <XIcon className="w-6 h-6 cursor-pointer" />
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <Label className="block text-sm text-[#094C81] font-medium mb-2">
              Human Resource Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              placeholder="Enter human resource name"
              {...register("name")}
              error={!!errors.name}
              hint={errors.name?.message}
            />
          </div>

          
        </div>

        <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
          <Button variant="outline" type="button" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting || isUpdating}>
            {isUpdating ? "Updating..." : "Update"}
          </Button>
        </div>
      </form>
    </div>
  );
};
