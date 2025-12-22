"use client";

import React, { useState } from "react";
import { useCreateHierarchyMutation } from "../../redux/services/hierarchyApi";
import { Button } from "../ui/cn/button";
import { Input } from "../ui/cn/input";
import { Label } from "../ui/cn/label";
import { toast } from "sonner";

interface CreateHierarchyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateHierarchyModal: React.FC<CreateHierarchyModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    project_id: "1a437ad9-a7d8-4131-bf99-6ebdc77fc567", // optional: you may provide a dropdown for projects
    is_active: true,
  });

  const [createHierarchy, { isLoading }] = useCreateHierarchyMutation();

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createHierarchy(formData).unwrap();
      toast.success("Hierarchy created successfully");
      onClose();
      setFormData({
        name: "",
        description: "",
        project_id: "1a437ad9-a7d8-4131-bf99-6ebdc77fc567",
        is_active: true,
      });
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to create hierarchy");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-lg w-[400px] p-6">
        <h2 className="text-lg font-semibold mb-4">Create Hierarchy</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Hierarchy Name</Label>
            <Input
              id="name"
              name="name"
              type="text"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter hierarchy name"
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter description"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
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
