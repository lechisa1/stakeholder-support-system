"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { XCircle, AlertTriangle } from "lucide-react";
import { FileUploadField } from "../../components/common/FileUploadField";
import { useRejectIssueMutation } from "../../redux/services/issueRejectApi";

interface RejectPreviewProps {
  issue_id: string;
  rejected_by: string;
  onClose?: () => void;
  onSuccess?: () => void;
  issueTitle?: string;
}

export default function RejectPreview({
  issue_id,
  rejected_by,
  onClose,
  onSuccess,
  issueTitle,
}: RejectPreviewProps) {
  const [reason, setReason] = useState("");
  const [attachmentIds, setAttachmentIds] = useState<string[]>([]);

  const [rejectIssue, { isLoading }] = useRejectIssueMutation();

  const handleSubmit = async () => {
    if (!reason.trim()) {
      return toast.error("Please provide a reason for rejecting the issue.");
    }

    try {
      await rejectIssue({
        issue_id,
        reason,
        rejected_by,
        attachment_ids: attachmentIds.length > 0 ? attachmentIds : undefined,
      }).unwrap();

      toast.success("Issue rejected successfully!", {
        icon: <XCircle className="w-5 h-5" />,
      });

      // Reset form
      setReason("");
      setAttachmentIds([]);

      // Call success callback
      onSuccess?.();

      // Close the preview
      onClose?.();
    } catch (error: any) {
      console.error("Failed to reject issue:", error);
      toast.error(
        error?.data?.message ||
          error?.data?.error ||
          "Failed to reject issue. Please try again."
      );
    }
  };

  const handleCancel = () => {
    // Reset form
    setReason("");
    setAttachmentIds([]);

    // Close the preview
    onClose?.();
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      transition={{ duration: 0.35, ease: "easeInOut" }}
      className="absolute top-0 right-0 w-full lg:w-[360px] bg-white border-l border-[#D5E3EC] h-full rounded-r-lg flex flex-col gap-4 shadow-lg"
    >
      {/* Header */}
      <div className="p-6 border-b border-[#D5E3EC] bg-gradient-to-r from-[#C62828] to-[#E53935]">
        <div className="flex items-center gap-3">
          <XCircle className="w-6 h-6 text-white" />
          <div>
            <h2 className="text-xl font-bold text-white">Reject Issue</h2>
            <p className="text-white/90 text-sm mt-1">
              Provide reasons for rejecting this issue
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col px-6 gap-4 overflow-y-auto flex-grow">
        {/* Warning Section */}
        <div className="mt-2">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-red-800 mb-1">
                  Rejection Guidelines
                </h4>
                <ul className="text-sm text-red-700 space-y-1">
                  <li>✓ Issue is incomplete or unclear</li>
                  <li>✓ Missing required information or attachments</li>
                  <li>✓ Issue is outside scope or responsibility</li>
                  <li>⚠️ Provide clear reasons for the rejection</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Issue Details (Optional) */}
        {issueTitle && (
          <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
            <h4 className="font-medium text-gray-700 mb-1 text-sm">
              Issue to Reject
            </h4>
            <p className="text-sm text-gray-600 truncate" title={issueTitle}>
              {issueTitle}
            </p>
            <p className="text-xs text-gray-500 mt-1">ID: {issue_id}</p>
          </div>
        )}

        {/* Rejection Reason */}
        <div className="mt-2">
          <h4 className="font-semibold text-gray-700 mb-2">
            Rejection Reason *
          </h4>
          <textarea
            className="w-full border border-gray-300 rounded-lg p-3 text-sm h-40 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
            placeholder="Provide detailed reasons for rejecting this issue"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            disabled={isLoading}
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Clear rejection reasons help the reporter understand what needs to
            be improved.
          </p>
        </div>

        {/* Attachments */}
        <div className="mt-2">
          <FileUploadField
            className="flex flex-col gap-2"
            id="rejection_attachments"
            label="Supporting Documents (Optional)"
            value={attachmentIds}
            onChange={setAttachmentIds}
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
            multiple={true}
            labelClass="text-sm font-semibold text-gray-700"
          />
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-6 border-t border-[#D5E3EC] bg-gray-50">
        <div className="w-full flex justify-end gap-3">
          <button
            onClick={handleCancel}
            disabled={isLoading}
            className="px-5 py-2.5 rounded-lg bg-gray-100 border border-gray-300 text-gray-700 font-medium text-sm hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading || !reason.trim()}
            className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-[#C62828] to-[#E53935] text-white font-medium text-sm hover:from-[#B71C1C] hover:to-[#D32F2F] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Rejecting...
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4" />
                Confirm Rejection
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
