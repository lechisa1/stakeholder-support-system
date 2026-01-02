"use client";

import { motion } from "framer-motion";
import { ArrowRight, Clock, X } from "lucide-react";
import { formatStatus } from "../../utils/statusFormatter";

interface User {
  full_name: string;
}

interface Escalation {
  fromTierNode: { name: string };
  toTierNode: { name: string };
  escalated_at: string;
}

interface Resolution {
  reason: string;
  resolved_at: string;
}

interface IssueHistoryLog {
  history_id: string;
  action: string;
  status_at_time: string;
  created_at: string;
  performed_by: User;
  escalation?: Escalation | null;
  resolution?: Resolution | null;
}

interface LogsPreviewProps {
  logs: IssueHistoryLog[];
  onClose?: () => void;
}

export default function IssueHistoryLog({ logs, onClose }: LogsPreviewProps) {
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "resolved":
        return "bg-green-100 text-green-800 border-green-200";
      case "in progress":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "escalated":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getActionColor = (log: IssueHistoryLog) => {
    if (log.resolution) return "bg-green-50 border-green-200";
    if (log.escalation) return "bg-purple-50 border-purple-200";
    return "bg-gray-50 border-gray-200";
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      transition={{ duration: 0.35, ease: "easeInOut" }}
      className="absolute top-0 right-0 w-full lg:w-[360px] bg-white border-l border-[#D5E3EC] h-full flex flex-col gap-3 shadow-lg overflow-y-auto"
    >
      <div className="p-6 relative border-b border-[#D5E3EC] bg-gradient-to-r from-[#1E516A] to-[#2C6B8A]">
        <h2 className="text-xl font-bold text-white">Support Request Timeline</h2>
        <p className="text-white text-sm mt-1">View the timeline of the support request</p>
     <div className="absolute top-5 right-5">
     {onClose && (
          <button
            onClick={onClose}
            className="text-white font-bold hover:text-white transition-colors"
          >
            <X className="w-5 font-bold h-5" />
          </button>
        )}
        </div>
      </div>


      <div className="relative px-4 my-5 mb-8">
        {/* Vertical timeline line */}
        <div className="absolute left-5 top-2 bottom-2 w-0.5 bg-gradient-to-b from-blue-200 via-purple-200 to-green-200"></div>

        <div className="space-y-4">
          {logs.map((log, index) => (
            <div key={log.history_id} className="relative flex gap-3">
              {/* Timeline number */}
              <div className="relative w-6 h-6 ">
                <div
                  className={`w-6 h-6 bg-blue-500 text-white absolute text-xs top-0 -left-2 rounded-full border-2 border-white flex items-center justify-center z-10 font-semibold `}
                >
                  {index + 1}
                </div>
              </div>

              {/* Content card */}
              <div
                className={`flex-1 p-2 rounded-lg border -ml-2 text-sm ${getActionColor(
                  log
                )}`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium text-gray-700">
                    {log.performed_by?.full_name || "System"}
                  </span>
                  <span
                    className={`px-1 py-0.5 rounded-full text-[10px] font-semibold border ${getStatusColor(
                      log.status_at_time
                    )}`}
                  >
                    {formatStatus(log.status_at_time) || "N/A"}
                  </span>
                </div>

                {/* Action description */}
                <div className="flex justify-between items-center">
                  <p className="capitalize mb-1 text-gray-800">{log.action}</p>

                  {log.escalation && (
                    <div className="flex items-center gap-1 text-purple-700 bg-purple-50 p-1 rounded border border-purple-100 text-[11px]">
                      <span className="font-medium">
                        {log.escalation.fromTierNode.name}
                      </span>
                      <ArrowRight className="w-3 h-3" />
                      <span className="font-medium">
                        {log.escalation.toTierNode?.name ?? "EAII"}
                      </span>
                    </div>
                  )}
                </div>

                {/* {log.resolution && (
                  <div className="flex items-center gap-1 text-green-700 bg-green-50 p-1 rounded border border-green-100 text-[11px]">
                    {log.resolution.reason}
                  </div>
                )} */}

                {/* Timestamp */}
                <div className="flex items-center gap-1 text-[10px] text-gray-500 mt-1">
                  <Clock className="w-3 h-3" />
                  {new Date(log.created_at).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {logs.length === 0 && (
        <div className="text-center py-6 text-gray-500 text-sm">
          <Clock className="w-10 h-10 mx-auto mb-1 text-gray-300" />
          <p>No history available</p>
        </div>
      )}
    </motion.div>
  );
}
