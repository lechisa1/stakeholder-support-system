import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "../../contexts/AuthContext";
import PageMeta from "../../components/common/PageMeta";
import DetailHeader from "../../components/common/DetailHeader";
import {
  PhoneIcon,
  BriefcaseIcon,
  BuildingOfficeIcon,
  XCircleIcon,
  LockClosedIcon,
} from "@heroicons/react/24/outline";
import { Eye, EyeOff, User2Icon } from "lucide-react";
import { getFileUrl } from "../../utils/fileUrl";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import Button from "../../components/ui/button/Button";
import { toast } from "sonner";
import { EyeIcon, EyeCloseIcon } from "../../icons";
import { useUpdatePasswordMutation } from "../../redux/services/authApi";
import {
  changePasswordSchema,
  type ChangePasswordFormData,
} from "../../utils/validation/schemas";

const Profile = () => {
  const { user, loading } = useAuth();
  const [updatePassword] = useUpdatePasswordMutation();

  /* -------------------- Password State -------------------- */
  const [showPasswords, setShowPasswords] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  /* -------------------- Handlers -------------------- */
  const handleChangePassword = async (data: ChangePasswordFormData) => {
    try {
      const res = await updatePassword({
        current_password: data.currentPassword,
        new_password: data.newPassword,
      } as Parameters<typeof updatePassword>[0]);

      if (res.error) {
        const errorMessage =
          "data" in res.error &&
          typeof res.error.data === "object" &&
          res.error.data !== null &&
          "message" in res.error.data
            ? String(res.error.data.message)
            : "Failed to change password";
        throw new Error(errorMessage);
      }

      toast.success("Password changed successfully");
      reset();
    } catch (e) {
      const errorMessage =
        e instanceof Error ? e.message : "Failed to change password";
      toast.error(errorMessage);
    }
  };

  /* -------------------- Loading / Error -------------------- */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#094C81]" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <XCircleIcon className="h-14 w-14 text-red-500 mx-auto mb-3" />
          <p>No user data found</p>
        </div>
      </div>
    );
  }

  /* -------------------- UI -------------------- */
  return (
    <>
      <PageMeta title="Profile" description="User profile" />

      <div className="min-h-screen w-full bg-[#F9FBFC] p-6">
        <div className="w-full mx-auto space-y-6">
          <DetailHeader breadcrumbs={[{ title: "Profile", link: "" }]} />

          {/* Profile Card */}
          <div className="bg-white w-full rounded-xl border shadow-sm">
            {/* Header */}
            <div className="flex items-center gap-4 border-b px-6 py-4">
              <div className="w-20 h-20 rounded-full border flex items-center justify-center overflow-hidden">
                {user.profile_image ? (
                  <img
                    src={getFileUrl(user.profile_image)}
                    alt={user.full_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User2Icon className="h-10 w-10 text-[#094C81]" />
                )}
              </div>

              <div>
                <h2 className="text-xl font-semibold text-[#094C81]">
                  {user.full_name}
                </h2>
                <p className="text-sm text-gray-600">{user.email}</p>
              </div>
            </div>

            {/* Info */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Phone */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <PhoneIcon className="h-4 w-4" />
                  <p className="text-xs font-semibold uppercase">
                    Phone Number
                  </p>
                </div>
                <p>{user.phone_number || "N/A"}</p>
              </div>

              {/* Position */}
              {user.user_position && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <BriefcaseIcon className="h-4 w-4" />
                    <p className="text-xs font-semibold uppercase">Position</p>
                  </div>
                  <p>{user.user_position.name}</p>
                </div>
              )}

              {/* Institute */}
              {user.institute && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <BuildingOfficeIcon className="h-4 w-4" />
                    <p className="text-xs font-semibold uppercase">Institute</p>
                  </div>
                  <p>{user.institute.name}</p>
                </div>
              )}
            </div>

            {/* Roles */}
            {user.roles?.length > 0 && (
              <div className="px-6 pb-6">
                <h3 className="font-semibold mb-3 text-[#094C81]">Roles</h3>
                <div className="flex gap-2 flex-wrap">
                  {user.roles.map((role) => (
                    <span key={role.role_id} className="text-sm text-gray-600">
                      {role.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Change Password */}
            <div className="border-t w-full px-6 py-6">
              <div className="flex items-center gap-2 mb-4">
                <LockClosedIcon className="h-5 w-5" />
                <h3 className="font-semibold">Change Password</h3>
              </div>

              <form
                onSubmit={handleSubmit(handleChangePassword)}
                className=" w-full gap-2 flex flex-col"
              >
                <div className="w-full flex gap-4">
                  {/* Current Password */}
                  <div className="w-full">
                    <Label>Current password</Label>
                    <div className="relative">
                      <Input
                        type={showPasswords ? "text" : "password"}
                        {...register("currentPassword")}
                        error={!!errors.currentPassword}
                        hint={errors.currentPassword?.message}
                      />
                    </div>
                  </div>

                  {/* New Password */}
                  <div className="w-full">
                    <Label>New password</Label>
                    <div className="relative">
                      <Input
                        type={showPasswords ? "text" : "password"}
                        {...register("newPassword")}
                        error={!!errors.newPassword}
                        hint={errors.newPassword?.message}
                      />
                      
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="w-full">
                    <Label>Confirm password</Label>
                    <div className="relative">
                      <Input
                        type={showPasswords ? "text" : "password"}
                        {...register("confirmPassword")}
                        error={!!errors.confirmPassword}
                        hint={errors.confirmPassword?.message}
                      />
                      
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4"
                    onChange={() =>
                      setShowPasswords(!showPasswords)
                    }
                    id="showPassword"
                  />
                  <label htmlFor="showPassword">Show Password</label>
                </div>

                <div className="md:col-span-3 flex gap-3">
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Changing..." : "Change Password"}
                  </Button>
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => reset()}
                  >
                    Clear
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
