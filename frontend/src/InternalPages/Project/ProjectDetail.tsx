import { useParams, Link } from "react-router-dom";
import { Card, CardTitle, CardContent } from "../../components/ui/cn/card";
import {
  useDeleteProjectMutation,
  useGetProjectByIdQuery,
} from "../../redux/services/projectApi";
import DetailHeader from "../../components/common/DetailHeader";
import { ArrowRight, Edit, Trash2, Users } from "lucide-react";
import PageMeta from "../../components/common/PageMeta";
import Badge from "../../components/ui/badge/Badge";
import { format } from "date-fns";
import {
  FolderIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowLeftIcon,
  BuildingOfficeIcon,
} from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import DeleteModal from "../../components/common/DeleteModal";
import { ActionButton } from "../../types/layout";
import IssueFlowList from "../../components/tables/lists/issueFlowList";
import ProjectAssignedUsers from "../../components/tables/lists/projectAssignedUsers";
import {
  useBreadcrumbTitleEffect,
  useBreadcrumbTitleById,
} from "../../hooks/useBreadcrumbTitleEffect";
import { useGetInstituteByIdQuery } from "../../redux/services/instituteApi";
import { ComponentGuard } from "../../components/common/ComponentGuard";
import { useAuth } from "../../contexts/AuthContext";
import { UpdateProjectModal } from "../../components/modals/EditProjectModal";

export default function ProjectDetail() {
  const { id, instituteId } = useParams<{ id: string; instituteId?: string }>();
  const { data: project, isLoading, isError } = useGetProjectByIdQuery(id!);
  const { data: institute } = useGetInstituteByIdQuery(instituteId || "", {
    skip: !instituteId,
  });
  const [deleteProject, { isLoading: deletingProjectLoading }] =
    useDeleteProjectMutation();
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { hasAnyPermission } = useAuth();

  // Check permissions for both tabs
  const hasIssueFlowPermission = hasAnyPermission(["PROJECTS:ASSIGN_USERS"]);
  const hasUsersPermission = hasAnyPermission(["PROJECTS:ASSIGN_USERS"]);

  // Determine active tab based on permissions
  const [activeTab, setActiveTab] = useState<"issueFlow" | "users">(() => {
    // If only one permission exists, default to that tab
    if (hasIssueFlowPermission && !hasUsersPermission) return "issueFlow";
    if (!hasIssueFlowPermission && hasUsersPermission) return "users";
    // If both exist, default to issueFlow
    return "issueFlow";
  });

  // Set institute title for the middle breadcrumb (Institute Details)
  useBreadcrumbTitleById(instituteId, institute?.name);

  // Set project title for the last breadcrumb (Project Details)
  useBreadcrumbTitleEffect(project?.name, id);

  // Save project ID to localStorage on every load/update
  useEffect(() => {
    if (id) {
      localStorage.setItem("current_project_id", id);
    }
  }, [id]);

  // Build actions based on permissions
  const actions: ActionButton[] = [];

  if (hasIssueFlowPermission) {
    actions.push({
      label: "Support Request Flow",
      icon: <FolderIcon className="h-4 w-4" />,
      variant: activeTab === "issueFlow" ? "default" : "outline",
      size: "default",
      onClick: () => setActiveTab("issueFlow"),
    });
  }

  if (hasUsersPermission) {
    actions.push({
      label: "Assigned Users",
      icon: <Users className="h-4 w-4" />,
      variant: activeTab === "users" ? "default" : "outline",
      size: "default",
      onClick: () => setActiveTab("users"),
    });
  }

  // Only show toggle if we have multiple actions
  const showToggle = actions.length > 1;

  const handleDelete = async () => {
    try {
      await deleteProject(id!).unwrap();
      setIsOpen(false);
      toast.success("Project deleted successfully");
      navigate(-1);
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to delete project");
    }
  };
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
          <p className="text-[#1E516A] text-lg">Loading project details...</p>
        </div>
      </div>
    );
  }

  if (isError || !project) {
    return (
      <div className="min-h-screen bg-[#F9FBFC] p-6 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <XCircleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-[#1E516A] mb-2">
              Project Not Found
            </h2>
            <p className="text-gray-600 mb-4">
              The project you're looking for doesn't exist or has been removed.
            </p>
            <Link
              to="/project"
              className="inline-flex items-center gap-2 text-[#094C81] hover:text-[#073954] font-medium"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Back to Projects
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>

<UpdateProjectModal
  isOpen={isUpdateModalOpen}
  projectId={id || null}
  onClose={() => {
    setIsUpdateModalOpen(false);
  }}
/>


      <DeleteModal
        message="Are you sure you want to delete this project? This action cannot be undone."
        onCancel={() => setIsOpen(false)}
        onDelete={handleDelete}
        open={isOpen}
        isLoading={deletingProjectLoading}
      />
      <PageMeta
        title={`${project.name} - Project Details`}
        description={`View details for ${project.name}`}
      />
      <div className="min-h-screen bg-[#F9FBFC] p-6 pb-24">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex justify-between">
            <DetailHeader
              breadcrumbs={[
                { title: "Organization", link: "" },
                { title: "Project", link: "" },
              ]}
            />
            <div className="flex justify-center items-end gap-4">
              <span>
                <Edit onClick={() => setIsUpdateModalOpen(true)} className="h-5 w-5 text-[#094C81] hover:text-[#073954] cursor-pointer text-bold" />
              </span>
              <span>
                <Trash2
                  onClick={() => setIsOpen(true)}
                  className="h-5 w-5 text-[#B91C1C] hover:text-[#991B1B] cursor-pointer text-bold"
                />
              </span>
            </div>
          </div>

          {/* Project Info Card - Compact Design */}
          <Card className="bg-white rounded-lg shadow-sm border border-[#BFD7EA] overflow-hidden">
            <CardContent className="p-4">
              {/* Header Row - Compact */}
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-[#094C81]/10 rounded-lg">
                    <FolderIcon className="h-5 w-5 text-[#094C81]" />
                  </div>
                  <div>
                    <CardTitle className="text-[#094C81] text-lg font-semibold m-0">
                      {project.name}
                    </CardTitle>
                    {project.description && (
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                        {project.description}
                      </p>
                    )}
                  </div>
                </div>
                <Badge
                  variant="light"
                  color={project.is_active ? "success" : "error"}
                  size="sm"
                  className="text-xs shrink-0"
                >
                  {project.is_active ? (
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
              </div>

              {/* Details - Horizontal Compact Layout */}
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                {project.institutes?.length > 0 && (
                  <div className="flex items-center gap-1.5">
                    <BuildingOfficeIcon className="h-3.5 w-3.5 text-[#1E516A]" />
                    <span className="text-xs font-medium text-[#1E516A]">
                      Institutes:
                    </span>
                    <span className="text-gray-600 text-sm">
                      {project.institutes.map((i: any) => i.name).join(", ")}
                    </span>
                  </div>
                )}
                {/* {project.created_at && (
                  <div className="flex items-center gap-1.5">
                    <CalendarIcon className="h-3.5 w-3.5 text-[#1E516A]" />
                    <span className="text-xs font-medium text-[#1E516A]">
                      Created:
                    </span>
                    <span className="text-gray-600 text-sm">
                      {formatDateShort(project.created_at)}
                    </span>
                  </div>
                )} */}
                {project && (
                  <div className="flex items-center gap-1.5">
                    <CalendarIcon className="h-3.5 w-3.5 text-[#1E516A]" />
                    <span className="text-xs font-medium text-[#1E516A]">
                      Maintenance Support Date:
                    </span>
                    <span className="text-gray-600 text-sm flex items-center gap-1">
                      {project.maintenances?.[0]?.start_date &&
                        formatDateShort(project.maintenances[0].start_date)}
                      <ArrowRight className="w-4 h-4 text-gray-400 mx-1" />
                      {project.maintenances?.[0]?.end_date &&
                        formatDateShort(project.maintenances[0].end_date)}
                    </span>
                  </div>
                )}
              </div>

              {/* Deleted At - Compact Alert */}
              {project.deleted_at && (
                <div className="mt-3 pt-3 border-t border-red-200">
                  <div className="flex items-center gap-2 text-xs">
                    <XCircleIcon className="h-4 w-4 text-red-600" />
                    <span className="font-medium text-red-700">Deleted:</span>
                    <span className="text-red-600">
                      {formatDateWithTime(project.deleted_at)}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Project Hierarchy */}
          {hasIssueFlowPermission && activeTab === "issueFlow" && (
            <ComponentGuard permissions={["PROJECTS:ASSIGN_USERS"]}>
              <IssueFlowList
                toggleActions={showToggle ? actions : undefined} // Only pass actions if showToggle is true
                isAssignUsersToStructure={true}
              />
            </ComponentGuard>
          )}

          {hasUsersPermission && activeTab === "users" && (
            <ComponentGuard permissions={["PROJECTS:ASSIGN_USERS"]}>
              <ProjectAssignedUsers
                project_id={id || ""}
                toggleActions={showToggle ? actions : undefined} // Only pass actions if showToggle is true
              />
            </ComponentGuard>
          )}
        </div>
      </div>
    </>
  );
}
