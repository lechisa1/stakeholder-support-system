"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "../ui/cn/button";
import { Input } from "../ui/cn/input";
import { Label } from "../ui/cn/label";
import { XIcon } from "lucide-react";

import {
  useGetInternalNodeByIdQuery,
  useUpdateInternalNodeMutation,
} from "../../redux/services/internalNodeApi";

interface UpdateStructureModalProps {
  isOpen: boolean;
  onClose: () => void;
  internalNodeId: string;
}

export function EditChildInternalNodeModal({
  isOpen,
  onClose,
  internalNodeId,
}: UpdateStructureModalProps) {
  const [name, setName] = useState("");

  // 🔹 Fetch node data
  const {
    data: node,
    isLoading: isFetchingNode,
    isError,
  } = useGetInternalNodeByIdQuery(internalNodeId, {
    skip: !internalNodeId || !isOpen,
    refetchOnMountOrArgChange: true,
  });
  
  const handleClose = () => {
    // Reset back to fetched values (discard edits)
    if (node) {
      setName(node.name || "");
    } else {
      setName("");
    }
  
    onClose();
  };
  
  // 🔹 Update mutation
  const [updateNode, { isLoading: isUpdating }] =
    useUpdateInternalNodeMutation();

  // 🔹 Fill form when editing
  useEffect(() => {
    if (node) {
      setName(node.name || "");
    }
  }, [node]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Support request flow name is required");
      return;
    }

    try {
      await updateNode({
        id: internalNodeId,
        data: {
          name,
        },
      }).unwrap();

      toast.success("Support request flow updated!");
      onClose();
    } catch (error: any) {
      toast.error(
        error?.data?.message || "Failed to update support request flow"
      );
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-[400px] max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-[#094C81]">
            Update Child
          </h2>
          <button
            onClick={handleClose}
            className="text-[#094C81] hover:text-gray-600 transition-colors duration-200"
          >
            <XIcon className="w-6 h-6 cursor-pointer" />
          </button>
        </div>

        {/* Loading / Error */}
        {isFetchingNode ? (
          <div className="text-center text-sm text-gray-500 py-8">
            Loading data...
          </div>
        ) : isError ? (
          <div className="text-center text-sm text-red-500 py-8">
            Failed to load data
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <Label className="block text-sm text-[#094C81] font-medium mb-2">
                Support Request Flow Name{" "}
                <span className="text-red-500">*</span>
              </Label>
              <Input
                placeholder="Enter support request flow name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            {/* Buttons */}
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isUpdating}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={isUpdating || !name.trim()}
                className="bg-[#094C81] hover:bg-[#094C81]/80 text-white"
              >
                {isUpdating ? "Updating..." : "Update"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
