import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import PageMeta from "../../components/common/PageMeta";
import {
  Upload,
  CheckCircle2,
  X,
  ChevronLeft,
  ChevronRight,
  FileText,
  Image as ImageIcon,
  Eye,
  Lock,
  ChevronUp,
  ChevronDown,
  Check,
} from "lucide-react";
import {
  useAcceptIssueMutation,
  useGetIssueByIdQuery,
} from "../../redux/services/issueApi";
import FileViewer from "../../components/common/FileView";
import { getFileType, getFileUrl } from "../../utils/fileUrl";

import { useGetCurrentUserQuery } from "../../redux/services/authApi";
import { getHeirarchyStructure } from "../../utils/hierarchUtils";

import {
  canAssign,
  canConfirm,
  canEscalate,
  canInternallyMarkInProgress,
  canInternallyResolve,
  canMarkInProgress,
  canResolve,
} from "../../utils/taskHelper";
import TimelineOpener from "../../components/common/TimelineOpener";
import IssueHistoryLog from "../../pages/userTasks/IssueHistoryLog";
import ResolutionPreview from "../../pages/userTasks/ResolutionPreview";
import AssignmentPreview from "./AssignmentPreview";
import { useGetUserInternalNodesByProjectQuery } from "../../redux/services/internalNodeApi";
import { toast } from "sonner";
import { formatStatus } from "../../utils/statusFormatter";
import DetailHeader from "../../components/common/DetailHeader";
import { useBreadcrumbTitleEffect } from "../../hooks/useBreadcrumbTitleEffect";
export default function InternalTaskDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: issue, isLoading, isError } = useGetIssueByIdQuery(id!);
  const { t } = useTranslation();
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [modalImageIndex, setModalImageIndex] = useState<number | null>(null);
  const [acceptIssue, { isLoading: isAccepting }] = useAcceptIssueMutation();
  const [escalateIssue, setEscalateIssue] = useState(false);
  const [assignIssue, setAssignIssue] = useState(false);
  const [resolveIssue, setResolveIssue] = useState(false);
  const [markIssue, setMarkIssue] = useState(false);
  const [openTimeline, setOpenTimeline] = useState(false);
  const [project_id, setProjectId] = useState("");
  const [internal_node_id, setInternalNodeId] = useState("");
  const [fileViewerState, setFileViewerState] = useState<{
    files: any[];
    index: number;
  } | null>(null);
  const [hierarchyStructure, setHierarchyStructure] = useState<any>(null);

  // Collapsible sections state
  const [expandedEscalations, setExpandedEscalations] = useState<string[]>([]);
  const [expandedResolutions, setExpandedResolutions] = useState<string[]>([]);
  const [expandedSections, setExpandedSections] = useState({
    escalations: true,
    resolutions: true,
  });

  const { data: loggedUser, isLoading: userLoading } = useGetCurrentUserQuery();
  const userId = loggedUser?.user?.user_id || "";
  const {
    data: userProjectNode,
    isLoading: isLoadingNode,
    isError: nodeError,
  } = useGetUserInternalNodesByProjectQuery(project_id, {
    skip: !project_id,
  });
  // assignments
  console.log("userProjectNode: ", userProjectNode);

  useEffect(() => {
    if (loggedUser?.user?.project_roles && issue?.project?.project_id) {
      const hierarchy = getHeirarchyStructure(issue.project.project_id, {
        project_roles: loggedUser.user.project_roles,
      });
      setHierarchyStructure(hierarchy);
    }
  }, [loggedUser?.user?.project_roles, issue?.project?.project_id]);

  useEffect(() => {
    setEscalateIssue(canEscalate(userId, issue?.status, issue));
  }, [userId, issue?.status, issue]);

  useEffect(() => {
    setAssignIssue(canAssign(userId, issue?.status, issue));
  }, [userId, issue?.status, issue]);

  useEffect(() => {
    setResolveIssue(canInternallyResolve(userId, issue?.status, issue));
  }, [userId, issue?.status, issue]);

  useEffect(() => {
    setMarkIssue(canInternallyMarkInProgress(userId, issue?.status, issue));
  }, [userId, issue?.status, issue]);

  useEffect(() => {
    setProjectId(issue?.project_id);
  }, [issue?.project_id, issue]);

  useEffect(() => {
    if (userProjectNode?.assignments?.length) {
      setInternalNodeId(
        userProjectNode.assignments[0].internal_node?.internal_node_id || ""
      );
    } else {
      setInternalNodeId("");
    }
  }, [userProjectNode]);

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

  const handleMarkAsInProgress = async () => {
    if (!id) return;
    try {
      const res = await acceptIssue({ issue_id: id }).unwrap();
      toast.success(res.message || "Status updated to In Progress!");
    } catch (error: any) {
      toast.error(error?.data?.message || "Error updating status.");
      console.error(error);
    }
  };

  const handleActions = async (value: string) => {
    setOpenTimeline(false);
    setSelectedAction(value);
  };

  // Toggle accordion sections
  const toggleSection = (section: "escalations" | "resolutions") => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const toggleEscalation = (escalationId: string) => {
    setExpandedEscalations((prev) =>
      prev.includes(escalationId)
        ? prev.filter((id) => id !== escalationId)
        : [...prev, escalationId]
    );
  };

  const toggleResolution = (resolutionId: string) => {
    setExpandedResolutions((prev) =>
      prev.includes(resolutionId)
        ? prev.filter((id) => id !== resolutionId)
        : [...prev, resolutionId]
    );
  };

  const toggleAllEscalations = () => {
    if (!issue?.escalations) return;
    if (expandedEscalations.length === issue.escalations.length) {
      setExpandedEscalations([]);
    } else {
      setExpandedEscalations(
        issue.escalations.map((esc: any) => esc.escalation_id)
      );
    }
  };

  const toggleAllResolutions = () => {
    if (!issue?.resolutions) return;
    if (expandedResolutions.length === issue.resolutions.length) {
      setExpandedResolutions([]);
    } else {
      setExpandedResolutions(
        issue.resolutions.map((res: any) => res.resolution_id)
      );
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

  // Action buttons configuration with permissions
  const actionButtons = [
    {
      key: "mark_as_inprogress",
      label: "Mark as Inprogress",
      desc: markIssue
        ? 'Start working on this support request It will update the status to "In progress"'
        : "Cannot mark in progress - support request is already in progress or you have escalated it",
      color: "#c2b56cff",
      bg: "#E7F3FF",
      border: "#BFD7EA",
      enabled: markIssue,
      // visible: true,
      onClick: () => {
        if (markIssue) {
          handleMarkAsInProgress();
        }
      },
    },
    {
      key: "resolve",
      label: "Resolve Request",
      desc: resolveIssue
        ? "You have fixed the support request. Provide resolution detail to close the support request."
        : "Cannot resolve - only the user who last accepted this support request can resolve it",
      color: "#1E516A",
      bg: "#E7F3FF",
      border: "#BFD7EA",
      enabled: resolveIssue,
      // visible: true,
      onClick: () => resolveIssue && handleActions("resolve"),
    },
    {
      key: "assign",
      label: "Assign Request",
      desc: assignIssue
        ? "Assign this support request to the next responsible user in the workflow."
        : "Cannot assign - support request is not in progress or assignment is not allowed.",
      color: "#1E516A",
      bg: "#E6F3F9",
      border: "#BFD7EA",
      enabled: assignIssue,
      // visible: resolveIssue,
      onClick: () => assignIssue && handleActions("assign"),
    },
  ];
  useBreadcrumbTitleEffect(issue?.ticket_number, issue?.ticket_number);

  if (isLoading) return <div>Loading...</div>;
  if (isError || !issue)
    return <div>Error loading support request details</div>;

  return (
    <>
      <DetailHeader breadcrumbs={[
        { title: "Task List", link: "" },
        { title: "Task Detail", link: "" },
      ]} />
      <PageMeta
        title={"Task Detail"}
        description={"Review task details and take appropriate action"}
      />
      <div className="min-h-screen bg-[#F9FBFC] py-6 pb-24 flex flex-col items-start">
        <div
          className={`w-full  mx-auto bg-white shadow-md rounded-xl  border-dashed border-[#BFD7EA] p-6 relative overflow-hidden`}
        >
          <div
            className={`w-full transition-all duration-500 ease-in-out  ${
              selectedAction || openTimeline ? "lg:pr-[360px]" : ""
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
                  <span
                    className={`text-base bg-green-100 text-green-900 px-2 py-1 rounded-md ${
                      issue.status === "resolved"
                        ? "text-green-900 "
                        : issue.status === "in_progress"
                        ? "text-blue-500"
                        : issue.status === "closed"
                        ? "text-red-500"
                        : "text-gray-500"
                    }`}
                  >
                    {formatStatus(issue.status)}
                  </span>
                  {!openTimeline && (
                    <TimelineOpener onOpen={() => setOpenTimeline(true)} />
                  )}
                  {/* status */}
                </div>
              </div>

              <div className="border border-[#BFD7EA] rounded-xl p-6 mb-6 bg-white shadow-sm">
                {/* Top Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 text-base lg:grid-cols-5 gap-6">
                  <div>
                    <p className="font-semibold text-[#1E516A]   mb-1">
                      System
                    </p>
                    <p className="text-gray-800 text-sm">
                      {issue.project?.name || "N/A"}
                    </p>
                  </div>

                  <div>
                    <p className="font-semibold text-[#1E516A]  mb-1">
                      Category
                    </p>
                    <p className="text-gray-800 text-sm">
                      {issue.category?.name || "N/A"}
                    </p>
                  </div>

                  <div>
                    <p className="font-semibold text-[#1E516A]  mb-1">
                      Reported By
                    </p>
                    <p className="text-gray-800 text-sm">
                      {issue.reporter?.full_name || "N/A"}
                    </p>
                  </div>

                  <div>
                    <p className="font-semibold text-[#1E516A]  mb-1">
                      Reported On
                    </p>
                    <p className="text-gray-800 text-sm">
                      {formatDate(issue.issue_occured_time)}
                    </p>
                  </div>

                  {/* Priority */}
                  <div>
                    <p className="font-semibold text-[#1E516A]  mb-1">
                      Priority Level
                    </p>
                    <span
                      className="font-semibold px-2 py-1 rounded-md text-sm"
                      style={{ color: issue.priority?.color_value || "#000" }}
                    >
                      {issue.priority?.name || "N/A"}
                    </span>
                  </div>
                </div>

                {/* Description + Action Taken */}
                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-50 border border-[#DCE7F1] rounded-lg p-4">
                    <p className="font-semibold text-[#1E516A] text-sm mb-2">
                      Description
                    </p>
                    <p className="text-gray-700 text-wrap whitespace-pre-line">
                      {issue.description ||
                        issue.title ||
                        "No description provided"}
                    </p>
                  </div>

                  <div className="bg-slate-50 border border-[#DCE7F1] rounded-lg p-4">
                    <p className="font-semibold text-[#1E516A] text-sm mb-2">
                      Action Taken
                    </p>
                    <p className="text-gray-700 text-wrap whitespace-pre-line">
                      {issue.action_taken || "No action taken yet"}
                    </p>
                  </div>
                </div>

                {/* Attachments */}
                {issueFiles.length > 0 && (
                  <div className="bg-white   border-[#BFD7EA] rounded-lg py-4">
                    <h4 className="font-semibold text-[#1E516A] mb-3">
                      Support Request Attachments ({issueFiles.length})
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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

              {/* Issue Escalations – collapsible like IssueDetail */}
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
                      <button
                        className="border border-[#6D28D9] text-[#6D28D9] text-xs px-3 py-1 rounded-md hover:bg-purple-50"
                        onClick={toggleAllEscalations}
                      >
                        {expandedEscalations.length === issue.escalations.length
                          ? "Collapse All"
                          : "Expand All"}
                      </button>
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
                        {issue.escalations.map(
                          (escalation: any, escalationIndex: number) => {
                            const isExpanded = expandedEscalations.includes(
                              escalation.escalation_id
                            );
                            const escalationFiles =
                              escalation.attachments?.map(
                                (attachment: any) => ({
                                  url: getFileUrl(
                                    attachment.attachment.file_path
                                  ),
                                  name: attachment.attachment.file_name,
                                  path: attachment.attachment.file_path,
                                  type: getFileType(
                                    attachment.attachment.file_name
                                  ),
                                  uploadedAt: attachment.attachment.created_at,
                                })
                              ) || [];

                            return (
                              <div
                                key={escalation.escalation_id}
                                className="border border-[#BFD7EA] rounded-lg overflow-hidden"
                              >
                                {/* Header */}
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
                                        {escalation.fromTierNode?.name ||
                                          "Unknown"}{" "}
                                        →{" "}
                                        {escalation.toTierNode?.name || "EAII"}
                                      </h4>
                                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                                        <span>
                                          By:{" "}
                                          {escalation.escalator?.full_name ||
                                            "N/A"}
                                        </span>
                                        <span>
                                          On:{" "}
                                          {formatDate(escalation.escalated_at)}
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

                                {/* Body */}
                                <AnimatePresence>
                                  {isExpanded && (
                                    <motion.div
                                      initial={{ opacity: 0, height: 0 }}
                                      animate={{ opacity: 1, height: "auto" }}
                                      exit={{ opacity: 0, height: 0 }}
                                      transition={{ duration: 0.2 }}
                                      className="p-4 border-t border-[#BFD7EA] bg-white"
                                    >
                                      <div className="mt-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="bg-[#094C810D] border border-[#BFD7EA] rounded-md p-3 text-gray-700">
                                          <p className="font-semibold text-[#1E516A] text-sm mb-1">
                                            Escalation Reason
                                          </p>
                                          {escalation.reason ||
                                            "No reason provided"}
                                        </div>
                                        <div className="bg-[#094C810D] border border-[#BFD7EA] rounded-md p-3 text-gray-700">
                                          <p className="font-semibold text-[#1E516A] text-sm mb-1">
                                            Reporter Contact
                                          </p>
                                          <p className="text-gray-600">
                                            {escalation?.escalator?.full_name ||
                                              "N/A"}
                                          </p>
                                          <p className="text-gray-500 text-xs mt-1">
                                            {escalation?.escalator
                                              ?.phone_number ||
                                              "No phone number"}
                                          </p>
                                        </div>
                                      </div>

                                      {escalationFiles.length > 0 && (
                                        <div className="mt-4">
                                          <h5 className="font-semibold text-[#1E516A] mb-3">
                                            Attachments (
                                            {escalationFiles.length})
                                          </h5>
                                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                            {escalationFiles.map(
                                              (file: any, idx: number) => (
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
                                              )
                                            )}
                                          </div>
                                        </div>
                                      )}
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            );
                          }
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Issue Resolutions – collapsible like IssueDetail */}
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
                      <button
                        className="border border-green-700 text-green-700 text-xs px-3 py-1 rounded-md hover:bg-green-50"
                        onClick={toggleAllResolutions}
                      >
                        {expandedResolutions.length === issue.resolutions.length
                          ? "Collapse All"
                          : "Expand All"}
                      </button>
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
                        {issue.resolutions.map(
                          (resolution: any, resolutionIndex: number) => {
                            const isExpanded = expandedResolutions.includes(
                              resolution.resolution_id
                            );
                            const resolutionFiles =
                              resolution.attachments?.map(
                                (attachment: any) => ({
                                  url: getFileUrl(
                                    attachment.attachment.file_path
                                  ),
                                  name: attachment.attachment.file_name,
                                  path: attachment.attachment.file_path,
                                  type: getFileType(
                                    attachment.attachment.file_name
                                  ),
                                  uploadedAt: attachment.attachment.created_at,
                                })
                              ) || [];

                            return (
                              <div
                                key={resolution.resolution_id}
                                className="border border-[#BFD7EA] rounded-lg overflow-hidden"
                              >
                                {/* Header */}
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
                                        {resolution.resolver?.full_name ||
                                          "Unknown"}
                                      </h4>
                                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                                        <span>
                                          By{" "}
                                          {resolution.resolver?.full_name ||
                                            "N/A"}
                                        </span>
                                        <span>•</span>
                                        <span>
                                          On:{" "}
                                          {formatDate(resolution.resolved_at)}
                                        </span>
                                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                          {formatStatus(resolution.status) ||
                                            "resolved"}
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

                                {/* Body */}
                                <AnimatePresence>
                                  {isExpanded && (
                                    <motion.div
                                      initial={{ opacity: 0, height: 0 }}
                                      animate={{ opacity: 1, height: "auto" }}
                                      exit={{ opacity: 0, height: 0 }}
                                      transition={{ duration: 0.2 }}
                                      className="p-4 border-t border-[#BFD7EA] bg-white"
                                    >
                                      <div className="mt-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="bg-[#094C810D] border border-[#BFD7EA] rounded-md p-3 text-gray-700">
                                          <p className="font-semibold text-[#1E516A] text-sm mb-1">
                                            Resolution Reason
                                          </p>
                                          {resolution.reason ||
                                            "No reason provided"}
                                        </div>
                                        <div className="bg-[#094C810D] border border-[#BFD7EA] rounded-md p-3 text-gray-700">
                                          <p className="font-semibold text-[#1E516A] text-sm mb-1">
                                            Resolver Contact
                                          </p>
                                          <div className="text-sm">
                                            <p className="text-gray-600">
                                              {resolution.resolver?.full_name ||
                                                "N/A"}
                                            </p>
                                            <p className="text-gray-500 text-xs mt-1">
                                              {resolution.resolver
                                                ?.phone_number ||
                                                "No phone number"}
                                            </p>
                                          </div>
                                        </div>
                                      </div>

                                      {resolutionFiles.length > 0 && (
                                        <div className="mt-4">
                                          <h5 className="font-semibold text-[#1E516A] mb-3">
                                            Attachments (
                                            {resolutionFiles.length})
                                          </h5>
                                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                            {resolutionFiles.map(
                                              (file: any, idx: number) => (
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
                                              )
                                            )}
                                          </div>
                                        </div>
                                      )}
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            );
                          }
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {issue?.status !== "resolved" ? (
                <>
                  <h3 className="text-[#1E516A] font-semibold text-lg mt-4 mb-3 flex items-center gap-2">
                    🎯 Select Action
                  </h3>

                  <div className="flex flex-col md:flex-row gap-4 mb-6">
                    {actionButtons.map((action) => (
                      <button
                        key={action.key}
                        onClick={() => {
                          if (action.enabled) setSelectedAction(action.key);
                          action.onClick();
                        }}
                        disabled={!action.enabled}
                        className={`flex-1 text-left border rounded-lg p-4 transition-all relative ${
                          selectedAction === action.key
                            ? `border-[${action.border}] bg-[${action.bg}]`
                            : action.enabled
                            ? "border-[#D5E3EC] bg-white hover:bg-gray-50 cursor-pointer"
                            : "border-gray-200 bg-gray-50 cursor-not-allowed opacity-60"
                        }`}
                      >
                        {!action.enabled && (
                          <div className="absolute top-2 right-2">
                            <Lock className="w-4 h-4 text-gray-400" />
                          </div>
                        )}
                        <div className="flex items-center gap-2 mb-1">
                          <div
                            className={`w-5 h-5 rounded-full flex items-center justify-center ${
                              selectedAction === action.key
                                ? "bg-[#0C4A6E]" // Primary background
                                : action.enabled
                                ? "border-2 border-gray-300"
                                : "border-2 border-gray-200 bg-gray-100"
                            }`}
                          >
                            {selectedAction === action.key && (
                              <Check className="w-3 h-3 text-white" />
                            )}
                          </div>
                          <p
                            className={`font-semibold ${
                              action.enabled
                                ? "text-[#1E516A]"
                                : "text-gray-500"
                            }`}
                          >
                            {action.label}
                          </p>
                        </div>
                        <p
                          className={`text-sm ${
                            action.enabled ? "text-gray-600" : "text-gray-400"
                          }`}
                        >
                          {action.desc}
                        </p>
                      </button>
                    ))}
                  </div>
                </>
              ) : null}
              {/* (
                <>
                  <h3 className="text-[#1E516A] font-semibold text-lg mt-4 mb-3 flex items-center gap-2">
                    🎯 Select Action
                  </h3>

                  <div className="flex flex-col md:flex-row gap-4 mb-6">
                    {actionButtons.map((action) => (
                      <button
                        key={action.key}
                        onClick={action.onClick}
                        disabled={!action.enabled}
                        className={`flex-1 text-left border rounded-lg p-4 transition-all relative ${
                          selectedAction === action.key
                            ? `border-[${action.border}] bg-[${action.bg}]`
                            : action.enabled
                            ? "border-[#D5E3EC] bg-white hover:bg-gray-50 cursor-pointer"
                            : "border-gray-200 bg-gray-50 cursor-not-allowed opacity-60"
                        }`}
                      >
                        {!action.enabled && (
                          <div className="absolute top-2 right-2">
                            <Lock className="w-4 h-4 text-gray-400" />
                          </div>
                        )}
                        <div className="flex items-center gap-2 mb-1">
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              selectedAction === action.key
                                ? `border-[${action.color}]`
                                : action.enabled
                                ? "border-gray-300"
                                : "border-gray-200"
                            }`}
                          >
                            {selectedAction === action.key && (
                              <CheckCircle2
                                className="w-4 h-4"
                                style={{ color: action.color }}
                              />
                            )}
                          </div>
                          <p
                            className={`font-semibold ${
                              action.enabled
                                ? "text-[#1E516A]"
                                : "text-gray-500"
                            }`}
                          >
                            {action.label}
                          </p>
                        </div>
                        <p
                          className={`text-sm ${
                            action.enabled ? "text-gray-600" : "text-gray-400"
                          }`}
                        >
                          {action.desc}
                        </p>
                      </button>
                    ))}
                  </div>
                </>
              )} */}
            </div>
          </div>

          {/* File Viewer Modal with next/prev navigation (like IssueDetail) */}
          {fileViewerState && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 bg-opacity-75 p-4">
              <div className="bg-white rounded-lg w-full max-w-6xl h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-4 border-b">
                  <h3 className="text-lg font-semibold text-[#1E516A]">
                    File Preview{" "}
                    <span className="text-xs text-gray-500">
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
                                  index: (prev.index + 1) % prev.files.length,
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
              className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
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
                  className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-70"
                  onClick={closeModal}
                >
                  <X className="w-5 h-5" />
                </button>
                {issueFiles.length > 1 && (
                  <>
                    <button
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-70"
                      onClick={prevImage}
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-70"
                      onClick={nextImage}
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </>
                )}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white bg-black bg-opacity-50 rounded-full px-3 py-1 text-sm">
                  {modalImageIndex + 1} / {issueFiles.length}
                </div>
              </div>
            </div>
          )}

          <AnimatePresence>
            {selectedAction === "resolve" && (
              <ResolutionPreview
                issue_id={id || ""}
                resolved_by={userId}
                onClose={() => setSelectedAction("")}
              />
            )}
            {selectedAction === "assign" && (
              <AssignmentPreview
                issue_id={id || ""}
                project_id={project_id || ""}
                internal_node_id={internal_node_id}
                onClose={() => setSelectedAction("")}
                assigned_by={userId}
              />
            )}{" "}
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
