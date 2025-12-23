"use client";

import React from "react";
import { toast } from "sonner";
import { Label } from "../ui/cn/label";
import Input from "../form/input/InputField";
import { Button } from "../ui/cn/button";
import { useUpdateIssueCategoryMutation } from "../../redux/services/issueCategoryApi";
import { XIcon } from "lucide-react";
import { categorySchema, type CategoryFormData } from "../../utils/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import TextArea from "../form/input/TextArea";
import { useForm } from "react-hook-form";
import type { IssueCategory } from "../../redux/services/issueCategoryApi";
interface CreateCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: IssueCategory | null;
}

export const EditCategoryModal: React.FC<CreateCategoryModalProps> = ({
  isOpen,
  onClose,
  category,
}) => {
  const { t } = useTranslation();
  const [updateCategory, { isLoading }] = useUpdateIssueCategoryMutation();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors, isSubmitting },
    setError: setFormError,
    reset,
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const handleClose = () => {
    reset({
      name: "",
      description: "",
    });
    onClose();
  };

  React.useEffect(() => {
    if (category) {
      reset({
        name: category.name ?? "",
        description: category.description ?? "",
      });
    }
  }, [category, reset]);

  const onSubmit = async (data: CategoryFormData) => {
    if (!category?.category_id) return;
    try {
      await updateCategory({
        id: category.category_id,
        data,
      }).unwrap();
      toast.success(`Support request category updated successfully`);
      handleClose();
    } catch (error: unknown) {
      const message =
        (error as { message?: string })?.message ||
        t("category.generic_error") ||
        "Failed to update support request category";
      setFormError("root", { message });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-[400px] rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[20px] font-bold text-[#094C81]">
            Edit Support Request Category
          </h2>
          <button
            onClick={handleClose}
            className="text-[#094C81] hover:text-gray-600 transition-colors duration-200"
          >
            <XIcon className="w-6 h-6 cursor-pointer" />
          </button>
        </div>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4 flex-col flex w-full "
        >
          <div className="space-y-4 flex-col flex w-full ">
            <div className="">
              <Label
                htmlFor="name"
                className="block text-sm text-[#094C81] font-medium mb-2"
              >
                Support Request Category Name
              </Label>
              <Input
                id="name"
                placeholder="Enter support request category name"
                {...register("name")}
                error={!!errors.name}
                hint={errors.name?.message}
                // className="w-full h-10 border border-gray-300 px-4 py-3 rounded-md focus:ring focus:ring-[#094C81] focus:border-transparent transition-all duration-200 outline-none"
              />
            </div>

            <div className="">
              <Label
                htmlFor="description"
                className="block text-sm text-[#094C81] font-medium mb-2"
              >
                Description
              </Label>
              <TextArea
                id="description"
                placeholder="Enter short description (optional)"
                value={watch("description") || ""}
                onChange={(value) => {
                  setValue("description", value);
                  trigger("description");
                }}
                error={!!errors.description}
                hint={errors.description?.message}
                className="w-full"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || isLoading}>
              {isSubmitting ? "Updating..." : "Update"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
