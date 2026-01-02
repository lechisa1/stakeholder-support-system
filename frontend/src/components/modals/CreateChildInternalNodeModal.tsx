"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { Button } from "../ui/cn/button";
import { Input } from "../ui/cn/input";
import { Label } from "../ui/cn/label";

import { useCreateInternalNodeMutation } from "../../redux/services/internalNodeApi";
import { XIcon } from "lucide-react";
import { Textarea } from "../ui/cn/textarea";

interface CreateChildInternalNodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  parentInternalNodeId: string;
}

export function CreateChildInternalNodeModal({
  parentInternalNodeId,
  isOpen,
  onClose,
}: CreateChildInternalNodeModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("description");

  const [createNode, { isLoading: isCreatingNode }] =
    useCreateInternalNodeMutation();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Support request flow name is required");
      return;
    }

    try {
      await createNode({
        parent_id: parentInternalNodeId || null,
        name,
        description,
        is_active: true,
      }).unwrap();

      toast.success("Support request flow created!");

      setName("");
      setDescription("");
      onClose();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to create support request flow");
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
            <div className="w-full flex justify-between gap-4">
              {/* Node Name */}
              <div className="w-full">
                <Label className="block text-sm text-[#094C81] font-medium mb-2">
                  Support Request Flow Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="issue-flow-name"
                  placeholder="Enter support request flow name"
                  value={name}
                  className="w-full h-10 border border-gray-300 px-4 py-3 rounded-md focus:ring focus:ring-[#094C81] focus:border-transparent transition-all duration-200 outline-none"
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              
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
              disabled={isCreatingNode || !name.trim()}
              className="bg-[#094C81] hover:bg-[#094C81]/80 text-white"
            >
              {isCreatingNode ? "Creating..." : "Create"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

