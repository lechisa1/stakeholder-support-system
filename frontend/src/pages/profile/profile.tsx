import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Badge from "../../components/ui/badge/Badge";
import { format } from "date-fns";
import {
  EnvelopeIcon,
  PhoneIcon,
  BriefcaseIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  XCircleIcon,
  LockClosedIcon,
} from "@heroicons/react/24/outline";
import { User2Icon, Edit, KeyRound } from "lucide-react";
import { getFileUrl } from "../../utils/fileUrl";
import { Modal } from "../../components/ui/modal";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import Button from "../../components/ui/button/Button";
import { useModal } from "../../hooks/useModal";
import { useUpdateUserMutation } from "../../redux/services/userApi";
import { toast } from "sonner";
import { EyeIcon, EyeCloseIcon } from "../../icons";
import DetailHeader from "../../components/common/DetailHeader";

const Profile = () => {
  const { user, loading, updateProfile } = useAuth();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
  
  // Modals
  const editProfileModal = useModal();

  // Edit Profile State
  const [editFormData, setEditFormData] = useState({
    full_name: "",
    email: "",
    phone_number: "",
    position: "",
  });

  // Change Password State
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "PPP p");
    } catch {
      return dateString;
    }
  };

  // Initialize edit form when modal opens
  const handleOpenEditModal = () => {
    if (user) {
      setEditFormData({
        full_name: user.full_name || "",
        email: user.email || "",
        phone_number: user.phone_number || "",
        position: user.position || "",
      });
      editProfileModal.openModal();
    }
  };

  // Handle profile update
  const handleUpdateProfile = async () => {
    if (!user) return;

    // Validation
    if (!editFormData.full_name.trim()) {
      toast.error("Full name is required");
      return;
    }

    if (!editFormData.email.trim()) {
      toast.error("Email is required");
      return;
    }

    try {
      const response = await updateUser({
        id: user.user_id,
        data: {
          full_name: editFormData.full_name,
          email: editFormData.email,
          phone_number: editFormData.phone_number || undefined,
          position: editFormData.position || undefined,
        },
      }).unwrap();

      // Update local auth context
      await updateProfile({
        full_name: editFormData.full_name,
        email: editFormData.email,
        phone_number: editFormData.phone_number,
        position: editFormData.position,
      });

      toast.success("Profile updated successfully!");
      editProfileModal.closeModal();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update profile");
    }
  };

  // Handle password change
  const handleChangePassword = async () => {
    if (!user) return;

    // Validation
    if (!passwordData.currentPassword) {
      toast.error("Current password is required");
      return;
    }

    if (!passwordData.newPassword) {
      toast.error("New password is required");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (passwordData.currentPassword === passwordData.newPassword) {
      toast.error("New password must be different from current password");
      return;
    }

    setIsChangingPassword(true);
    try {
      // Note: You may need to add a changePassword endpoint to your API
      // For now, this is a placeholder that you can connect to your backend
      const response = await fetch(
        `${import.meta.env.VITE_API_PUBLIC_BASE_URL}/auth/change-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
          body: JSON.stringify({
            current_password: passwordData.currentPassword,
            new_password: passwordData.newPassword,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to change password");
      }

      toast.success("Password changed successfully!");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      toast.error(error?.message || "Failed to change password");
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9FBFC] p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#094C81] mx-auto mb-4"></div>
          <p className="text-[#1E516A] text-lg">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F9FBFC] p-6 flex items-center justify-center">
        <div className="text-center">
          <XCircleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-[#1E516A] mb-2">
            No User Data
          </h2>
          <p className="text-gray-600">
            Please log in to view your profile.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageMeta
        title={`${user.full_name} - Profile`}
        description={`Profile page for ${user.full_name}`}
      />
      <div className="min-h-screen bg-[#F9FBFC] p-6 pb-24">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Breadcrumb */}
          <DetailHeader
              breadcrumbs={[
                { title: "Profile", link: "" },
              ]}
            />
          {/* User Profile Card */}
          <div className="bg-white py-5 px-3 rounded-xl border shadow-sm">
            {/* Header */}
            <div className="flex flex-row items-center border-b w-full justify-between text-[#094C81] rounded-t-xl px-6 py-4">
              <div className="flex items-center gap-4">
                {/* Profile Image */}
                <div className="w-20 h-20 overflow-hidden border-2 border-[#094C81] rounded-full flex items-center justify-center bg-white">
                  {user.profile_image ? (
                    <img
                      src={getFileUrl(user.profile_image)}
                      alt={user.full_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User2Icon className="h-12 w-12 text-[#094C81]" />
                  )}
                </div>

                <div>
                  <h2 className="text-[#094C81] text-2xl mb-1">
                    {user.full_name}
                  </h2>
                  <p className="text-gray-600 text-sm">{user.email}</p>
                </div>
              </div>

              
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Personal Information Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {/* Email */}
                

                {/* Phone */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <PhoneIcon className="h-4 w-4 text-[#1E516A]" />
                    <p className="text-xs font-semibold text-[#1E516A] uppercase tracking-wide">
                      Phone Number
                    </p>
                  </div>
                  <p className="text-gray-700 font-medium">
                    {user.phone_number || "N/A"}
                  </p>
                </div>

                {/* Position */}
                {user.position && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <BriefcaseIcon className="h-4 w-4 text-[#1E516A]" />
                      <p className="text-xs font-semibold text-[#1E516A] uppercase tracking-wide">
                        Position
                      </p>
                    </div>
                    <p className="text-gray-700 font-medium">
                      {user.position}
                    </p>
                  </div>
                )}

                {/* Institute */}
                {user.institute && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <BuildingOfficeIcon className="h-4 w-4 text-[#1E516A]" />
                      <p className="text-xs font-semibold text-[#1E516A] uppercase tracking-wide">
                        Institute
                      </p>
                    </div>
                    <p className="text-gray-700 font-medium">
                      {user.institute.name || "N/A"}
                    </p>
                  </div>
                )}
              </div>

              {/* Roles Section */}
              {user.roles && user.roles.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-[#094C81] mb-4">
                    Roles & Permissions
                  </h3>
                  <div className="space-y-3">
                    {user.roles.map((userRole, index) => (
                      <div
                        key={userRole.project_user_role_id || index}
                        className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-semibold text-gray-800">
                            {userRole.role?.name || "No Role"}
                          </p>
                          {userRole.subRole && (
                            <Badge
                              variant="light"
                              color="info"
                              size="sm"
                              className="text-xs"
                            >
                              {userRole.subRole.name}
                            </Badge>
                          )}
                        </div>
                        {userRole.role?.subRoles &&
                          userRole.role.subRoles.length > 0 && (
                            <div className="mt-2">
                              <p className="text-xs text-gray-500 mb-2">
                                Permissions:
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {userRole.role.subRoles.map((subRole) =>
                                  subRole.permissions.map((permission) => (
                                    <Badge
                                      key={permission.permission_id}
                                      variant="outline"
                                      size="sm"
                                      className="text-xs"
                                    >
                                      {permission.resource}: {permission.action}
                                    </Badge>
                                  ))
                                )}
                              </div>
                            </div>
                          )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              

              {/* Change Password Section */}
              <div className="border-t border-gray-200 pt-6 mt-6">
                <div className="flex items-center gap-2 mb-4">
                  <LockClosedIcon className="h-5 w-5 text-[#094C81]" />
                  <h3 className="text-lg font-semibold text-[#094C81]">
                    Change Password
                  </h3>
                </div>
                <p className="text-sm text-gray-600 mb-6">
                  Update your password to keep your account secure.
                </p>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleChangePassword();
                  }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Current Password */}
                    <div>
                      <Label>
                        Current Password <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <Input
                          type={showPasswords.current ? "text" : "password"}
                          value={passwordData.currentPassword}
                          onChange={(e) =>
                            setPasswordData({
                              ...passwordData,
                              currentPassword: e.target.value,
                            })
                          }
                          required
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowPasswords({
                              ...showPasswords,
                              current: !showPasswords.current,
                            })
                          }
                          className="absolute inset-y-0 right-0 flex items-center pr-3"
                        >
                          {showPasswords.current ? (
                            <EyeIcon className="size-5 text-gray-500 dark:text-gray-400" />
                          ) : (
                            <EyeCloseIcon className="size-5 text-gray-500 dark:text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* New Password */}
                    <div>
                      <Label>
                        New Password <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <Input
                          type={showPasswords.new ? "text" : "password"}
                          value={passwordData.newPassword}
                          onChange={(e) =>
                            setPasswordData({
                              ...passwordData,
                              newPassword: e.target.value,
                            })
                          }
                          required
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowPasswords({
                              ...showPasswords,
                              new: !showPasswords.new,
                            })
                          }
                          className="absolute inset-y-0 right-0 flex items-center pr-3"
                        >
                          {showPasswords.new ? (
                            <EyeIcon className="size-5 text-gray-500 dark:text-gray-400" />
                          ) : (
                            <EyeCloseIcon className="size-5 text-gray-500 dark:text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <Label>
                        Confirm Password <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <Input
                          type={showPasswords.confirm ? "text" : "password"}
                          value={passwordData.confirmPassword}
                          onChange={(e) =>
                            setPasswordData({
                              ...passwordData,
                              confirmPassword: e.target.value,
                            })
                          }
                          required
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowPasswords({
                              ...showPasswords,
                              confirm: !showPasswords.confirm,
                            })
                          }
                          className="absolute inset-y-0 right-0 flex items-center pr-3"
                        >
                          {showPasswords.confirm ? (
                            <EyeIcon className="size-5 text-gray-500 dark:text-gray-400" />
                          ) : (
                            <EyeCloseIcon className="size-5 text-gray-500 dark:text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Button
                      size="sm"
                      type="submit"
                      disabled={isChangingPassword}
                    >
                      {isChangingPassword ? "Changing..." : "Change Password"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      type="button"
                      onClick={() => {
                        setPasswordData({
                          currentPassword: "",
                          newPassword: "",
                          confirmPassword: "",
                        });
                      }}
                    >
                      Clear
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;