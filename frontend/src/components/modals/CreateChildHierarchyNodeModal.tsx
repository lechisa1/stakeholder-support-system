"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { Button } from "../ui/cn/button";
import { Input } from "../ui/cn/input";
import { Label } from "../ui/cn/label";

import { useCreateHierarchyNodeMutation } from "../../redux/services/hierarchyNodeApi";
import { XIcon } from "lucide-react";
import { Textarea } from "../ui/cn/textarea";

interface HierarchyCreateionProps {
  project_id: string;
  isOpen: boolean;
  onClose: () => void;
  parentHierarchyId: string;
}

export function CreateChildHierarchyNodeModal({
  project_id,
  parentHierarchyId,
  isOpen,
  onClose,
}: HierarchyCreateionProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [createNode, { isLoading: isCreatingNode }] =
    useCreateHierarchyNodeMutation();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Structure name is required");
      return;
    }

    try {
      await createNode({
        project_id: project_id,
        parent_id: parentHierarchyId || null,
        name,
        description,
        is_active: true,
      }).unwrap();

      toast.success("Structure created!");

      setName("");
      setDescription("");
      onClose();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to create structure");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-[400px] max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-[#094C81]">
            Create Child
          </h2>
          <button
            onClick={onClose}
            className="text-[#094C81] hover:text-gray-600 transition-colors duration-200"
          >
            <XIcon className="w-6 h-6 cursor-pointer" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4  ">
          <div className="flex gap-10">
            <div className="w-full flex-col flex justify-between gap-4">
              {/* Node Name */}
              <div className="">
                <Label className="block text-sm text-[#094C81] font-medium mb-2">
                  Structure Name *
                </Label>
                <Input
                  id="structure-name"
                  placeholder="Enter structure name"
                  value={name}
                  className="w-full h-10 border border-gray-300 px-4 py-3 rounded-md focus:ring focus:ring-[#094C81] focus:border-transparent transition-all duration-200 outline-none"
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              {/* Description */}
              {/* <div className="">
                <Label
                  htmlFor="structure-description"
                  className="block text-sm text-[#094C81] font-medium mb-2"
                >
                  Description
                </Label>
                <Textarea
                  id="structure-description"
                  placeholder="Enter structure description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full h-10 border border-gray-300 px-4 py-3 rounded-md focus:ring focus:ring-[#094C81] focus:border-transparent transition-all duration-200 outline-none"
                />
              </div> */}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isCreatingNode}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={isCreatingNode || !name.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isCreatingNode ? "Creating..." : "Create "}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
