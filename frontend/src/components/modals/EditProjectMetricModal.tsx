"use client";

import React from "react";
import { toast } from "sonner";
import Input from "../form/input/InputField";
import { Label } from "../ui/cn/label";
import { Button } from "../ui/cn/button";
import { XIcon } from "lucide-react";
import { useCreateProjectMetricMutation } from "../../redux/services/projectMetricApi";
import {  projectMetricSchema, type ProjectMetricFormData } from "../../utils/validation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
interface CreateProjectMetricModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EditProjectMetricModal: React.FC<
  CreateProjectMetricModalProps
> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();

  const [createProjectMetric, { isLoading }] = useCreateProjectMetricMutation();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError: setFormError,
    reset,
  } = useForm<ProjectMetricFormData>({
    resolver: zodResolver(projectMetricSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });
  
  const onSubmit = async (data: ProjectMetricFormData) => {
    try {
      await createProjectMetric(data).unwrap();
      toast.success("Project human resource created successfully!");
      reset();
      handleClose();
    } catch (error: unknown) {
      const message =
        (error as { message?: string })?.message ||
        t("projectMetric.generic_error") ||
        "Failed to create project metric";
      setFormError("root", { message });
    }
  };

  const handleClose = () => {
    reset({
      name: "",
      description: "",
    });
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity duration-200"
      onClick={handleBackdropClick}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded-2xl w-full max-w-[400px] shadow-2xl transform transition-all duration-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[20px] font-bold text-[#094C81]">
            Create Project Human Resource
          </h2>
          <button
            onClick={handleClose}
            className="text-[#094C81] hover:text-gray-600 transition-colors duration-200"
          >
            <XIcon className="w-6 h-6 cursor-pointer" />
          </button>
        </div>

        <div
        className="flex flex-col gap-4">
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
              // className="w-full h-10 border border-gray-300 px-4 py-3 rounded-md focus:ring focus:ring-[#094C81] focus:border-transparent transition-all duration-200 outline-none"
            />
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
