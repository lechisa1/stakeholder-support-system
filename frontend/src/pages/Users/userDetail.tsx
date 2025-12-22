import { useParams, Link } from "react-router-dom";
import {
  useGetUserByIdQuery,
  useGetUserTypesQuery,
  User,
  useUpdateUserMutation,
} from "../../redux/services/userApi";
import PageMeta from "../../components/common/PageMeta";
import Badge from "../../components/ui/badge/Badge";
import { format } from "date-fns";
import {
  UserCircleIcon,
  EnvelopeIcon,
  PhoneIcon,
  BriefcaseIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowLeftIcon,
  AcademicCapIcon,
  StarIcon,
  CheckIcon,
  XMarkIcon,
  PencilIcon,
} from "@heroicons/react/24/outline";
import { Card, CardContent } from "../../components/ui/cn/card";
import { getFileUrl } from "../../utils/fileUrl";
import DetailHeader from "../../components/common/DetailHeader";
import {
  Edit,
  Trash2,
  User2Icon,
  Save,
  Loader2,
  EditIcon,
  GitMergeIcon,
} from "lucide-react";
import DeleteModal from "../../components/common/DeleteModal";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useDeleteUserMutation } from "../../redux/services/userApi";
import { Input } from "../../components/ui/cn/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../../components/ui/cn/select";
import { Label } from "../../components/ui/cn/label";
import { useGetInstitutesQuery } from "../../redux/services/instituteApi";
import { useGetRolesQuery } from "../../redux/services/roleApi";
import { useGetProjectMetricsQuery } from "../../redux/services/projectMetricApi";
import Switch from "../../components/form/switch/Switch";
import { FaProjectDiagram } from "react-icons/fa";
import { useBreadcrumbTitleEffect } from "../../hooks/useBreadcrumbTitleEffect";
import { ComponentGuard } from "../../components/common/ComponentGuard";

// Type for wrapped API response
interface UserApiResponse {
  success: boolean;
  message: string;
  data: User;
}

// Extended User type with roles and metrics
interface ExtendedUser extends User {
  roles?: Array<{
    role_id: string;
    name: string;
    description?: string;
    is_active?: boolean;
    created_at?: string;
    updated_at?: string;
    deleted_at?: string | null;
  }>;
  metrics?: Array<{
    project_metric_id: string;
    name: string;
    description?: string;
    weight?: number | null;
    is_active?: boolean;
    created_at?: string;
    updated_at?: string;
    ProjectMetricUser?: {
      value?: number | null;
    };
  }>;
  userType?: {
    user_type_id: string;
    name: string;
  };
}

// Type for edit form state
interface EditFormData {
  full_name: string;
  email: string;
  phone_number: string;
  position?: string;
  is_active: boolean;
  institute_id: string;
  role_ids: string[]; // Changed to array to support multiple roles
  project_metrics_ids: string[];
  user_type_id: string;
}

interface ProjectMetric {
  project_metric_id: string;
  name: string;
  description: string;
  weight: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  projects: any[];
  users: any[];
}

const UserDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { data: user, isLoading, isError, refetch } = useGetUserByIdQuery(id!);
  const [deleteUser, { isLoading: deletingUserLoading }] =
    useDeleteUserMutation();
  const [updateUser, { isLoading: updatingUser }] = useUpdateUserMutation();
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();

  // Edit form state
  const [editForm, setEditForm] = useState<EditFormData>({
    full_name: "",
    email: "",
    phone_number: "",
    is_active: true,
    institute_id: "",
    role_ids: [], // Changed to array
    project_metrics_ids: [],
    user_type_id: "",
  });

  // Fetch additional data for editing
  const { data: institutes, isLoading: loadingInstitutes } =
    useGetInstitutesQuery();
  const { data: metricsData, isLoading: loadingMetrics } =
    useGetProjectMetricsQuery({});
  const { data: rolesResponse } = useGetRolesQuery({});
  const allRoles = rolesResponse?.data || [];
  const metrics: ProjectMetric[] = metricsData || [];
  const { data: userTypes = [] } = useGetUserTypesQuery({});
  const selectedUserType = userTypes?.data?.find(
    (type: any) => type.user_type_id === editForm.user_type_id
  );
  const isExternalUser = selectedUserType?.name === "external_user";

  // Extract user data for breadcrumb - extract early to avoid redeclaration
  const userDataForBreadcrumb = user
    ? (((user as unknown as UserApiResponse).data || user) as ExtendedUser)
    : null;

  // Set dynamic breadcrumb title - must be called at top level before any early returns
  useBreadcrumbTitleEffect(
    userDataForBreadcrumb?.full_name,
    userDataForBreadcrumb?.user_id
  );

  const handleDelete = async () => {
    try {
      await deleteUser(id!).unwrap();
      setIsOpen(false);
      toast.success("User deleted successfully");
      navigate(-1);
    } catch (error: unknown) {
      const errorMessage =
        (error as { data?: { message?: string } })?.data?.message ||
        "Failed to delete user";
      toast.error(errorMessage);
    }
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "PPP p");
    } catch {
      return dateString;
    }
  };

  // Initialize edit form when user data is loaded
  useEffect(() => {
    if (user) {
      const userData = ((user as unknown as UserApiResponse).data ||
        user) as ExtendedUser;

      // Get user's current metrics IDs
      const userMetricIds =
        userData.metrics?.map((m) => m.project_metric_id) || [];

      // Get user's current role IDs
      const userRoleIds = userData.roles?.map((r) => r.role_id) || [];

      setEditForm({
        full_name: userData.full_name || "",
        email: userData.email || "",
        phone_number: userData.phone_number || "",
        is_active: userData.is_active ?? true,
        institute_id: userData.institute?.institute_id || "",
        role_ids: userRoleIds, // Set as array
        project_metrics_ids: userMetricIds,
        user_type_id: userData.userType?.user_type_id || "",
      });
    }
  }, [user]);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    // Reset form to original values
    if (user) {
      const userData = ((user as unknown as UserApiResponse).data ||
        user) as ExtendedUser;
      const userMetricIds =
        userData.metrics?.map((m) => m.project_metric_id) || [];
      const userRoleIds = userData.roles?.map((r) => r.role_id) || [];

      setEditForm({
        full_name: userData.full_name || "",
        email: userData.email || "",
        phone_number: userData.phone_number || "",
        is_active: userData.is_active ?? true,
        institute_id: userData.institute?.institute_id || "",
        role_ids: userRoleIds,
        project_metrics_ids: userMetricIds,
        user_type_id: userData.userType?.user_type_id || "",
      });
    }
  };

  const handleSaveEdit = async () => {
    try {
      // Prepare update payload
      const updatePayload: any = {
        full_name: editForm.full_name,
        email: editForm.email,
        phone_number: editForm.phone_number,
        is_active: editForm.is_active,
        user_type_id: editForm.user_type_id,
        role_ids: editForm.role_ids,
        project_metrics_ids: editForm.project_metrics_ids,
        position: editForm.position,
      };
      console.log(updatePayload);

      // Only include fields that have changed or are required
      if (editForm.position !== (user as ExtendedUser)?.position) {
        updatePayload.position = editForm.position;
      }
      // if the user type is external user, then we need to add the institute id
      if (isExternalUser) {
        updatePayload.institute_id = editForm.institute_id;
      }

      if (
        editForm.institute_id &&
        editForm.institute_id !==
          (user as ExtendedUser)?.institute?.institute_id
      ) {
        updatePayload.institute_id = editForm.institute_id;
      }

      // Include role_ids as array
      if (editForm.role_ids.length > 0) {
        updatePayload.role_ids = editForm.role_ids;
      }

      // Always include project metrics IDs if we're editing
      if (isEditing) {
        updatePayload.project_metrics_ids = editForm.project_metrics_ids;
      }

      await updateUser({ user_id: id!, data: updatePayload }).unwrap();
      toast.success("User updated successfully");
      setIsEditing(false);
      refetch(); // Refresh the data
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update user");
    }
  };

  const handleInputChange = (field: keyof EditFormData, value: any) => {
    setEditForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleRoleToggle = (roleId: string) => {
    setEditForm((prev) => {
      if (prev.role_ids.includes(roleId)) {
        return {
          ...prev,
          role_ids: prev.role_ids.filter((id) => id !== roleId),
        };
      } else {
        return {
          ...prev,
          role_ids: [...prev.role_ids, roleId],
        };
      }
    });
  };

  const handleMetricToggle = (metricId: string) => {
    setEditForm((prev) => {
      if (prev.project_metrics_ids.includes(metricId)) {
        return {
          ...prev,
          project_metrics_ids: prev.project_metrics_ids.filter(
            (id) => id !== metricId
          ),
        };
      } else {
        return {
          ...prev,
          project_metrics_ids: [...prev.project_metrics_ids, metricId],
        };
      }
    });
  };

  const handleSelectAllMetrics = () => {
    if (editForm.project_metrics_ids.length === metrics.length) {
      // Deselect all
      setEditForm((prev) => ({
        ...prev,
        project_metrics_ids: [],
      }));
    } else {
      // Select all
      const allMetricIds = metrics.map((metric) => metric.project_metric_id);
      setEditForm((prev) => ({
        ...prev,
        project_metrics_ids: allMetricIds,
      }));
    }
  };

  const handleSelectAllRoles = () => {
    if (editForm.role_ids.length === allRoles.length) {
      // Deselect all
      setEditForm((prev) => ({
        ...prev,
        role_ids: [],
      }));
    } else {
      // Select all
      const allRoleIds = allRoles.map((role) => role.role_id);
      setEditForm((prev) => ({
        ...prev,
        role_ids: allRoleIds,
      }));
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F9FBFC] p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#094C81] mx-auto mb-4"></div>
          <p className="text-[#1E516A] text-lg">Loading user details...</p>
        </div>
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="min-h-screen bg-[#F9FBFC] p-6 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <XCircleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-[#1E516A] mb-2">
              User Not Found
            </h2>
            <p className="text-gray-600 mb-4">
              The user you're looking for doesn't exist or has been removed.
            </p>
            <Link
              to="/users"
              className="inline-flex items-center gap-2 text-[#094C81] hover:text-[#073954] font-medium"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Back to Users
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Handle wrapped response if API returns { success, message, data }
  // Use the already extracted userDataForBreadcrumb if available, otherwise extract it
  const userData =
    userDataForBreadcrumb ||
    (((user as unknown as UserApiResponse).data || user) as ExtendedUser);

  // Extract roles and metrics from the response
  const userRolesList = userData.roles || [];
  const userMetricsList = userData.metrics || [];
  const userType = userData.userType;

  // Get user's current metric IDs for checking
  const userMetricIds = userMetricsList.map((m) => m.project_metric_id);
  const userRoleIds = userRolesList.map((r) => r.role_id);

  return (
    <>
      <DeleteModal
        message="Are you sure you want to delete this user? This action cannot be undone."
        onCancel={() => setIsOpen(false)}
        onDelete={handleDelete}
        open={isOpen}
        isLoading={deletingUserLoading}
      />
      <PageMeta
        title={`${isEditing ? "Edit" : ""} ${
          userData.full_name
        } - User Details`}
        description={`${isEditing ? "Edit" : "View"} details for ${
          userData.full_name
        }`}
      />
      <div className="min-h-screen bg-[#F9FBFC] p-6 pb-24">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header Section */}
          <div className="flex justify-between">
            <DetailHeader
              breadcrumbs={[
                { title: "Users", link: "" },
                { title: userData.full_name, link: "" },
              ]}
            />
            <div className="flex justify-center items-end gap-1">
              {isEditing ? (
                <>
                  <button
                    onClick={handleCancelEdit}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <XMarkIcon className="h-4 w-4" />
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    disabled={updatingUser}
                    className="flex items-center gap-2 px-4 py-2 bg-[#094C81] text-white hover:bg-[#073954] rounded-lg transition-colors disabled:opacity-50"
                  >
                    {updatingUser ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckIcon className="h-4 w-4" />
                    )}
                    Save Changes
                  </button>
                </>
              ) : (
                <>
                  <ComponentGuard permissions={["USERS:UPDATE", ""]}>
                    <button
                      onClick={handleEditClick}
                      className="flex items-center gap-2 px-2 py-2 text-[#094C81] hover:bg-gray-100 hover:text-[#073954] cursor-pointer rounded-lg transition-colors"
                    >
                      <EditIcon className="h-5 w-5" />
                    </button>
                  </ComponentGuard>
                  <ComponentGuard permissions={["USERS:DELETE"]}>
                    <button
                      onClick={() => setIsOpen(true)}
                      className="flex items-center gap-2 px-2 py-2 text-red-600 hover:bg-red-100 cursor-pointer rounded-lg transition-colors"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </ComponentGuard>
                </>
              )}
            </div>
          </div>

          {/* User Profile Card */}
          <div className="bg-white py-5 px-3 rounded-xl border">
            {/* Header */}
            <div className="flex flex-row items-center border-b w-full justify-between text-[#094C81] rounded-t-xl px-6 py-4">
              <div className="flex items-center gap-4">
                {/* Profile Image */}
                <div className="w-20 h-20 overflow-hidden border-2 border-[#094C81] rounded-full flex items-center justify-center bg-white">
                  {userData.profile_image ? (
                    <img
                      src={getFileUrl(userData.profile_image)}
                      alt={userData.full_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User2Icon className="h-12 w-12 bg-white" />
                  )}
                </div>

                <div>
                  {isEditing ? (
                    <div className="space-y-2">
                      <Input
                        value={editForm.full_name}
                        onChange={(e) =>
                          handleInputChange("full_name", e.target.value)
                        }
                        className="text-2xl font-semibold text-[#094C81] border border-gray-300 rounded-md px-3 py-2"
                      />
                      <Input
                        type="email"
                        value={editForm.email}
                        onChange={(e) =>
                          handleInputChange("email", e.target.value)
                        }
                        className="text-gray-600 border border-gray-300 rounded-md px-3 py-2"
                      />
                    </div>
                  ) : (
                    <>
                      <h2 className="text-[#094C81] text-2xl mb-1">
                        {userData.full_name}
                      </h2>
                      <p className="text-gray-600 text-sm">{userData.email}</p>
                    </>
                  )}
                </div>
              </div>

              <Badge
                variant="light"
                color={userData.is_active ? "success" : "error"}
                size="md"
                className="text-sm"
              >
                {userData.is_active ? (
                  <>
                    <CheckCircleIcon className="h-4 w-4" />
                    Active
                  </>
                ) : (
                  <>
                    <XCircleIcon className="h-4 w-4" />
                    Inactive
                  </>
                )}
              </Badge>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Personal Information Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {/* Phone */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <PhoneIcon className="h-4 w-4 text-[#1E516A]" />
                    <p className="text-xs font-semibold text-[#1E516A] uppercase tracking-wide">
                      Phone Number
                    </p>
                  </div>
                  {isEditing ? (
                    <Input
                      value={editForm.phone_number}
                      onChange={(e) =>
                        handleInputChange("phone_number", e.target.value)
                      }
                      placeholder="Enter phone number"
                      className="text-gray-700 font-medium border border-gray-300 rounded-md px-3 py-2"
                    />
                  ) : (
                    <p className="text-gray-700 font-medium">
                      {userData.phone_number || "N/A"}
                    </p>
                  )}
                </div>

                {/* User Type */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <UserCircleIcon className="h-4 w-4 text-[#1E516A]" />
                    <p className="text-xs font-semibold text-[#1E516A] uppercase tracking-wide">
                      User Type
                    </p>
                  </div>
                  {isEditing ? (
                    <Select
                      value={editForm.user_type_id}
                      onValueChange={(value) =>
                        handleInputChange("user_type_id", value)
                      }
                    >
                      <SelectTrigger className="w-full border border-gray-300">
                        <SelectValue placeholder="Select User Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectContent>
                          {userTypes?.data?.map((type: any) => (
                            <SelectItem
                              key={type.user_type_id}
                              value={type.user_type_id}
                              onClick={() => setTypeName(type.name)}
                            >
                              {type.name == "internal_user"
                                ? "Internal User"
                                : "External User"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-gray-700 font-medium capitalize">
                      {userType?.name?.replace("_", " ") || "N/A"}
                    </p>
                  )}
                </div>

                {/* Institute */}
                {isEditing ? (
                  // Edit mode: only show select if external
                  isExternalUser && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <BuildingOfficeIcon className="h-4 w-4 text-[#1E516A]" />
                        <p className="text-xs font-semibold text-[#1E516A] uppercase tracking-wide">
                          Institute
                        </p>
                      </div>
                      <Select
                        value={editForm.institute_id}
                        onValueChange={(value) =>
                          handleInputChange("institute_id", value)
                        }
                      >
                        <SelectTrigger className="w-full border border-gray-300">
                          <SelectValue placeholder="Select Institute" />
                        </SelectTrigger>
                        <SelectContent>
                          {loadingInstitutes ? (
                            <SelectItem value="loading">Loading...</SelectItem>
                          ) : (
                            institutes?.map((inst: any) => (
                              <SelectItem
                                key={inst.institute_id}
                                value={inst.institute_id}
                              >
                                {inst.name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  )
                ) : (
                  // View mode: always show institute for both internal and external
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <BuildingOfficeIcon className="h-4 w-4 text-[#1E516A]" />
                      <p className="text-xs font-semibold text-[#1E516A] uppercase tracking-wide">
                        Institute
                      </p>
                    </div>
                    <p className="text-gray-700 font-medium">
                      {userData.institute?.name || "EAII"}
                    </p>
                  </div>
                )}
              </div>

              {/* Roles Section */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <AcademicCapIcon className="h-5 w-5 text-[#094C81]" />
                    <h3 className="text-lg font-semibold text-[#094C81]">
                      Roles
                    </h3>
                    <span className="text-sm text-gray-500">
                      {isEditing
                        ? `(${allRoles.length} available)`
                        : `(${userRolesList.length})`}
                    </span>
                  </div>
                  {isEditing && allRoles.length > 0 && (
                    <button
                      onClick={handleSelectAllRoles}
                      className="text-sm text-[#094C81] hover:text-[#073954] font-medium"
                    >
                      {editForm.role_ids.length === allRoles.length
                        ? "Deselect All"
                        : "Select All"}
                    </button>
                  )}
                </div>

                {isEditing ? (
                  // Edit mode: Show all roles as selectable checkboxes
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                    {allRoles.map((role: any) => {
                      const isSelected = editForm.role_ids.includes(
                        role.role_id
                      );
                      return (
                        <div
                          key={role.role_id}
                          className={`bg-gray-50 border border-gray-300 rounded-lg p-3 transition-all duration-200 cursor-pointer hover:border-[#094C81]/50 hover:bg-gray-100 ${
                            isSelected
                              ? "border-[#094C81] bg-[#094C81]/10"
                              : "border-gray-200"
                          }`}
                          onClick={() => handleRoleToggle(role.role_id)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <div
                                  className={`w-4 h-4 border rounded flex items-center justify-center ${
                                    isSelected
                                      ? "bg-[#094C81] border-[#094C81]"
                                      : "border-gray-300 bg-white"
                                  }`}
                                >
                                  {isSelected ? (
                                    <CheckIcon className="w-4 h-4 text-white" />
                                  ) : null}
                                </div>
                                <p
                                  className="font-medium text-sm text-gray-800 truncate"
                                  title={role.name}
                                >
                                  {role.name}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : // View mode: Show only user's roles as badges
                userRolesList.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {userRolesList.map((role) => (
                      <Badge
                        key={role.role_id}
                        variant="light"
                        color="primary"
                        size="md"
                        className="text-sm"
                      >
                        {role.name}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No roles assigned</p>
                )}
              </div>

              {/* there is no skills for external users so remove the skills section */}
              {/* Skills/Metrics Section */}
              {userType?.name !== "external_user" && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <StarIcon className="h-5 w-5 text-[#094C81]" />
                      <h3 className="text-lg font-semibold text-[#094C81]">
                        Skills
                      </h3>
                      <span className="text-sm text-gray-500">
                        {isEditing
                          ? `(${metrics.length} available)`
                          : `(${userMetricsList.length})`}
                      </span>
                    </div>
                    {isEditing && metrics.length > 0 && (
                      <button
                        onClick={handleSelectAllMetrics}
                        className="text-sm text-[#094C81] hover:text-[#073954] font-medium"
                      >
                        {editForm.project_metrics_ids.length === metrics.length
                          ? "Deselect All"
                          : "Select All"}
                      </button>
                    )}
                  </div>

                  {loadingMetrics ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#094C81] mx-auto mb-2"></div>
                      <p className="text-gray-500 text-sm">Loading skills...</p>
                    </div>
                  ) : isEditing ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                      {metrics.map((metric) => {
                        const isSelectedInEdit =
                          editForm.project_metrics_ids.includes(
                            metric.project_metric_id
                          );
                        return (
                          <div
                            key={metric.project_metric_id}
                            className={`bg-gray-50 border border-gray-300 rounded-lg p-3 transition-all duration-200 cursor-pointer hover:border-[#094C81]/50 hover:bg-gray-100 ${
                              isSelectedInEdit
                                ? "border-[#094C81] bg-[#094C81]/10"
                                : ""
                            }`}
                            onClick={() =>
                              handleMetricToggle(metric.project_metric_id)
                            }
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-4 h-4 border rounded flex items-center justify-center ${
                                  isSelectedInEdit
                                    ? "bg-[#094C81] border-[#094C81]"
                                    : "border-gray-300 bg-white"
                                }`}
                              >
                                {isSelectedInEdit && (
                                  <CheckIcon className="w-3 h-3 text-white" />
                                )}
                              </div>
                              <p
                                className="font-medium text-sm text-gray-900 truncate"
                                title={metric.name}
                              >
                                {metric.name}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : userMetricsList.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {userMetricsList.map((metric) => (
                        <Badge
                          key={metric.project_metric_id}
                          variant="light"
                          color="primary"
                          size="md"
                          className="text-sm  "
                        >
                          {metric.name}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <p className="text-gray-500">No skills assigned</p>
                    </div>
                  )}
                </div>
              )}
              {/* Internal Project Roles Section - Categorized by Project */}
              {!isEditing &&
                userData.internalProjectUserRoles &&
                userData.internalProjectUserRoles.length > 0 && (
                  <div className="mt-6">
                    <div className="flex items-center gap-2 mb-4">
                      <BriefcaseIcon className="h-5 w-5 text-[#094C81]" />
                      <h3 className="text-lg font-semibold text-[#094C81]">
                        Assigned Projects
                      </h3>
                    </div>

                    {/* Group roles by project */}
                    <div className="w-full grid grid-cols-2 gap-4">
                      {Object.entries(
                        userData.internalProjectUserRoles.reduce<
                          Record<string, InternalProjectUserRole[]>
                        >((acc, ipr) => {
                          const projectName =
                            ipr.project?.name || "Unknown Project";
                          if (!acc[projectName]) acc[projectName] = [];
                          acc[projectName].push(ipr);
                          return acc;
                        }, {})
                      ).map(([projectName, roles]) => {
                        // Determine project status: active if any role is active
                        const isProjectActive = roles.some((r) => r.is_active);

                        return (
                          <div
                            key={projectName}
                            className="mb-6 bg-white border border-gray-200 rounded-lg shadow-sm p-4"
                          >
                            {/* Project Header */}
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="text-[#094C81] font-semibold text-lg">
                                {projectName}
                              </h4>
                              <Badge
                                variant="light"
                                color={isProjectActive ? "success" : "error"}
                                size="sm"
                                className="text-sm flex items-center gap-1"
                              >
                                {isProjectActive ? (
                                  <>
                                    <CheckCircleIcon className="h-4 w-4" />
                                    Active
                                  </>
                                ) : (
                                  <>
                                    <XCircleIcon className="h-4 w-4" />
                                    Inactive
                                  </>
                                )}
                              </Badge>
                            </div>

                            {/* Roles Grid */}
                            <div className="flex  gap-3">
                              {roles.map((ipr: InternalProjectUserRole) => (
                                <div
                                  key={ipr.internal_project_user_role_id}
                                  className="flex flex-col gap-1 w-full max-w-1/2 justify-center items-center bg-gray-50 rounded-lg p-3 border border-gray-200"
                                >
                                  {/* Metric */}
                                  <Badge
                                    variant="light"
                                    color="primary"
                                    size="sm"
                                    className="text-sm w-fit flex items-center gap-1"
                                  >
                                    <StarIcon className="h-4 w-4 text-[#094C81]" />
                                    {ipr.projectMetric?.name || "N/A"}
                                  </Badge>

                                  {/* Node */}
                                  <Badge
                                    variant="light"
                                    color="secondary"
                                    size="sm"
                                    className="text-sm flex items-center gap-1"
                                  >
                                    <FaProjectDiagram className="h-4 w-4 text-[#094C81]" />
                                    {ipr.internalNode?.name || "N/A"}
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

              {/* External Project Roles Section - Categorized by Project */}
              {!isEditing &&
                userType?.name === "external_user" &&
                userData.projectRoles &&
                userData.projectRoles.length > 0 && (
                  <div className="mt-6">
                    <div className="flex items-center gap-2 mb-4">
                      <BriefcaseIcon className="h-5 w-5 text-[#094C81]" />
                      <h3 className="text-lg font-semibold text-[#094C81]">
                        Assigned Projects
                      </h3>
                    </div>

                    {/* Group roles by project */}
                    <div className="w-full grid grid-cols-2 gap-4">
                      {Object.entries(
                        userData.projectRoles.reduce<
                          Record<string, typeof userData.projectRoles>
                        >((acc, pr) => {
                          const projectName =
                            pr.project?.name || "Unknown Project";
                          if (!acc[projectName]) acc[projectName] = [];
                          acc[projectName].push(pr);
                          return acc;
                        }, {})
                      ).map(([projectName, roles]) => {
                        const isProjectActive = roles.some((r) => r.is_active);

                        return (
                          <div
                            key={projectName}
                            className="mb-6 bg-white border border-gray-200 rounded-lg shadow-sm p-4"
                          >
                            {/* Project Header */}
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="text-[#094C81] font-semibold text-lg">
                                {projectName}
                              </h4>
                              <Badge
                                variant="light"
                                color={isProjectActive ? "success" : "error"}
                                size="sm"
                                className="text-sm flex items-center gap-1"
                              >
                                {isProjectActive ? (
                                  <>
                                    <CheckCircleIcon className="h-4 w-4" />
                                    Active
                                  </>
                                ) : (
                                  <>
                                    <XCircleIcon className="h-4 w-4" />
                                    Inactive
                                  </>
                                )}
                              </Badge>
                            </div>

                            {/* Roles Grid */}
                            <div className="flex gap-3 flex-wrap">
                              {roles.map((pr) => (
                                <div
                                  key={pr.project_user_role_id}
                                  className="flex flex-col gap-1 w-full max-w-1/2 justify-center items-center bg-gray-50 rounded-lg p-3 border border-gray-200"
                                >
                                  {/* Node / Hierarchy */}
                                  <Badge
                                    variant="light"
                                    color="secondary"
                                    size="sm"
                                    className="text-sm flex items-center gap-1 w-fit"
                                  >
                                    <FaProjectDiagram className="h-4 w-4 text-[#094C81]" />
                                    {pr.hierarchyNode?.name || "N/A"}
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserDetail;
