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
  useGetProjectProjectMetricsQuery,
  useGetMetricUsersQuery,
} from "../../redux/services/projectMetricApi";

interface AssignUserModalProps {
  parent_node_id?: string;
  project_id: string;
  parent_node_name?: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function AssignInternalUsersModal({
  parent_node_id,
  project_id,
  parent_node_name,
  isOpen,
  onClose,
}: AssignUserModalProps) {
  const [selectedMetric, setSelectedMetric] = useState("");
  const [selectedUser, setSelectedUser] = useState("");

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

  const [assignUserToProject] = useAssignInternalUserToProjectMutation();

  const projectMetrics = projectMetricsData?.metrics || [];
  const metricUsers = metricUsersData?.assigned_users || [];

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
        internal_node_id: parent_node_id || "",
      }).unwrap();

      toast.success("User assigned successfully");

      // Reset form
      setSelectedMetric("");
      setSelectedUser("");

      onClose();
    } catch (err: unknown) {
      toast.error(err?.data?.message || "Failed to assign user");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[500px] bg-white max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader>
          <DialogTitle className="text-[#094C81]">
            Assign User 
          </DialogTitle>
        </DialogHeader>

        {/* LEFT SIDE — METRIC AND USER SELECTION */}
        <div className="flex w-full mt-5  flex-col gap-4">
          {/* PROJECT METRIC SELECTION */}
          <div className="w-full">
            <Label className="block text-sm text-[#094C81] font-medium mb-2">
              Select Project Human Resource
            </Label>

            <Select value={selectedMetric} onValueChange={handleMetricChange}>
              <SelectTrigger className="h-12 w-[450px] border border-gray-300 px-4 py-3 rounded-md focus:ring focus:ring-[#094C81] focus:border-transparent transition-all duration-200 outline-none">
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
              <SelectTrigger className="h-12 w-[450px] border border-gray-300 px-4 py-3 rounded-md focus:ring focus:ring-[#094C81] focus:border-transparent transition-all duration-200 outline-none">
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

        {/* Assign Button */}
        <div className="flex justify-end mt-4">
          <Button
            onClick={handleAssign}
            disabled={!selectedMetric || !selectedUser}
            className="bg-[#094C81] hover:bg-[#094C81]/90 text-white disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Assign 
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
