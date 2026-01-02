"use client";

import { useState } from "react";

import { useAssignInternalUserToProjectMutation } from "../../redux/services/projectApi";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/cn/dialog";
import { Button } from "../ui/cn/button";
import { Label } from "../ui/cn/label";

import { toast } from "sonner";

// ⭐ shadcn Select
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../ui/cn/select";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  GitForkIcon,
} from "lucide-react";
import {
  useGetProjectProjectMetricsQuery,
  useGetMetricUsersQuery,
} from "../../redux/services/projectMetricApi";
import { useGetInternalTreeQuery } from "../../redux/services/internalNodeApi";

interface AssignUserModalProps {
  internal_node_id?: string;
  internal_node_name?: string;
  project_id: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function AssignInternalUsersModal({
  project_id,
  internal_node_id,
  isOpen,
  onClose,
}: AssignUserModalProps) {
  const [selectedParentNode, setSelectedParentNode] = useState<string | null>(
    null
  );
  const [selectedParentNodeName, setSelectedParentNodeName] = useState<
    string | null
  >(null);
  const [hasSelectedParent, setHasSelectedParent] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState("");
  const [selectedUser, setSelectedUser] = useState("");

  const [navigationStack, setNavigationStack] = useState<any[]>([]);

  // Get project metrics assigned to this project
  const { data: projectMetricsData, isLoading: loadingMetrics } =
    useGetProjectProjectMetricsQuery(project_id, {
      skip: !project_id,
    });

  // Get users assigned to the selected metric
  const { data: metricUsersData, isLoading: loadingMetricUsers } =
    useGetMetricUsersQuery(selectedMetric, {
      skip: !selectedMetric,
    });

  // Fetch internal tree structure
  const { data: parentNodesData, isFetching: isFetchingParents } =
    useGetInternalTreeQuery();

  const [assignUserToProject] = useAssignInternalUserToProjectMutation();

  const projectMetrics = projectMetricsData?.metrics || [];
  const metricUsers = metricUsersData?.assigned_users || [];

  const tree = parentNodesData?.nodes || [];

  // Get current level nodes based on navigation stack
  const getCurrentLevelNodes = () => {
    if (navigationStack.length === 0) {
      return tree;
    }

    // Navigate through the tree based on the stack
    let currentNode = tree;
    for (const stackItem of navigationStack) {
      const foundNode = currentNode.find(
        (node: any) => node.internal_node_id === stackItem.internal_node_id
      );
      if (foundNode && foundNode.children) {
        currentNode = foundNode.children;
      } else {
        return [];
      }
    }
    return currentNode;
  };

  const currentLevelNodes = getCurrentLevelNodes();

  // Move deeper into a structure
  const enterStructure = (node: any) => {
    if (node.children && node.children.length > 0) {
      setNavigationStack((prev) => [...prev, node]);
    }
  };

  // Move back
  const goBack = () => {
    setNavigationStack((prev) => {
      const newStack = prev.slice(0, -1);
      // Only clear selection if we're going back from the root level
      if (newStack.length === 0) {
        setSelectedParentNode(null);
        setHasSelectedParent(false);
      }
      return newStack;
    });
  };

  // Handle node selection
  const handleNodeSelect = (nodeId: string | null) => {
    setSelectedParentNode(nodeId);
    setSelectedParentNodeName(
      nodeId
        ? currentLevelNodes.find(
            (node: any) => node.internal_node_id === nodeId
          )?.name || null
        : "Root"
    );
    setHasSelectedParent(true);
  };

  // Get current path display - for better UX
  const getCurrentPath = () => {
    if (navigationStack.length === 0) return "Root";
    return navigationStack.map((node) => node.name).join(" → ");
  };

  // Get selected metric details
  const getSelectedMetricDetails = () => {
    return projectMetrics.find(
      (metric: any) => metric.project_metric_id === selectedMetric
    );
  };

  // Reset user selection when metric changes
  const handleMetricChange = (metricId: string) => {
    setSelectedMetric(metricId);
    setSelectedUser(""); // Reset user selection when metric changes
  };

  const handleAssign = async () => {
    if (!selectedUser || !selectedMetric) {
      toast.error("Select metric and user first");
      return;
    }

    try {
      await assignUserToProject({
        project_id: project_id,
        user_id: selectedUser,
        project_metric_id: selectedMetric,
        internal_node_id: internal_node_id || selectedParentNode || "",
      }).unwrap();

      toast.success("User assigned successfully");

      // Reset form
      setSelectedMetric("");
      setSelectedUser("");
      setSelectedParentNode(null);
      setSelectedParentNodeName(null);
      setHasSelectedParent(false);
      setNavigationStack([]);

      onClose();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to assign user");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl bg-white max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader>
          <DialogTitle className="text-[#094C81]">
            Assign User
          </DialogTitle>
        </DialogHeader>

        <div className="flex gap-2 mt-4">
          {/* LEFT SIDE — METRIC AND USER SELECTION */}
          <div className="w-1/2 flex flex-col gap-4">
            {/* PROJECT METRIC SELECTION */}
            <div className="w-full">
              <Label className="block text-sm text-[#094C81] font-medium mb-2">
                Select Project Human Resource
              </Label>

              <Select value={selectedMetric} onValueChange={handleMetricChange}>
                <SelectTrigger className="h-12 border border-gray-300 px-4 py-3 rounded-md focus:ring focus:ring-[#094C81] focus:border-transparent transition-all duration-200 outline-none">
                  <SelectValue placeholder="Select project human resource" />
                </SelectTrigger>
                <SelectContent className="text-[#094C81] bg-white">
                  {loadingMetrics ? (
                    <SelectItem value="loading" disabled>
                      Loading metrics...
                    </SelectItem>
                  ) : projectMetrics.length === 0 ? (
                    <SelectItem value="no-metrics" disabled>
                      No metrics assigned to this project
                    </SelectItem>
                  ) : (
                    projectMetrics.map((metric: any) => (
                      <SelectItem
                        key={metric.project_metric_id}
                        value={metric.project_metric_id}
                      >
                        {metric.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>

              
            </div>

            {/* USER SELECTION BASED ON METRIC */}
            <div className="w-full">
              <Label className="block text-sm text-[#094C81] font-medium mb-2">
                Select User from Human Resource
              </Label>

              <Select
                value={selectedUser}
                onValueChange={setSelectedUser}
                disabled={!selectedMetric || loadingMetricUsers}
              >
                <SelectTrigger className="h-12 border border-gray-300 px-4 py-3 rounded-md focus:ring focus:ring-[#094C81] focus:border-transparent transition-all duration-200 outline-none">
                  <SelectValue
                    placeholder={
                      !selectedMetric
                        ? "Select a human resource first"
                        : loadingMetricUsers
                        ? "Loading users..."
                        : "Select user"
                    }
                  />
                </SelectTrigger>
                <SelectContent className="text-[#094C81] bg-white">
                  {!selectedMetric ? (
                    <SelectItem value="select-metric-first" disabled>
                      Please select a human resource first
                    </SelectItem>
                  ) : loadingMetricUsers ? (
                    <SelectItem value="loading" disabled>
                      Loading users...
                    </SelectItem>
                  ) : metricUsers.length === 0 ? (
                    <SelectItem value="no-users" disabled>
                      No users assigned to this human resource
                    </SelectItem>
                  ) : (
                    metricUsers.map((user: any) => (
                      <SelectItem key={user.user_id} value={user.user_id}>
                        {user.full_name} ({user.email})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* RIGHT SIDE - NODE SELECTION */}
          <div className="w-1/2">
            <div className="w-full flex flex-col">
              {/* Structure Selection */}
              <Label className="block text-sm text-[#094C81] font-medium mb-2">
                Select Parent Structure {!hasSelectedParent && "(required)"}
              </Label>

              <div className="rounded-lg">
                {isFetchingParents ? (
                  <p className="text-sm text-gray-500">Loading structures...</p>
                ) : (
                  <>
                    {/* Back Button */}
                    {navigationStack.length > 0 && (
                      <button
                        type="button"
                        onClick={goBack}
                        className="mb-2 flex items-center hover:bg-gray-100 rounded-md p-2 border-none outline-none shadow-none text-sm"
                      >
                        <ArrowLeftIcon className="w-4 h-4 mr-2 text-[#094C81]" />
                        <span className="text-sm text-[#094C81] font-medium">
                          Back
                        </span>
                      </button>
                    )}
                    {/* Current Path Display */}
                    {navigationStack.length > 0 && (
                      <div className="text-sm text-[#094C81] font-medium mb-2">
                        Current: {getCurrentPath()}
                      </div>
                    )}

                    {/* Root Option - Only show at root level */}
                    {currentLevelNodes.length === 0 && (
                      <button
                        type="button"
                        className={`block border text-left w-full py-2 px-3 rounded-md mb-2 transition-colors ${
                          selectedParentNode === null
                            ? "bg-blue-100 border border-blue-300 text-blue-800"
                            : "hover:bg-gray-100 border"
                        }`}
                        onClick={() => handleNodeSelect(null)}
                      >
                        <div className="flex items-center text-sm text-[#094C81] font-medium">
                          <span className="mr-2">
                            <GitForkIcon className="w-4 h-4" />
                          </span>
                          <div>
                            <div className="font-medium">Root Structure</div>
                            <div className="text-sm text-gray-600">
                              Create at project root level
                            </div>
                          </div>
                        </div>
                      </button>
                    )}

                    {/* Structure Tree */}
                    <div className="mt-2 space-y-2 max-h-60 overflow-y-auto">
                      {currentLevelNodes?.length === 0 ? (
                        <p className="text-sm text-center py-4 text-[#094C81] font-medium">
                          No structures found at this level
                        </p>
                      ) : (
                        currentLevelNodes?.map((node: any) => (
                          <div
                            key={node.internal_node_id}
                            className={`flex border items-center
                                            hover:bg-gray-100 pr-2
                                            ${
                                              selectedParentNode ===
                                              node.internal_node_id
                                                ? "bg-blue-100 border border-blue-300 text-blue-800"
                                                : "hover:bg-gray-100 border rounded-md"
                                            }`}
                          >
                            <button
                              type="button"
                              onClick={() =>
                                handleNodeSelect(node.internal_node_id)
                              }
                              className={`block text-left  w-full py-2 px-3 rounded-md mb-2 transition-colors ${
                                selectedParentNode === node.internal_node_id
                                  ? "text-blue-800"
                                  : "hover:bg-gray-100"
                              }`}
                            >
                              <div className="flex w-full items-center text-sm text-[#094C81] font-medium">
                                <span className="mr-2 mt-0.5">
                                  <GitForkIcon className="w-4 h-4" />
                                </span>
                                <div className="flex-1">
                                  <div className="font-medium">{node.name}</div>
                                  {node.description && (
                                    <div className="text-sm text-gray-600 truncate">
                                      {node.description}
                                    </div>
                                  )}
                                  <div className="text-xs text-gray-500 mt-1">
                                    Level {node.level} •{" "}
                                    {node.children?.length || 0} children
                                  </div>
                                </div>
                              </div>
                            </button>
                            <div className="flex justify-center items-center">
                              {selectedParentNode === node.internal_node_id && (
                                <CheckCircleIcon className="w-5 h-5 text-green-800 mr-2" />
                              )}
                              {node.children && node.children.length > 0 && (
                                <button
                                  type="button"
                                  onClick={() => enterStructure(node)}
                                  className="bg-transparent border-none opacity-70 group-hover:opacity-100 transition-opacity ml-2"
                                  title={`Explore ${node.name} structure`}
                                >
                                  <ArrowRightIcon className="w-6 h-6 hover:text-[#094C81]" />
                                </button>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Selected Selections Summary */}
        {(selectedMetric || selectedUser || selectedParentNode) && (
          <div className="mt-4 p-4 bg-gray-50 rounded-md border">
            <h4 className="text-sm font-semibold text-[#094C81] mb-2">
              Selection Summary:
            </h4>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium">Human Resource:</span>
                <div className="text-gray-600">
                  {selectedMetric
                    ? getSelectedMetricDetails()?.name
                    : "Not selected"}
                </div>
              </div>
              <div>
                <span className="font-medium">User:</span>
                <div className="text-gray-600">
                  {selectedUser
                    ? metricUsers.find((u: any) => u.user_id === selectedUser)
                        ?.full_name
                    : "Not selected"}
                </div>
              </div>
              <div>
                <span className="font-medium">Structure:</span>
                <div className="text-gray-600">
                  {selectedParentNodeName ?? "Not selected"}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Assign Button */}
        <div className="flex justify-end mt-4">
          <Button
            onClick={handleAssign}
            disabled={!selectedMetric || !selectedUser}
            className="bg-[#094C81] hover:bg-[#094C81]/90 text-white disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Assign User
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
