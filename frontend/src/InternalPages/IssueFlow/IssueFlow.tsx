import { useParams, Link } from "react-router-dom";
import { useGetInternalNodeByIdQuery } from "../../redux/services/internalNodeApi";
import PageMeta from "../../components/common/PageMeta";
import Badge from "../../components/ui/badge/Badge";
import { format } from "date-fns";
import {
  RectangleStackIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowLeftIcon,
  FolderIcon,
} from "@heroicons/react/24/outline";
import { Card, CardTitle, CardContent } from "../../components/ui/cn/card";
import DetailHeader from "../../components/common/DetailHeader";
import { Edit, Plus, Trash2 } from "lucide-react";
import { Button } from "../../components/ui/cn/button";
import { useState } from "react";
import { CreateChildInternalNodeModal } from "../../components/modals/CreateChildInternalNodeModal";
import HierarchyUsersList from "../../components/tables/lists/HierarchyUsersList";
import InternalNodeUsersList from "../../components/tables/lists/InternalNodeUsersList";

const IssueFlow = () => {
  const { id } = useParams<{ id: string }>();
  const [isModalOpen, setModalOpen] = useState(false);
  const {
    data: issueFlow,
    isLoading,
    isError,
  } = useGetInternalNodeByIdQuery(id!);

  const formatDateShort = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch {
      return dateString;
    }
  };

  const formatDateWithTime = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "MMM dd, yyyy 'at' h:mm a");
    } catch {
      return dateString;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F9FBFC] p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#094C81] mx-auto mb-4"></div>
          <p className="text-[#1E516A] text-lg">
            Loading issue flow details...
          </p>
        </div>
      </div>
    );
  }

  if (isError || !issueFlow) {
    return (
      <div className="min-h-screen bg-[#F9FBFC] p-6 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <XCircleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-[#1E516A] mb-2">
              Support Request Flow Not Found
            </h2>
            <p className="text-gray-600 mb-4">
              The issue flow you're looking for doesn't exist or has been
              removed.
            </p>
            <Link
              to="/issue_flow"
              className="inline-flex items-center gap-2 text-[#094C81] hover:text-[#073954] font-medium"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Back to Request Flows
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <PageMeta
        title={`${issueFlow.name} - Support Request Flow Details`}
        description={`View details for ${issueFlow.name}`}
      />
      <div className="min-h-screen bg-[#F9FBFC] p-6 pb-24">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header Section */}
          <div className="flex justify-between">
            <DetailHeader
              breadcrumbs={[
                { title: "Support Request Flow", link: "" },
                { title: "Request Flow Details", link: "" },
              ]}
            />
            <div className="flex justify-center items-end gap-4">
              <span>
                <Edit className="h-5 w-5 text-[#094C81] hover:text-[#073954] cursor-pointer text-bold" />
              </span>
              <span>
                <Trash2 className="h-5 w-5 text-[#B91C1C] hover:text-[#991B1B] cursor-pointer text-bold" />
              </span>
            </div>
          </div>

          {/* Support Request Flow Info Card - Compact Design */}
          <Card className="bg-white rounded-lg shadow-sm border border-[#BFD7EA] overflow-hidden">
            <CardContent className="p-4">
              {/* Header Row - Compact */}
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
                <>
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-[#094C81]/10 rounded-lg">
                      <RectangleStackIcon className="h-5 w-5 text-[#094C81]" />
                    </div>
                    <div>
                      <CardTitle className="text-[#094C81] text-lg font-semibold m-0">
                        {issueFlow.name}
                      </CardTitle>
                      {issueFlow.description && (
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-1 space-x-3 flex items-center">
                          {issueFlow.description}
                          <Badge
                            variant="light"
                            color={issueFlow.is_active ? "success" : "error"}
                            size="sm"
                            className="text-xs shrink-0 ml-3"
                          >
                            {issueFlow.is_active ? (
                              <>
                                <CheckCircleIcon className="h-3 w-3" />
                                Active
                              </>
                            ) : (
                              <>
                                <XCircleIcon className="h-3 w-3" />
                                Inactive
                              </>
                            )}
                          </Badge>
                        </p>
                      )}
                    </div>
                  </div>
                </>

                <Button
                  variant="default"
                  size="default"
                  onClick={() => setModalOpen(true)}
                  className="flex items-center space-x-2"
                >
                  <span className="h-4 w-4">
                    <Plus className="h-4 w-4" />
                  </span>
                  <span>Add Child</span>
                </Button>
              </div>

              {/* Details - Horizontal Compact Layout */}
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                {issueFlow.parent && (
                  <div className="flex items-center gap-1.5">
                    <FolderIcon className="h-3.5 w-3.5 text-[#1E516A]" />
                    <span className="text-xs font-medium text-[#1E516A]">
                      Parent:
                    </span>
                    <span className="text-gray-600 text-sm">
                      {issueFlow.parent.name}
                    </span>
                  </div>
                )}

                {issueFlow.level !== undefined && (
                  <div className="flex items-center gap-1.5">
                    <RectangleStackIcon className="h-3.5 w-3.5 text-[#1E516A]" />
                    <span className="text-xs font-medium text-[#1E516A]">
                      Level:
                    </span>
                    <span className="text-gray-600 text-sm">
                      {issueFlow.level}
                    </span>
                  </div>
                )}
{/* 
                {issueFlow.created_at && (
                  <div className="flex items-center gap-1.5">
                    <CalendarIcon className="h-3.5 w-3.5 text-[#1E516A]" />
                    <span className="text-xs font-medium text-[#1E516A]">
                      Created:
                    </span>
                    <span className="text-gray-600 text-sm">
                      {formatDateShort(issueFlow.created_at)}
                    </span>
                  </div>
                )} */}
              </div>

              {/* Deleted At - Compact Alert */}
              {issueFlow.deleted_at && (
                <div className="mt-3 pt-3 border-t border-red-200">
                  <div className="flex items-center gap-2 text-xs">
                    <XCircleIcon className="h-4 w-4 text-red-600" />
                    <span className="font-medium text-red-700">Deleted:</span>
                    <span className="text-red-600">
                      {formatDateWithTime(issueFlow.deleted_at)}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Create Child Modal */}
          <CreateChildInternalNodeModal
            parentInternalNodeId={id || ""}
            isOpen={isModalOpen}
            onClose={() => setModalOpen(false)}
          />
          {/* Assigned Users */}
          <InternalNodeUsersList
            projectId={localStorage.getItem("current_project_id") || ""}
            internal_node_id={id || ""}
            internal_node_name={issueFlow.name || ""}
          />
        </div>
      </div>
    </>
  );
};

export default IssueFlow;
