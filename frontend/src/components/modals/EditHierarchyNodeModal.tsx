"use client";

import React, { useEffect } from "react";
import {
  useGetHierarchyNodeByIdQuery,
  useUpdateHierarchyNodeMutation,
} from "../../redux/services/hierarchyNodeApi";
import { Button } from "../ui/cn/button";
import { XIcon } from "lucide-react";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  hierarchyNodeSchema,
  type HierarchyNodeFormData,
} from "../../utils/validation";
import Input from "../form/input/InputField";
import TextArea from "../form/input/TextArea";

interface UpdateHierarchyNodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  hierarchyNodeId: string | null;
}

export const UpdateHierarchyNodeModal: React.FC<UpdateHierarchyNodeModalProps> = ({
  isOpen,
  onClose,
  hierarchyNodeId,
}) => {
  const { data: hierarchyNode, isFetching } = useGetHierarchyNodeByIdQuery(
    hierarchyNodeId!,
    {
      skip: !hierarchyNodeId || !isOpen,
    }
  );

  const [updateHierarchyNode, { isLoading }] = useUpdateHierarchyNodeMutation();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<HierarchyNodeFormData & { description?: string }>({
    resolver: zodResolver(hierarchyNodeSchema),
    defaultValues: {
      name: "",
      description: "",
      is_active: true,
    },
  });

  const description = watch("description");

  /* ---------------------------------------------
   Fill form when hierarchy node data is loaded
  --------------------------------------------- */
  useEffect(() => {
    if (hierarchyNode) {
      reset({
        name: hierarchyNode.name,
        description: hierarchyNode.description ?? "",
        is_active: hierarchyNode.is_active ?? true,
      });
    }
  }, [hierarchyNode, reset]);

  const handleClose = () => {
    reset();
    onClose();
  };

  /* ---------------------------------------------
   Submit Update
  --------------------------------------------- */
  const onSubmit = async (data: HierarchyNodeFormData & { description?: string }) => {
    if (!hierarchyNodeId) return;

    try {
      await updateHierarchyNode({
        id: hierarchyNodeId,
        data: {
          name: data.name,
          description: data.description || undefined,
          is_active: data.is_active,
        },
      }).unwrap();

      toast.success("Organization structure updated successfully");
      handleClose();
    } catch (error: unknown) {
      const message =
        (error as { data?: { message?: string } })?.data?.message ||
        (error as { message?: string })?.message ||
        "Failed to update organization structure";
      toast.error(message);
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
            Update Organization Structure
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
              placeholder="Enter structure name"
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

