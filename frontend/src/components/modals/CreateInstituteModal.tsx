"use client";

import React, { useState, useEffect } from "react";
import { useCreateInstituteMutation } from "../../redux/services/instituteApi";
import { Button } from "../ui/cn/button";
import { XIcon } from "lucide-react";
import { toast } from "sonner";
import { FileUploadField } from "../common/FileUploadField";
import { getFileUrl } from "../../utils/fileUrl";
import { useGetAttachmentsQuery } from "../../redux/services/attachmentApi";
interface CreateInstituteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateInstituteModal: React.FC<CreateInstituteModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState(""); // Reserved for future API integration
  const [isActive, setIsActive] = useState(true);
  const [logoAttachmentIds, setLogoAttachmentIds] = useState<string[]>([]);
  const [previewFile, setPreviewFile] = useState<{
    file_name: string;
    previewUrl: string;
  } | null>(null);

  // Mark as intentionally unused until API integration
  void description;

  const [createInstitute, { isLoading }] = useCreateInstituteMutation();
  const { data: attachmentsResponse } = useGetAttachmentsQuery();

  // Handle logo attachment change - ensure only one file is kept (replace previous)
  const handleLogoChange = (newAttachmentIds: string[]) => {
    // Since multiple={false}, we should only get one ID, but ensure we only keep the latest one
    if (newAttachmentIds.length > 0) {
      // Replace the entire array with just the new attachment ID
      setLogoAttachmentIds([newAttachmentIds[newAttachmentIds.length - 1]]);
    } else {
      setLogoAttachmentIds([]);
    }
  };

  // Get attachment data for preview
  useEffect(() => {
    if (!attachmentsResponse || logoAttachmentIds.length === 0) {
      setPreviewFile(null);
      return;
    }

    const attachmentId = logoAttachmentIds[0];
    const attachment = attachmentsResponse.attachments?.find(
      (a) => a.attachment_id === attachmentId
    );

    if (attachment) {
      setPreviewFile({
        file_name: attachment.file_name,
        previewUrl: getFileUrl(attachment.file_path),
      });
    } else {
      setPreviewFile(null);
    }
  }, [logoAttachmentIds, attachmentsResponse]);

  const handleSubmit = async () => {
    // 4console.log(logoAttachmentIds);

    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }
  

    try {
      await createInstitute({
        name,
        // description,
        is_active: isActive,
      }).unwrap();
      onClose();
      setName("");
      setDescription("");
      setIsActive(true);
      setLogoAttachmentIds([]);
      setPreviewFile(null);
      toast.success("Institute created successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to create institute");
    }
  };


  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
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
        <div className="space-y-5">
          {/* Name Field */}
          <div className="w-full">
            <label className="block text-sm text-[#094C81] font-medium mb-2">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              className="w-full border border-gray-300 px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none"
              placeholder="Enter Organization name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
           <div className="flex gap-5 ">
           {previewFile && (
            <div className="min-w-24">
              <label className="block mt-1 text-sm text-[#094C81] font-medium mb-2">
                Logo Preview
              </label>
              <div className="flex items-start gap-4">
                {/* Thumbnail Preview - 1:1 ratio */}
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

          {/* upload the image */}
          <FileUploadField
            id="logo-upload"
            label="Organization Logo"
            value={logoAttachmentIds}
            onChange={handleLogoChange}
            showPreview={false}
            // Restrict selectable types at browser level; actual upload & preview are handled inside FileUploadField
            accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/webp"
            multiple={false}
            className="w-full h-full"
            labelClass="text-sm text-[#094C81]  font-medium"
          />
           </div>
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
            onClick={handleSubmit}
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
      </div>

 
    </div>
  );
};
