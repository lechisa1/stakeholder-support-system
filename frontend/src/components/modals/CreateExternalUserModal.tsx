// CreateExternalUserModal for external users
"use client";

import React, { useEffect } from "react";
import { toast } from "sonner";
import Input from "../form/input/InputField";
import { Label } from "../ui/cn/label";
import { Button } from "../ui/cn/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../ui/cn/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui/cn/popover";

import {
  useCreateUserMutation,
  CreateUserDto,
} from "../../redux/services/userApi";

import {
  useGetInstitutesQuery,
  Institute,
} from "../../redux/services/instituteApi";
import { XIcon, ChevronDown } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { getUserPositionId } from "../../utils/helper/userPosition";
import { useGetRolesQuery } from "../../redux/services/roleApi";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createExternalUserSchema,
  type CreateExternalUserFormData,
} from "../../utils/validation/schemas";

interface CreateExternalUserModalProps {
  logged_user_type: string;
  user_type_id: string;
  inistitute_id: string;
  isOpen: boolean;
  onClose: () => void;
}

export const CreateExternalUserModal: React.FC<CreateExternalUserModalProps> = ({
  logged_user_type,
  user_type_id,
  inistitute_id,
  isOpen,
  onClose,
}) => {
  const { user } = useAuth();

  const { data: institutes, isLoading: loadingInstitutes } =
    useGetInstitutesQuery();
  const { data: rolesResponse } = useGetRolesQuery({
    role_type: "external",
  });
  const roles = rolesResponse?.data || [];

  const [createUser, { isLoading }] = useCreateUserMutation();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CreateExternalUserFormData>({
    resolver: zodResolver(createExternalUserSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: {
      full_name: "",
      email: "",
      phone_number: "",
      position: "",
      role_ids: [],
      institute_id: "",
    },
  });

  const selectedRoles = watch("role_ids") || [];
  const instituteId = watch("institute_id") || "";

  // Set initial ID on modal open
  useEffect(() => {
    const id = user?.institute?.institute_id || inistitute_id || "";
    if (id) {
      setValue("institute_id", id);
    }
  }, [user, inistitute_id, isOpen, setValue]);

  const positionId = getUserPositionId(logged_user_type, "external_user", true);

  const onSubmit = async (data: CreateExternalUserFormData) => {
    const finalInstituteId = user?.institute?.institute_id || data.institute_id;
    
    // Additional validation for institute when it needs to be selected
    if (logged_user_type === "internal_user" && !finalInstituteId) {
      setError("institute_id", {
        type: "manual",
        message: "Please select an institute for external users",
      });
      return;
    }

    const payload: CreateUserDto = {
      full_name: data.full_name,
      email: data.email,
      phone_number: data.phone_number || undefined,
      user_type_id: user_type_id,
      role_ids: data.role_ids || [],
      position: data.position || undefined,
      institute_id: finalInstituteId,
      user_position_id: positionId,
    };

    try {
      await createUser(payload).unwrap();
      toast.success("User created successfully!");
      handleClose();
    } catch (error: unknown) {
      const errorMessage = (error as { data?: { message?: string } })?.data?.message || "Failed to create user";
      toast.error(errorMessage);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) handleClose();
  };

  if (!isOpen) return null;

  // Determine if institute selection should be shown
  const showInstituteSelect =
    logged_user_type === "internal_user";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-6 rounded-2xl w-full max-w-[700px] shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-[#094C81]">Create User</h2>
          <button
            onClick={handleClose}
            className="text-[#094C81] hover:text-gray-600 transition"
          >
            <XIcon className="w-6 h-6 cursor-pointer" />
          </button>
        </div>

        {/* Content */}
        <div className="w-full flex flex-col space-y-4">
          {/* User Detail */}
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4  mt-2 pr-2">
            {showInstituteSelect && (
              <div className="space-y-2">
                <Label className="block text-sm text-[#094C81] font-medium mb-2">
                  Institute <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={instituteId}
                  onValueChange={(value) => {
                    setValue("institute_id", value, {
                      shouldValidate: true,
                      shouldDirty: true,
                    });
                  }}
                  disabled={loadingInstitutes}
                >
                  <SelectTrigger className={`w-[300px] h-12 border px-4 py-3 rounded-md focus:ring focus:ring-[#094C81] focus:border-transparent transition-all duration-200 outline-none ${
                    errors.institute_id
                      ? "border-red-300 focus:ring-red-500/20"
                      : "border-gray-300"
                  }`}>
                    <SelectValue
                      className="text-sm text-[#094C81] font-medium"
                      placeholder="Select Institute"
                    />
                  </SelectTrigger>
                  <SelectContent className="text-sm bg-white text-[#094C81] font-medium">
                    {institutes?.map((inst: Institute) => (
                      <SelectItem
                        className="text-sm text-[#094C81] font-medium"
                        key={inst.institute_id}
                        value={inst.institute_id}
                      >
                        {inst.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.institute_id && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.institute_id.message}
                  </p>
                )}
              </div>
            )}
            <div className="space-y-2">
              <Label className="block text-sm text-[#094C81] font-medium mb-2">
                Full Name <span className="text-red-500">*</span>
              </Label>
              <Input
                {...register("full_name")}
                placeholder="John Doe"
                className={`w-full h-12 border px-4 py-3 rounded-md focus:ring focus:ring-[#094C81] focus:border-transparent transition-all duration-200 outline-none ${
                  errors.full_name
                    ? "border-red-300 focus:ring-red-500/20"
                    : "border-gray-300"
                }`}
              />
              {errors.full_name && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.full_name.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label className="block text-sm text-[#094C81] font-medium mb-2">
                Phone Number <span className="text-red-500">*</span>
              </Label>
              <Input
                {...register("phone_number")}
                placeholder="+251 9xxxxxxx"
                className={`w-full h-12 border px-4 py-3 rounded-md focus:ring focus:ring-[#094C81] focus:border-transparent transition-all duration-200 outline-none ${
                  errors.phone_number
                    ? "border-red-300 focus:ring-red-500/20"
                    : "border-gray-300"
                }`}
              />
              {errors.phone_number && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.phone_number.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label className="block text-sm text-[#094C81] font-medium mb-2">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                type="email"
                {...register("email")}
                placeholder="john@example.com"
                className={`w-full h-12 border px-4 py-3 rounded-md focus:ring focus:ring-[#094C81] focus:border-transparent transition-all duration-200 outline-none ${
                  errors.email
                    ? "border-red-300 focus:ring-red-500/20"
                    : "border-gray-300"
                }`}
              />
              {errors.email && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>
            {/* ROLE MULTI SELECT */}

            <div className="w-full space-y-2">
              <Label className="text-sm font-medium text-[#094C81]">
                Role <span className="text-red-500">*</span>
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="w-full max-h-28 min-h-12 h-fit border border-gray-300 p-2 rounded-md mt-1 text-[#094C81] bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#094C81] focus:ring-offset-2 transition-all duration-200"
                  >
                    <div className="flex flex-wrap items-center gap-2 w-full">
                      {selectedRoles.length === 0 && (
                        <span className="text-sm w-full justify-between text-gray-400 flex items-center gap-2">
                          Select Role
                          <ChevronDown className="h-4 w-4 ml-auto" />
                        </span>
                      )}

                      {selectedRoles.map((roleId) => {
                        const r = roles.find(
                          (rr: { role_id: string; name: string }) => rr.role_id === roleId
                        );
                        if (!r) return null;

                        return (
                          <span
                            key={roleId}
                            className="inline-flex items-center gap-1 rounded-md justify-center bg-[#094C81]/10 text-[#094C81] px-2 py-1 text-xs"
                          >
                            <span className="truncate max-w-[120px]">
                              {r.name}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                const newRoles = selectedRoles.filter(
                                  (id) => id !== roleId
                                );
                                setValue("role_ids", newRoles, {
                                  shouldValidate: true,
                                  shouldDirty: true,
                                });
                              }}
                              className="flex h-4 w-4 items-center justify-center rounded-full hover:bg-[#094C81]/20 transition-colors"
                              aria-label={`Remove ${r.name}`}
                            >
                              <XIcon className="h-3 w-3" />
                            </button>
                          </span>
                        );
                      })}
                      {selectedRoles.length > 0 && (
                        <ChevronDown className="h-4 w-4 ml-auto text-gray-400" />
                      )}
                    </div>
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-[300px] p-2 bg-white"
                  align="start"
                >
                  <div className="max-h-64 overflow-y-auto">
                    {roles
                      .filter((r: { role_id: string; name: string }) => !selectedRoles.includes(r.role_id))
                      .map((r: { role_id: string; name: string }) => (
                        <button
                          key={r.role_id}
                          type="button"
                          onClick={() => {
                            const newRoles = [...selectedRoles, r.role_id];
                            setValue("role_ids", newRoles, {
                              shouldValidate: true,
                              shouldDirty: true,
                            });
                          }}
                          className="w-full text-left px-3 py-2 text-sm text-[#094C81] hover:bg-[#094C81]/10 rounded-md cursor-pointer transition-colors"
                        >
                          <span className="block truncate">{r.name}</span>
                        </button>
                      ))}
                    {roles.filter((r: { role_id: string; name: string }) => !selectedRoles.includes(r.role_id)).length === 0 && (
                      <div className="px-3 py-2 text-sm text-gray-400 text-center">
                        All roles selected
                      </div>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
              {errors.role_ids && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.role_ids.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
          <Button variant="outline" onClick={handleClose} type="button">
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || isLoading}
            className="min-w-24"
          >
            {isLoading ? "Creating..." : "Create"}
          </Button>
        </div>
      </form>
    </div>
  );
};

