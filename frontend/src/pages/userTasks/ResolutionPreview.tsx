"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { FileUploadField } from "../../components/common/FileUploadField";
import { useResolveIssueMutation } from "../../redux/services/issueResolutionApi";

interface ResolutionPreviewProps {
  issue_id: string;
  resolved_by: string;
  onClose?: () => void;
}

export default function ResolutionPreview({
  issue_id,
  resolved_by,
  onClose,
}: ResolutionPreviewProps) {
  const [reason, setReason] = useState("");
  const [attachmentIds, setAttachmentIds] = useState<string[]>([]);

  const [resolveIssue, { isLoading }] = useResolveIssueMutation();

  const handleSubmit = async () => {
    if (!reason.trim()) {
      return toast.error("Please provide a resolution reason.");
    }

    try {
      await resolveIssue({
        issue_id,
        reason,
        resolved_by,
        attachment_ids: attachmentIds,
      }).unwrap();

      toast.success("Issue resolved successfully!");
      onClose?.();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to resolve issue.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      transition={{ duration: 0.35, ease: "easeInOut" }}
      className="absolute top-0 right-0 w-full lg:w-[360px] bg-white border-l border-[#D5E3EC] h-full rounded-r-lg flex flex-col gap-4 shadow-lg"
    >
      <div className="p-6 border-b border-[#D5E3EC] bg-gradient-to-r from-[#1E516A] to-[#2C6B8A]">
        <h2 className="text-xl font-bold text-white">Resolve Request</h2>
        <p className="text-white text-sm mt-1">Upload files related to the resolution</p>
      </div>
      <div className="flex flex-col px-4 gap-3">

      <h4 className="font-semibold text-[#1E516A] mt-4">Summary</h4>
        <textarea
          className="w-full border border-[#BFD7EA] rounded-lg p-3 text-sm h-32 focus:outline-none focus:ring-2 focus:ring-[#1E516A]"
          placeholder="Explain how this issue was resolved"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
        <FileUploadField
        className="flex flex-col gap-1 font-bold"
          id="resolution_attachments"
          label="Upload files"
          value={attachmentIds}
          onChange={setAttachmentIds}
          accept="image/*,.pdf,.doc,.docx"
          multiple={true}
          labelClass="text-sm  text-[#1E516A] "
        />


        <div className="w-full flex justify-end gap-3 mt-3">
        <button
            onClick={onClose}
            disabled={isLoading}
            className="px-5 py-2 rounded-md bg-gray-200 border text-gray-700 font-semibold disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-5 py-2 rounded-md bg-[#1E516A] text-white font-semibold disabled:opacity-50"
          >
            {isLoading ? "Submitting..." : "Confirm"}
          </button>
         
        </div>
      </div>
    </motion.div>
  );
}
