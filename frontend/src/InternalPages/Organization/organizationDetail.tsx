import { useParams, Link } from "react-router-dom";
import {
  useDeleteInstituteMutation,
  useGetInstituteByIdQuery,
} from "../../redux/services/instituteApi";
import PageMeta from "../../components/common/PageMeta";
import Badge from "../../components/ui/badge/Badge";
import { format } from "date-fns";
import {
  BuildingOfficeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import { Card, CardTitle, CardContent } from "../../components/ui/cn/card";
import ProjectList from "../../components/tables/lists/projectList";
import DetailHeader from "../../components/common/DetailHeader";
import { Edit, Trash2 } from "lucide-react";
import { useState } from "react";
import DeleteModal from "../../components/common/DeleteModal";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useBreadcrumbTitleEffect } from "../../hooks/useBreadcrumbTitleEffect";
import { ComponentGuard } from "../../components/common/ComponentGuard";
import { UpdateInstituteModal } from "../../components/modals/EditInstituteModal";
const OrganizationDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const {
    data: organizationDetail,
    isLoading,
    isError,
  } = useGetInstituteByIdQuery(id!);
  const [deleteInstitute, { isLoading: isDeleteLoading }] =
    useDeleteInstituteMutation();
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

  // breadcrumbs
  useBreadcrumbTitleEffect(
    organizationDetail?.name,
    organizationDetail?.institute_id
  );
  const handleDelete = async () => {
    try {
      await deleteInstitute(id!).unwrap();
      setIsOpen(false);
      toast.success("Institute deleted successfully");
      navigate("/organization");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to delete institute");
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
          <p className="text-[#1E516A] text-lg">
            Loading organization details...
          </p>
        </div>
      </div>
    );
  }

  if (isError || !organizationDetail) {
    return (
      <div className="min-h-screen bg-[#F9FBFC] p-6 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <XCircleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-[#1E516A] mb-2">
              Organization Not Found
            </h2>
            <p className="text-gray-600 mb-4">
              The organization you're looking for doesn't exist or has been
              removed.
            </p>
            <Link
              to="/organization"
              className="inline-flex items-center gap-2 text-[#094C81] hover:text-[#073954] font-medium"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Back to Organizations
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <ComponentGuard permissions={["ORGANIZATIONS:DELETE"]}>
        <DeleteModal
          message="Are you sure you want to delete this institute? This action cannot be undone."
          onCancel={() => setIsOpen(false)}
          onDelete={handleDelete}
          open={isOpen}
          isLoading={isDeleteLoading}
        />
      </ComponentGuard>

      <ComponentGuard permissions={["ORGANIZATIONS:UPDATE"]}>
        <UpdateInstituteModal
          isOpen={isUpdateModalOpen}
          instituteId={id || null}
          onClose={() => setIsUpdateModalOpen(false)}
        />
      </ComponentGuard>
      <PageMeta
        title={`${organizationDetail.name} - Organization Details`}
        description={`View details for ${organizationDetail.name}`}
      />
      <div className="min-h-screen bg-[#F9FBFC] p-6 pb-24">
        <div className="mx-auto space-y-6">
          <div className="flex justify-between">
            <DetailHeader breadcrumbs={[{ title: "Organization", link: "" }]} />
            <div className="flex justify-center items-end gap-4">
              <ComponentGuard permissions={["ORGANIZATIONS:UPDATE"]}>
                <span>
                  <Edit
                    onClick={() => setIsUpdateModalOpen(true)}
                    className="h-5 w-5 text-[#094C81] hover:text-[#073954] cursor-pointer text-bold"
                  />
                </span>
              </ComponentGuard>
              <ComponentGuard permissions={["ORGANIZATIONS:DELETE"]}>
                <span>
                  <Trash2
                    onClick={() => setIsOpen(true)}
                    className="h-5 w-5 text-[#B91C1C] hover:text-[#991B1B] cursor-pointer text-bold"
                  />
                </span>
              </ComponentGuard>
            </div>
          </div>

          {/* Organization Info Card - Compact Design */}
          <Card className="bg-white rounded-lg shadow-sm border border-[#BFD7EA] overflow-hidden">
            <CardContent className="p-4">
              {/* Header Row - Compact */}
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-[#094C81]/10 rounded-lg">
                    <BuildingOfficeIcon className="h-5 w-5 text-[#094C81]" />
                  </div>
                  <div>
                    <CardTitle className="text-[#094C81] text-lg font-semibold m-0">
                      {organizationDetail.name}
                    </CardTitle>
                    {organizationDetail.description && (
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                        {organizationDetail.description}
                      </p>
                    )}
                  </div>
                </div>
                <Badge
                  variant="light"
                  color={organizationDetail.is_active ? "success" : "error"}
                  size="sm"
                  className="text-xs shrink-0"
                >
                  {organizationDetail.is_active ? (
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
 

              {/* Deleted At - Compact Alert */}
              {organizationDetail.deleted_at && (
                <div className="mt-3 pt-3 border-t border-red-200">
                  <div className="flex items-center gap-2 text-xs">
                    <XCircleIcon className="h-4 w-4 text-red-600" />
                    <span className="font-medium text-red-700">Deleted:</span>
                    <span className="text-red-600">
                      {formatDateWithTime(organizationDetail.deleted_at)}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Projects Section */}

          <ComponentGuard permissions={["PROJECTS:READ"]}>
            <ProjectList insistitute_id={id || ""} userType="internal_user" />
          </ComponentGuard>
        </div>
      </div>
    </>
  );
};

export default OrganizationDetail;
