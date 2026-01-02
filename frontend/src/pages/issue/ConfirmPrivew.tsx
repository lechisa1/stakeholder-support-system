"use client";

import { motion } from "framer-motion";
import { toast } from "sonner";
import { CheckCircle, AlertCircle } from "lucide-react";
import { useConfirmIssueResolvedMutation } from "../../redux/services/issueApi";

interface ConfirmPreviewProps {
  issue_id: string;
  onClose?: () => void;
  onSuccess?: () => void;
  issueTitle?: string;
}

export default function ConfirmPreview({
  issue_id,
  onClose,
  onSuccess,
  issueTitle,
}: ConfirmPreviewProps) {
  const [confirmIssueResolved, { isLoading }] =
    useConfirmIssueResolvedMutation();

  const handleConfirmIssueSolved = async () => {
    if (!issue_id) {
      toast.error("Issue ID is required");
      return;
    }

    try {
      const res = await confirmIssueResolved({ issue_id: issue_id }).unwrap();

      toast.success(res.message || "Issue marked as resolved and closed!", {
        icon: <CheckCircle className="w-5 h-5" />,
      });

      // Call success callback
      onSuccess?.();

      // Close the preview
      onClose?.();
    } catch (error: any) {
      console.error("Failed to confirm issue resolution:", error);
      toast.error(
        error?.data?.message ||
          "Failed to update issue status. Please try again."
      );
    }
  };

  const handleCancel = () => {
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
      <div className="p-6 border-b border-[#D5E3EC] bg-gradient-to-r from-[#2E7D32] to-[#4CAF50]">
        <div className="flex items-center gap-3">
          <CheckCircle className="w-6 h-6 text-white" />
          <div>
            <h2 className="text-xl font-bold text-white">Confirm Resolution</h2>
            <p className="text-white/90 text-sm mt-1">
              Mark this issue as successfully resolved
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col px-6 py-4 gap-6 flex-grow overflow-y-auto">
        {/* Warning/Info Section */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-amber-800 mb-1">
                Before Confirming
              </h4>
              <ul className="text-sm text-amber-700 space-y-1">
                <li>✓ Ensure the issue has been fully resolved</li>
                <li>✓ Verify all required actions have been completed</li>
                <li>✓ Make sure no further work is needed</li>
                <li>⚠️ This action will change issue status to "Closed"</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Issue Details (Optional) */}
        {issueTitle && (
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <h4 className="font-medium text-gray-700 mb-2">Issue Details</h4>
            <p className="text-sm text-gray-600 truncate" title={issueTitle}>
              {issueTitle}
            </p>
            <p className="text-xs text-gray-500 mt-2">ID: {issue_id}</p>
          </div>
        )}

        {/* Consequences Section */}
        <div className="border border-blue-100 bg-blue-50 rounded-lg p-4">
          <h4 className="font-medium text-blue-800 mb-2">What happens next?</h4>
          <ul className="text-sm text-blue-700 space-y-2">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <span>Issue status will be changed to "Closed"</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <span>Resolution will be marked as complete in the system</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <span>Issue will be moved to archived/closed records</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <span>Reporter will be notified about the resolution</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-6 border-t border-[#D5E3EC] bg-gray-50">
        <div className="flex flex-col gap-3">
          <p className="text-sm text-gray-600 text-center">
            Are you sure you want to confirm this issue as resolved?
          </p>
          <div className="w-full flex justify-end gap-3">
            <button
              onClick={handleCancel}
              disabled={isLoading}
              className="px-5 py-2.5 rounded-lg bg-gray-100 border border-gray-300 text-gray-700 font-medium text-sm hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmIssueSolved}
              disabled={isLoading}
              className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-[#2E7D32] to-[#4CAF50] text-white font-medium text-sm hover:from-[#1B5E20] hover:to-[#2E7D32] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Confirming...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Confirm Resolved
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
