"use client";

import React, { useState, useEffect } from "react";
import { useCreateInstituteMutation } from "../../redux/services/instituteApi";
import { Button } from "../ui/cn/button";
import { XIcon } from "lucide-react";
import { toast } from "sonner";
// import { FileUploadField } from "../common/FileUploadField";
import { getFileUrl } from "../../utils/fileUrl";
import { useGetAttachmentsQuery } from "../../redux/services/attachmentApi";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { instituteSchema, type InstituteFormData } from "../../utils/validation";
import Input from "../form/input/InputField";
interface CreateInstituteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateInstituteModal: React.FC<CreateInstituteModalProps> = ({
  isOpen,
  onClose,
}) => {
  // const [logoAttachmentIds, setLogoAttachmentIds] = useState<string[]>([]);
  // const [previewFile, setPreviewFile] = useState<{
  //   file_name: string;
  //   previewUrl: string;
  // } | null>(null);

  // Mark as intentionally unused until API integration

  const [createInstitute, { isLoading }] = useCreateInstituteMutation();
  // const { data: attachmentsResponse } = useGetAttachmentsQuery();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError: setFormError,
    reset,
  } = useForm<InstituteFormData>({
    resolver: zodResolver(instituteSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });
  // Handle logo attachment change - ensure only one file is kept (replace previous)
  // const handleLogoChange = (newAttachmentIds: string[]) => {
  //   // Since multiple={false}, we should only get one ID, but ensure we only keep the latest one
  //   if (newAttachmentIds.length > 0) {
  //     // Replace the entire array with just the new attachment ID
  //     setLogoAttachmentIds([newAttachmentIds[newAttachmentIds.length - 1]]);
  //   } else {
  //     setLogoAttachmentIds([]);
  //   }
  // };

  // Get attachment data for preview
  // useEffect(() => {
  //   if (!attachmentsResponse || logoAttachmentIds.length === 0) {
  //     setPreviewFile(null);
  //     return;
  //   }

  //   const attachmentId = logoAttachmentIds[0];
  //   const attachment = attachmentsResponse.attachments?.find(
  //     (a) => a.attachment_id === attachmentId
  //   );

  //   if (attachment) {
  //     setPreviewFile({
  //       file_name: attachment.file_name,
  //       previewUrl: getFileUrl(attachment.file_path),
  //     });
  //   } else {
  //     setPreviewFile(null);
  //   }
  // }, [logoAttachmentIds, attachmentsResponse]);
  const handleClose = () => {
    reset({
      name: "",
    });
    onClose();
  };

  const onSubmit = async (data: InstituteFormData) => {
  
    try {
      await createInstitute({
        name: data.name,
        // description,
        is_active: data.is_active,
      }).unwrap();
      toast.success("Institute created successfully");
      reset();
      handleClose();
    } catch (error: unknown) {
      const message =
        (error as { message?: string })?.message ||
        "Failed to create institute";
      setFormError("root", { message });
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity duration-200"
      onClick={handleBackdropClick}
    >
      <div className="bg-white p-6 rounded-2xl w-full max-w-[500px] shadow-2xl transform transition-all duration-200 scale-100 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[20px] font-bold text-[#094C81]">
            Create New Organization
          </h2>
          <button
            onClick={onClose}
            className="text-[#094C81] hover:text-gray-600 transition-colors duration-200"
          >
            <XIcon className="w-6 h-6 cursor-pointer" />
          </button>
        </div>

        {/* Form */}
        <form 
        onSubmit={handleSubmit(onSubmit)}
         className="space-y-5">
        <div  className="space-y-5">
          {/* Name Field */}
          <div className="w-full">
            <label className="block text-sm text-[#094C81] font-medium mb-2">
              Name <span className="text-red-500">*</span>
            </label>
            <Input
              id="name"
              className="w-full"
              placeholder="Enter Organization name"
              {...register("name")}
              error={!!errors.name}
              hint={errors.name?.message}
            />
          </div>

          {/* <div className="flex gap-5 ">
            {previewFile && (
              <div className="min-w-24">
                <label className="block mt-1 text-sm text-[#094C81] font-medium mb-2">
                  Logo Preview
                </label>
                <div className="flex items-start gap-4">
                  <div className="relative w-20 h-20 border-2 border-[#BFD7EA] rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center shrink-0">
                    <img
                      src={previewFile.previewUrl}
                      alt={previewFile.file_name}
                      className="w-full h-full object-cover cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}

            <FileUploadField
              id="logo-upload"
              label="Organization Logo"
              value={logoAttachmentIds}
              onChange={handleLogoChange}
              showPreview={false}
              accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/webp"
              multiple={false}
              className="w-full h-full"
              labelClass="text-sm text-[#094C81]  font-medium"
            />
          </div> */}
        </div>

        <div className="flex justify-end space-x-3 mt-8 pt-4 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={onClose}
            className="px-6 py-2.5 border-gray-300 text-[#094C81] hover:bg-gray-50 transition-colors duration-200 rounded-xl"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || isLoading}
            className={`px-6 py-2.5 rounded-lg transition-all duration-200 ${
              isLoading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-[#094C81] hover:bg-[#094C81]/90"
            } text-white font-medium`}
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-lg animate-spin" />
                <span>Creating...</span>
              </div>
            ) : (
              "Create "
            )}
          </Button>
        </div>
        </form>
      </div>
    </div>
  );
};
