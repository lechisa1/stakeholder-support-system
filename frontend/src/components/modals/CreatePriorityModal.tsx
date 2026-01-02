"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "../ui/cn/button";
import Input from "../form/input/InputField";
import { Label } from "../ui/cn/label";
import TextArea from "../form/input/TextArea";
import { XIcon, ChevronDown } from "lucide-react";
import { HexColorPicker } from "react-colorful";
import { useCreateIssuePriorityMutation } from "../../redux/services/issuePriorityApi";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { prioritySchema, type PriorityFormData } from "../../utils/validation";
interface CreatePriorityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreatePriorityModal: React.FC<CreatePriorityModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [responseUnit, setResponseUnit] = useState("hour");
  const [color, setColor] = useState("#aabbcc");

  const [createPriority, { isLoading }] = useCreateIssuePriorityMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setError: setFormError,
    reset,
    setValue,
    trigger,
  } = useForm<PriorityFormData>({
    resolver: zodResolver(prioritySchema),
    defaultValues: {
      name: "",
      description: "",
      response_duration: 0,
      response_unit: "hour",
      color_value: "#aabbcc",
      is_active: false,
    },
  });
  const handleClose = () => {
    reset({
      name: "",
      description: "",
      response_duration: 0,
      response_unit: "hour",
      color_value: "#aabbcc",
      is_active: false,
    });
    onClose();
  };
  const onSubmit = async (data: PriorityFormData) => {
    try {
      await createPriority(data).unwrap();
      toast.success("Priority created successfully");
      reset();
      handleClose();
    } catch (error: unknown) {
      const message =
        (error as { message?: string })?.message || "Failed to create priority";
      setFormError("root", { message });
    }
  };

 

  const unitOptions = [
    { value: "hour", label: "Hours" },
    { value: "day", label: "Days" },
    { value: "month", label: "Months" },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity duration-200">
      <div className="w-full max-w-[700px] rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[20px] font-bold text-[#094C81]">
            Create New Request Priority
          </h2>
          <button
            onClick={handleClose}
            className="text-[#094C81] hover:text-gray-600 transition-colors duration-200"
          >
            <XIcon className="w-6 h-6 cursor-pointer" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4 flex w-full flex-col"
        >
          <div className="flex w-full gap-10">
            {/* Left side: Name, Response Time, Description */}
            <div className="flex w-1/2 flex-col gap-3 space-y-1">
              {/* Priority Name */}
              <div className="flex flex-col w-full">
                <Label
                  htmlFor="priority-name"
                  className="block text-sm text-[#094C81] font-medium mb-2"
                >
                  Priority Name
                </Label>
                <Input
                  id="priority-name"
                  type="text"
                  {...register("name")}
                  error={!!errors.name}
                  hint={errors.name?.message}
                  placeholder="Enter priority name"
                  className="w-full"
                />
              </div>

              {/* Response Time - Combined Input with Dropdown */}
              <div className="flex flex-col w-full">
                <Label
                  htmlFor="response-time"
                  className="block text-sm text-[#094C81] font-medium mb-2"
                >
                  Response Time
                </Label>
                <div
                  className={`
    relative flex items-center rounded-md border transition-all duration-200
    ${
      errors.response_duration
        ? "border-red-300 focus-within:border-red-300 focus-within:ring-3 focus-within:ring-error-500/10"
        : "border-gray-300 focus-within:border-brand-300 focus-within:ring-3 focus-within:ring-brand-500/20"
    }
  `}
                >
                  <Input
                    id="response-time"
                    type="number"
                    {...register("response_duration")}
                    placeholder="Enter time"
                    className="w-full h-11 border-none focus:ring-0 focus:ring-transparent px-4 py-3 rounded-r-none border-r-0 outline-none transition-all duration-200"
                  />

                  <div className="relative">
                    <select
                      value={responseUnit}
                      onChange={(e) => setResponseUnit(e.target.value)}
                      className="
        h-11 px-3 py-2 bg-white text-[#094C81]
        rounded-r-md
        border-l border-transparent
        focus:outline-none focus:ring-0
        appearance-none cursor-pointer min-w-[100px]
      "
                    >
                      {unitOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>

                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#094C81] pointer-events-none" />
                  </div>
                </div>

                {errors.response_duration && (
                  <p className="mt-1 text-xs text-error-500">
                    {errors.response_duration.message}
                  </p>
                )}
              </div>

              {/* Description */}
              <div className="flex flex-col w-full">
                <Label
                  htmlFor="priority-description"
                  className="block text-sm text-[#094C81] font-medium mb-2"
                >
                  Description
                </Label>
                <TextArea
                  id="description"
                  placeholder="Enter short description (optional)"
                  value={watch("description") || ""}
                  onChange={(value) => {
                    setValue("description", value);
                    trigger("description");
                  }}
                  error={!!errors.description}
                  hint={errors.description?.message}
                  className="w-full"
                />
              </div>

              {/* Escalate to central */}
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  {...register("is_active")}
                  id="escalate-checkbox"
                  className="h-4 w-4 text-[#094C81] border-gray-300 rounded  cursor-pointer transition-all duration-200"
                />
                <Label
                  htmlFor="escalate-checkbox"
                  className="text-sm text-[#094C81]"
                >
                  Escalate to Central Team when triggered
                </Label>
              </div>

              {errors.is_active && (
                <p className="mt-1 text-xs text-error-500">
                  {errors.is_active.message}
                </p>
              )}
            </div>

            {/* Right side: Color Picker */}
            <div className="flex w-1/2 flex-col gap-3 space-y-1">
              <div className="flex flex-col w-full">
                <Label
                  htmlFor="priority-color"
                  className="block text-sm text-[#094C81] font-medium mb-2"
                >
                  Priority Color
                </Label>
                <div className="min-h-[200px] border bg-white w-full h-full shadow-md p-3 rounded-md">
                  <HexColorPicker
                    color={color}
                    onChange={(newColor) => {
                      setColor(newColor); // local UI state
                      setValue("color_value", newColor, {
                        // RHF state
                        shouldValidate: true,
                        shouldDirty: true,
                      });
                    }}
                  />
                </div>
                <div className="flex flex-col mt-2 w-full">
                  <Input
                    type="text"
                    {...register("color_value")}
                    error={!!errors.color_value}
                    hint={errors.color_value?.message}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Submit / Cancel */}
          <div className="flex justify-end space-x-2 pt-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
