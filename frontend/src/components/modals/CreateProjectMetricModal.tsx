"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { Input } from "../ui/cn/input";
import { Label } from "../ui/cn/label";
import { Button } from "../ui/cn/button";
import { XIcon } from "lucide-react";
import { useCreateProjectMetricMutation } from "../../redux/services/projectMetricApi";

interface CreateProjectMetricModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateProjectMetricModal: React.FC<
  CreateProjectMetricModalProps
> = ({ isOpen, onClose }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [createProjectMetric, { isLoading }] = useCreateProjectMetricMutation();

  const handleSubmit = async () => {
    if (!name) {
      toast.error("Please provide a metric name");
      return;
    }

    const payload = {
      name,
      description: description || "",
      is_active: true,
    };

    try {
      await createProjectMetric(payload).unwrap();
      toast.success("Project human resource created successfully!");
      onClose();
      resetForm();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to create human resource");
    }
  };

  const resetForm = () => {
    setName("");
    setDescription("");
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity duration-200"
      onClick={handleBackdropClick}
    >
      <div className="bg-white p-6 rounded-2xl w-full max-w-[400px] shadow-2xl transform transition-all duration-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[20px] font-bold text-[#094C81]">
            Create Project Human Resource
          </h2>
          <button
            onClick={onClose}
            className="text-[#094C81] hover:text-gray-600 transition-colors duration-200"
          >
            <XIcon className="w-6 h-6 cursor-pointer" />
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <Label className="block text-sm text-[#094C81] font-medium mb-2">
              Human Resource Name <span className="text-red-500">*</span>
            </Label>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter human resource name"
              className="w-full h-10 border border-gray-300 px-4 py-3 rounded-md focus:ring focus:ring-[#094C81] focus:border-transparent transition-all duration-200 outline-none"
            />
          </div>

           
        </div>

        <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "Creating..." : "Create"}
          </Button>
        </div>
      </div>
    </div>
  );
};
