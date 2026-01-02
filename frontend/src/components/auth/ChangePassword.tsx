"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useUpdatePasswordMutation } from "../../redux/services/authApi";
type ChangePasswordForm = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export default function ChangePassword() {
  const {  logout } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const [updatePassword] = useUpdatePasswordMutation();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordForm>();

  const newPassword = watch("newPassword");

  const onSubmit = async (data: ChangePasswordForm) => {
    console.log(data,"data in change password");
    try {
      const response = await updatePassword({
        new_password: data.newPassword,
      });
      if (response.error) {
        toast.error(response.error.data.message);
      } else {
        await logout();
        console.log("logged out successfully and navigating to login");
        toast.success("Password changed successfully");
        navigate("/login");

      }
    } catch (error: any) {
      toast.error(error.data.message);
    }
    
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="w-full max-w-md bg-white p-6 rounded-2xl shadow-xl">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-[#0C4A6E]">Change Password</h1>
          <p className="text-sm text-gray-500 mt-1">
            This is your first login. Please set a new password.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* New Password */}
          <div>
            <Label>New Password</Label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Enter new password"
                {...register("newPassword", {
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 8 characters",
                  },
                })}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.newPassword && (
              <p className="text-xs text-red-500 mt-1">
                {errors.newPassword.message}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <Label>Confirm Password</Label>
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Confirm new password"
              {...register("confirmPassword", {
                required: "Please confirm your password",
                validate: (value) =>
                  value === newPassword || "Passwords do not match",
              })}
            />
            {errors.confirmPassword && (
              <p className="text-xs text-red-500 mt-1">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <div className="flex gap-5">
            {/* Submit */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full  bg-[#0C4A6E]"
          >
            Update Password
          </Button>
          {/* cancel button */}
          <Button
            type="button"
            // remove token from local storage
            onClick={async () => {
                await logout();
                navigate("/login");
            }}
            className="w-full  bg-gray-300  font-medium text-gray-900 rounded-md hover:bg-gray-400"
          >
            Cancel
          </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
