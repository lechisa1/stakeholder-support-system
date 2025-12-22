import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import PageMeta from "../../components/common/PageMeta";
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  Image as ImageIcon,
  Eye,
  ChevronDown,
  ChevronUp,
  X,
} from "lucide-react";
import {
  useConfirmIssueResolvedMutation,
  useGetIssueByIdQuery,
} from "../../redux/services/issueApi";
import FileViewer from "../../components/common/FileView";
import { getFileType, getFileUrl } from "../../utils/fileUrl";
import { useGetCurrentUserQuery } from "../../redux/services/authApi";
import { canConfirm } from "../../utils/taskHelper";
import IssueHistoryLog from "../userTasks/IssueHistoryLog";
import TimelineOpener from "../../components/common/TimelineOpener";
import { Button } from "../../components/ui/cn/button";
import { toast } from "sonner";
import { formatStatus } from "../../utils/statusFormatter";
import DetailHeader from "../../components/common/DetailHeader";
import { useBreadcrumbTitleEffect } from "../../hooks/useBreadcrumbTitleEffect";

export default function UserIssueDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: issue, isLoading, isError } = useGetIssueByIdQuery(id!);
  const { t } = useTranslation();
  const [modalImageIndex, setModalImageIndex] = useState<number | null>(null);
  const [confirmIssue, setConfirmIssue] = useState(false);
  const [openTimeline, setOpenTimeline] = useState(false);
  const [confirmIssueResolved, { isLoading: isConfirming }] =
    useConfirmIssueResolvedMutation();

  // State for accordions
  const [expandedEscalations, setExpandedEscalations] = useState<string[]>([]);
  const [expandedResolutions, setExpandedResolutions] = useState<string[]>([]);
  const [expandedSections, setExpandedSections] = useState({
    escalations: true,
    resolutions: true,
  });

  const [fileViewerState, setFileViewerState] = useState<{
    files: any[];
    index: number;
  } | null>(null);
  const { data: loggedUser } = useGetCurrentUserQuery();
  const userId = loggedUser?.user?.user_id || "";

  useEffect(() => {
    setConfirmIssue(canConfirm(userId, issue?.status, issue));
  }, [userId, issue?.status, issue]);

  useBreadcrumbTitleEffect(issue?.ticket_number, issue?.id);
  // Toggle accordion sections
  const toggleSection = (section: "escalations" | "resolutions") => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Toggle individual escalation accordion
  const toggleEscalation = (escalationId: string) => {
    setExpandedEscalations((prev) =>
      prev.includes(escalationId)
        ? prev.filter((id) => id !== escalationId)
        : [...prev, escalationId]
    );
  };

  // Toggle individual resolution accordion
  const toggleResolution = (resolutionId: string) => {
    setExpandedResolutions((prev) =>
      prev.includes(resolutionId)
        ? prev.filter((id) => id !== resolutionId)
        : [...prev, resolutionId]
    );
  };

  // Expand/Collapse all escalations
  const toggleAllEscalations = () => {
    if (!issue?.escalations) return;
    if (expandedEscalations.length === issue.escalations.length) {
      setExpandedEscalations([]);
    } else {
      setExpandedEscalations(
        issue.escalations.map((esc) => esc.escalation_id)
      );
    }
  };

  // Expand/Collapse all resolutions
  const toggleAllResolutions = () => {
    if (!issue?.resolutions) return;
    if (expandedResolutions.length === issue.resolutions.length) {
      setExpandedResolutions([]);
    } else {
      setExpandedResolutions(
        issue.resolutions.map((res) => res.resolution_id)
      );
    }
  };

  // Map issue attachments to files array with proper URLs and file info
  const issueFiles =
    issue?.attachments?.map((attachment) => ({
      url: getFileUrl(attachment.attachment.file_path),
      name: attachment.attachment.file_name,
      path: attachment.attachment.file_path,
      type: getFileType(attachment.attachment.file_name),
      uploadedAt: attachment.attachment.created_at,
    })) || [];

  // Get file icon based on type
  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case "image":
        return <ImageIcon className="w-5 h-5 text-blue-500" />;
      case "pdf":
        return <FileText className="w-5 h-5 text-red-500" />;
      case "document":
        return <FileText className="w-5 h-5 text-blue-600" />;
      default:
        return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };

  // File card component for consistent styling
  const FileCard = ({ file, onOpen }: { file: any; onOpen: () => void }) => (
    <div
      className="border border-[#BFD7EA] rounded-lg p-3 hover:shadow-md transition-all duration-200 cursor-pointer group bg-white hover:bg-blue-50"
      onClick={onOpen}
    >
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0">{getFileIcon(file.type)}</div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm text-gray-800 truncate">
            {file.name}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {file.type} • {new Date(file.uploadedAt).toLocaleDateString()}
          </p>
        </div>
        <Eye className="w-4 h-4 text-blue-600 opacity-70 group-hover:opacity-100 transition-opacity" />
      </div>
    </div>
  );

  const prevImage = () => {
    if (modalImageIndex !== null) {
      setModalImageIndex(
        (modalImageIndex - 1 + issueFiles.length) % issueFiles.length
      );
    }
  };

  const nextImage = () => {
    if (modalImageIndex !== null) {
      setModalImageIndex((modalImageIndex + 1) % issueFiles.length);
    }
  };

  const openFileViewer = (files: any[], index: number) =>
    setFileViewerState({ files, index });
  const closeFileViewer = () => setFileViewerState(null);
  const closeModal = () => setModalImageIndex(null);

  const handleConfirmIssueSolved = async () => {
    if (!id) return;
    try {
      const res = await confirmIssueResolved({ issue_id: id }).unwrap();
      toast.success(res.message || "Status updated to Closed!");
    } catch (error: any) {
      toast.error(error?.data?.message || "Error updating status.");
      console.error(error);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) return <div>Loading...</div>;
  if (isError || !issue) return <div>Error loading  details</div>;

  return (
    <>
    <DetailHeader breadcrumbs={[
        { title: "Request List", link: "" },
        { title: "Request Detail", link: "" },
      ]} />
      <PageMeta
        title={"Support Request Detail"}
        description={"Review support request details and take appropriate action"}
      />
      <div className="min-h-screen bg-[#F9FBFC] py-6 pb-24 flex flex-col items-start">
        <div
          className={`w-full   mx-auto bg-white shadow-md rounded-xl  border-[#BFD7EA] p-6 relative overflow-hidden`}
        >
          <div
            className={`w-full transition-all duration-500 ease-in-out  ${
              openTimeline ? "lg:pr-[360px]" : ""
            } `}
          >
            <div className="flex flex-col w-full">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4">
                <div>
                  <h2 className="text-[#1E516A] text-xl font-bold mb-1">
                    Support Request Detail
                  </h2>
                  <p className="text-gray-600">
                    Review support request details and take appropriate action
                  </p>
                  
                </div>
                <div className="flex items-center gap-20">
                  {/* color resolved based on status */}
                <span className={`text-base bg-green-100 text-green-900 px-2 py-1 rounded-md ${issue.status === "resolved" ? "text-green-900 " : issue.status === "in_progress" ? "text-blue-500" : issue.status === "closed" ? "text-red-500" : "text-gray-500"}`}>
                  {formatStatus(issue.status)}
                </span>
                {!openTimeline && (
                  <TimelineOpener onOpen={() => setOpenTimeline(true)} />
                )}
                {/* status */}
             
                </div>
              </div>

              <div
                className=" border border-[#BFD7EA] rounded-lg p-6 mb-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
                  <div>
                    <p className="font-semibold text-[#1E516A] text-sm">
                      System
                    </p>
                    <p className="text-gray-700 text-sm">
                      {issue.project?.name || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold text-[#1E516A] text-sm">
                      Category
                    </p>
                    <p className="text-gray-700 text-sm">
                      {issue.category?.name || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold text-[#1E516A] text-sm">
                      Reported By
                    </p>
                    <p className="text-gray-700 text-sm">
                      {issue.reporter?.full_name || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold text-[#1E516A] text-sm">
                      Reported On
                    </p>
                    <p className="text-gray-700 text-sm">
                      {formatDate(issue.issue_occured_time)}
                    </p>
                  </div>
                  <div>
                    <p
                      className={`font-semibold text-[#1E516A]  py-1 rounded-md`}
                    >
                      Priority Level
                    </p>
                    <p className="font-semibold text-sm" style={{ color: issue.priority?.color_value || "#000" }}>
                      {issue.priority?.name || "N/A"}
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-50 border border-[#BFD7EA] rounded-md p-3 text-gray-700">
                    <p className="font-semibold text-[#1E516A] text-sm mb-1">
                      Description
                    </p>
                    <p className="text-gray-700 text-wrap whitespace-pre-line">

                    {issue.description ||
                      issue.title ||
                      "No description provided"}
                      </p>
                  </div>

                  <div className="bg-slate-50 border border-[#BFD7EA] rounded-md p-3 text-gray-700">
                    <p className="font-semibold text-[#1E516A] text-sm mb-1">
                      Action Taken
                    </p>
                    <p className="text-gray-700 text-wrap whitespace-pre-line">
                      {issue.action_taken || "No action taken yet"}
                      </p>
                  </div>
                </div>
                
                {/* Support Request Attachments */}
                {issueFiles.length > 0 && (
                  <div className="bg-white   border-[#BFD7EA] rounded-lg py-3 flex-1 ">
                    <h4 className="font-semibold text-[#1E516A] mb-3">
                      Support Request Attachments ({issueFiles.length})
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {issueFiles.map((file, idx) => (
                        <FileCard
                          key={idx}
                          file={file}
                          onOpen={() => openFileViewer(issueFiles, idx)}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Support Request Escalations Section */}
              {issue?.escalations && issue.escalations.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4 p-3 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-200">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-8 bg-[#6D28D9] rounded-full"></div>
                      <div>
                        <h3 className="text-[#1E516A] font-bold text-lg">
                          Escalations ({issue.escalations.length})
                        </h3>
                        <p className="text-sm text-gray-600">
                          Track all escalation paths
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={toggleAllEscalations}
                        className="text-[#6D28D9] border-[#6D28D9] hover:bg-purple-50"
                      >
                        {expandedEscalations.length === issue.escalations.length
                          ? "Collapse All"
                          : "Expand All"}
                      </Button>
                      <button
                        onClick={() => toggleSection("escalations")}
                        className="p-2 hover:bg-white rounded-lg transition-colors"
                      >
                        {expandedSections.escalations ? (
                          <ChevronUp className="w-5 h-5 text-[#6D28D9]" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-[#6D28D9]" />
                        )}
                      </button>
                    </div>
                  </div>

                  <AnimatePresence>
                    {expandedSections.escalations && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-4"
                      >
                        {issue.escalations.map((escalation, escalationIndex) => {
                          const isExpanded = expandedEscalations.includes(
                            escalation.escalation_id
                          );
                          const escalationFiles =
                            escalation.attachments?.map((attachment) => ({
                              url: getFileUrl(attachment.attachment.file_path),
                              name: attachment.attachment.file_name,
                              path: attachment.attachment.file_path,
                              type: getFileType(attachment.attachment.file_name),
                              uploadedAt: attachment.attachment.created_at,
                              escalationId: escalation.escalation_id,
                              escalatedBy: escalation.escalator?.full_name,
                              escalatedAt: escalation.escalated_at,
                              reason: escalation.reason,
                              fromTier: escalation.fromTierNode?.name || "N/A",
                              toTier: escalation.toTierNode?.name || "EAII",
                            })) || [];

                          return (
                            <div
                              key={escalation.escalation_id}
                              className="border border-[#BFD7EA] rounded-lg overflow-hidden"
                            >
                              {/* Escalation Header */}
                              <div
                                className="p-4 cursor-pointer hover:bg-purple-50 transition-colors flex items-center justify-between"
                                onClick={() =>
                                  toggleEscalation(escalation.escalation_id)
                                }
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                                    <span className="font-bold text-purple-700">
                                      {escalationIndex + 1}
                                    </span>
                                  </div>
                                  <div>
                                    <h4 className="font-semibold text-[#1E516A]">
                                      {escalation.fromTierNode?.name || "Unknown"} →{" "}
                                      {escalation.toTierNode?.name || "EAII"}
                                    </h4>
                                    <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                                      <span>
                                        By: {escalation.escalator?.full_name || "N/A"}
                                      </span>
                                      {/* <span>On:</span> */}
                                      <span>On: {formatDate(escalation.escalated_at)}</span>
                                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        escalation.status === "completed"
                                          ? "bg-green-100 text-green-800"
                                          : escalation.status === "in_progress"
                                          ? "bg-yellow-100 text-yellow-800"
                                          : "bg-blue-100 text-blue-800"
                                      }`}>
                                        {formatStatus(escalation.status) || "pending"}

                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  {escalationFiles.length > 0 && (
                                    <span className="text-sm text-gray-500 flex items-center gap-1">
                                      <FileText className="w-4 h-4" />
                                      {escalationFiles.length}
                                    </span>
                                  )}
                                  {isExpanded ? (
                                    <ChevronUp className="w-5 h-5 text-[#6D28D9]" />
                                  ) : (
                                    <ChevronDown className="w-5 h-5 text-[#6D28D9]" />
                                  )}
                                </div>
                              </div>

                              {/* Escalation Content (Accordion Body) */}
                              <AnimatePresence>
                                {isExpanded && (
                                  <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="p-4 border-t border-[#BFD7EA] bg-white"
                                  >
                                    {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                                      <div>
                                        <p className="font-semibold text-[#1E516A] text-sm">
                                          Escalated From
                                        </p>
                                        <p className="text-gray-700">
                                          {escalation.fromTierNode?.name || "N/A"}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="font-semibold text-[#1E516A] text-sm">
                                          Escalated To
                                        </p>
                                        <p className="text-gray-700">
                                          {escalation.toTierNode?.name || "EAII"}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="font-semibold text-[#1E516A] text-sm">
                                          Escalated By
                                        </p>
                                        <p className="text-gray-700">
                                          {escalation.escalator?.full_name || "N/A"}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="font-semibold text-[#1E516A] text-sm">
                                          Escalated On
                                        </p>
                                        <p className="text-gray-700">
                                          {formatDate(escalation.escalated_at)}
                                        </p>
                                      </div>
                                    </div> */}

                                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div className="bg-[#094C810D] border border-[#BFD7EA] rounded-md p-3">
                                        <p className="font-semibold text-[#1E516A] text-sm mb-1">
                                          Escalation Reason
                                        </p>
                                        <p className="text-gray-700">
                                          {escalation.reason || "No reason provided"}
                                        </p>
                                      </div>
                                      <div className="bg-[#094C810D] border border-[#BFD7EA] rounded-md p-3 text-gray-700">
                                          <p className="font-semibold text-[#1E516A] text-sm mb-1">
                                            Reporter Contact
                                            </p>
                                          <p className="text-gray-600">
                                            {escalation?.escalator?.full_name || "N/A"}
                                            </p>
                                            <p className="text-gray-500 text-xs mt-1">
                                            {escalation?.escalator?.phone_number || "No phone number"}
                                            {/* add email */}
                                            </p>
                                             
                                      </div>
                                    </div>

                                    {/* Escalation Attachments */}
                                    {escalationFiles.length > 0 && (
                                      <div className="mt-4">
                                        <h5 className="font-semibold text-[#1E516A] mb-3">
                                          Attachments ({escalationFiles.length})
                                        </h5>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                          {escalationFiles.map((file, idx) => (
                                            <FileCard
                                              key={`${escalation.escalation_id}-${idx}`}
                                              file={file}
                                              onOpen={() =>
                                                openFileViewer(
                                                  escalationFiles,
                                                  idx
                                                )
                                              }
                                            />
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Support Request Resolutions Section */}
              {issue?.resolutions && issue.resolutions.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-8 bg-green-600 rounded-full"></div>
                      <div>
                        <h3 className="text-[#1E516A] font-bold text-lg">
                          Resolutions ({issue.resolutions.length})
                        </h3>
                        <p className="text-sm text-gray-600">
                          All resolution attempts
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={toggleAllResolutions}
                        className="text-green-700 border-green-700 hover:bg-green-50"
                      >
                        {expandedResolutions.length === issue.resolutions.length
                          ? "Collapse All"
                          : "Expand All"}
                      </Button>
                      <button
                        onClick={() => toggleSection("resolutions")}
                        className="p-2 hover:bg-white rounded-lg transition-colors"
                      >
                        {expandedSections.resolutions ? (
                          <ChevronUp className="w-5 h-5 text-green-700" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-green-700" />
                        )}
                      </button>
                    </div>
                  </div>

                  <AnimatePresence>
                    {expandedSections.resolutions && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-4"
                      >
                        {issue.resolutions.map((resolution, resolutionIndex) => {
                          const isExpanded = expandedResolutions.includes(
                            resolution.resolution_id
                          );
                          const resolutionFiles =
                            resolution.attachments?.map((attachment) => ({
                              url: getFileUrl(attachment.attachment.file_path),
                              name: attachment.attachment.file_name,
                              path: attachment.attachment.file_path,
                              type: getFileType(attachment.attachment.file_name),
                              uploadedAt: attachment.attachment.created_at,
                              resolutionId: resolution.resolution_id,
                              resolvedBy: resolution.resolver?.full_name,
                              resolvedAt: resolution.resolved_at,
                              reason: resolution.reason,
                            })) || [];

                          return (
                            <div
                              key={resolution.resolution_id}
                              className="border border-[#BFD7EA] rounded-lg overflow-hidden"
                            >
                              {/* Resolution Header */}
                              <div
                                className="p-4 cursor-pointer hover:bg-green-50 transition-colors flex items-center justify-between"
                                onClick={() =>
                                  toggleResolution(resolution.resolution_id)
                                }
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                                    <span className="font-bold text-green-700">
                                      {resolutionIndex + 1}
                                    </span>
                                  </div>
                                  <div>
                                    <h4 className="font-semibold text-[#1E516A]">
                                      {resolution.resolver?.full_name || "Unknown"}
                                    </h4>
                                    <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                                      <span>
                                        By {resolution.resolver?.full_name || "N/A"}
                                      </span>
                                      <span>•</span>
                                      <span>On: {formatDate(resolution.resolved_at)}</span>
                                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        {resolution.status || "resolved"}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  {resolutionFiles.length > 0 && (
                                    <span className="text-sm text-gray-500 flex items-center gap-1">
                                      <FileText className="w-4 h-4" />
                                      {resolutionFiles.length}
                                    </span>
                                  )}
                                  {isExpanded ? (
                                    <ChevronUp className="w-5 h-5 text-green-700" />
                                  ) : (
                                    <ChevronDown className="w-5 h-5 text-green-700" />
                                  )}
                                </div>
                              </div>

                              {/* Resolution Content (Accordion Body) */}
                              <AnimatePresence>
                                {isExpanded && (
                                  <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="p-4 border-t border-[#BFD7EA] bg-white"
                                  >
                                    {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                                      <div>
                                        <p className="font-semibold text-[#1E516A] text-sm">
                                          Resolved By
                                        </p>
                                        <p className="text-gray-700">
                                          {resolution.resolver?.full_name || "N/A"}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="font-semibold text-[#1E516A] text-sm">
                                          Resolver Position
                                        </p>
                                        <p className="text-gray-700">
                                          {resolution.resolver?.position || "N/A"}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="font-semibold text-[#1E516A] text-sm">
                                          Resolved On
                                        </p>
                                        <p className="text-gray-700">
                                          {formatDate(resolution.resolved_at)}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="font-semibold text-[#1E516A] text-sm">
                                          Resolution Status
                                        </p>
                                        <p className="text-gray-700">
                                          {resolution.status || "resolved"}
                                        </p>
                                      </div>
                                    </div> */}

                                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div className="bg-[#094C810D] border border-[#BFD7EA] rounded-md p-3">
                                        <p className="font-semibold text-[#1E516A] text-sm mb-1">
                                          Resolution Reason
                                        </p>
                                        <p className="text-gray-700">
                                          {resolution.reason || "No reason provided"}
                                        </p>
                                      </div>
                                      <div className="bg-[#094C810D] border border-[#BFD7EA] rounded-md p-3">
                                        <p className="font-semibold text-[#1E516A] text-sm mb-1">
                                          Resolver Contact
                                        </p>
                                        <div className="text-sm">
                                          <p className="text-gray-600">
                                            {resolution.resolver?.email || "N/A"}
                                          </p>
                                          <p className="text-gray-500 text-xs mt-1">
                                            {resolution.resolver?.phone_number ||
                                              "No phone number"}
                                          </p>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Resolution Attachments */}
                                    {resolutionFiles.length > 0 && (
                                      <div className="mt-4">
                                        <h5 className="font-semibold text-[#1E516A] mb-3">
                                          Attachments ({resolutionFiles.length})
                                        </h5>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                          {resolutionFiles.map((file, idx) => (
                                            <FileCard
                                              key={`${resolution.resolution_id}-${idx}`}
                                              file={file}
                                              onOpen={() =>
                                                openFileViewer(
                                                  resolutionFiles,
                                                  idx
                                                )
                                              }
                                            />
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {confirmIssue && (
                <>
                  <h3 className="text-[#1E516A] font-semibold text-lg mt-4 mb-3 flex items-center gap-2">
                    🎯 Confirm Request is resolved
                  </h3>
                  <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <Button
                      onClick={handleConfirmIssueSolved}
                      disabled={isConfirming}
                    >
                      {isConfirming ? "Confirming..." : "Confirm Resolved"}
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* File Viewer Modal with next/prev navigation */}
          {fileViewerState && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 bg-opacity-75 p-4">
              <div className="bg-white rounded-lg w-full max-w-6xl h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-4 border-b">
                  <h3 className="text-lg font-semibold text-[#1E516A]">
                    File Preview <span className="text-xs text-gray-500">
                    ({fileViewerState.files[fileViewerState.index].name})
                    </span>
                  </h3>
                  <button
                    onClick={closeFileViewer}
                    className="p-2 hover:bg-gray-100 rounded-full"
                  >
                    <X className="w-5 h-5" />

                  </button>
                </div>
                <div className="flex-1 p-4 flex flex-col">
                  <div className="flex-1">
                    <FileViewer
                      fileUrl={fileViewerState.files[fileViewerState.index].url}
                    />
                  </div>
                  {fileViewerState.files.length > 1 && (
                    <div className="mt-4 flex items-center justify-between">
                      <button
                        className="flex items-center gap-1 px-3 py-1 rounded-md border border-gray-300 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() =>
                          setFileViewerState((prev) =>
                            !prev
                              ? prev
                              : {
                                  ...prev,
                                  index:
                                    (prev.index - 1 + prev.files.length) %
                                    prev.files.length,
                                }
                          )
                        }
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Previous
                      </button>
                      <span className="text-xs text-gray-500">
                        {fileViewerState.index + 1} /{" "}
                        {fileViewerState.files.length}
                      </span>
                      <button
                        className="flex items-center gap-1 px-3 py-1 rounded-md border border-gray-300 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() =>
                          setFileViewerState((prev) =>
                            !prev
                              ? prev
                              : {
                                  ...prev,
                                  index:
                                    (prev.index + 1) % prev.files.length,
                                }
                          )
                        }
                      >
                        Next
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Image Gallery Modal */}
          {modalImageIndex !== null && issueFiles.length > 0 && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
              onClick={closeModal}
            >
              <div
                className="relative max-w-[90%] max-h-[90%] bg-white rounded-lg overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <img
                  src={issueFiles[modalImageIndex].url}
                  alt={`Attachment ${modalImageIndex + 1}`}
                  className="max-w-full max-h-full object-contain"
                />
                <button
                  className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-2 hover:bg-opacity-70"
                  onClick={closeModal}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                {issueFiles.length > 1 && (
                  <>
                    <button
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white bg-black/50 rounded-full p-2 hover:bg-opacity-70"
                      onClick={prevImage}
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white bg-black/50  rounded-full p-2 hover:bg-opacity-70"
                      onClick={nextImage}
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </>
                )}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white bg-black/50  rounded-full px-3 py-1 text-sm">
                  {modalImageIndex + 1} / {issueFiles.length}
                </div>
              </div>
            </div>
          )}

          <AnimatePresence>
            {openTimeline && (
              <IssueHistoryLog
                logs={issue?.history || []}
                onClose={() => setOpenTimeline(false)}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}


