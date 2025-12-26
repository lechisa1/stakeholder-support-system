"use client";

import React, { useEffect } from "react";
import {
  useGetInstituteByIdQuery,
  useUpdateInstituteMutation,
} from "../../redux/services/instituteApi";
import { Button } from "../ui/cn/button";
import { XIcon } from "lucide-react";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  instituteSchema,
  type InstituteFormData,
} from "../../utils/validation";
import Input from "../form/input/InputField";

interface UpdateInstituteModalProps {
  isOpen: boolean;
  onClose: () => void;
  instituteId: string | null;
}

export const UpdateInstituteModal: React.FC<UpdateInstituteModalProps> = ({
  isOpen,
  onClose,
  instituteId,
}) => {
  const { data: institute, isFetching } = useGetInstituteByIdQuery(
    instituteId!,
    {
      skip: !instituteId || !isOpen,
    }
  );

  const [updateInstitute, { isLoading }] = useUpdateInstituteMutation();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<InstituteFormData>({
    resolver: zodResolver(instituteSchema),
    defaultValues: {
      name: "",
      description: "",
      is_active: true,
    },
  });

  /* ---------------------------------------------
   Fill form when institute data is loaded
  --------------------------------------------- */
  useEffect(() => {
    if (institute) {
      reset({
        name: institute.name,
        description: institute.description ?? "",
        is_active: institute.is_active,
      });
    }
  }, [institute, reset]);

  const handleClose = () => {
    reset();
    onClose();
  };

  /* ---------------------------------------------
   Submit Update
  --------------------------------------------- */
  const onSubmit = async (data: InstituteFormData) => {
    if (!instituteId) return;

    try {
      await updateInstitute({
        id: instituteId,
        data: {
          name: data.name,
          is_active: data.is_active,
        },
      }).unwrap();

      toast.success("Institute updated successfully");
      handleClose();
    } catch (error: unknown) {
      const message =
        (error as { message?: string })?.message ||
        "Failed to update institute";
      setError("root", { message });
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="bg-white p-6 rounded-2xl w-full max-w-[500px] shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[20px] font-bold text-[#094C81]">
            Update Organization
          </h2>
          <button
            onClick={handleClose}
            className="text-[#094C81] hover:text-gray-600"
          >
            <XIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-sm text-[#094C81] font-medium mb-2">
              Name <span className="text-red-500">*</span>
            </label>
            <Input
              id="name"
              placeholder="Enter Organization name"
              {...register("name")}
              error={!!errors.name}
              hint={errors.name?.message}
            />
          </div>

          <div className="flex justify-end space-x-3 mt-8 pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={handleClose}
              className="px-6 py-2.5"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={isSubmitting || isLoading || isFetching}
              className="px-6 py-2.5 bg-[#094C81] text-white rounded-lg"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Updating...</span>
                </div>
              ) : (
                "Update"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
