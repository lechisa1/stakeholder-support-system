"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useGetInternalProjectSubNodeUsersQuery } from "../../redux/services/userApi";
import {
  useAssignIssueMutation,
  useGetAssignmentsByIssueIdQuery,
  useRemoveAssignmentByAssigneeAndIssueMutation,
} from "../../redux/services/issueAssignmentApi";

interface AssignmentPreviewProps {
  issue_id: string;
  project_id: string;
  assigned_by: string;
  internal_node_id: string;
  onClose?: () => void;
}

interface UserAssignment {
  internal_project_user_role_id: string;
  user_id: string;
  user: {
    user_id: string;
    full_name: string;
    email: string;
  };
  role: {
    role_id: string;
    name: string;
  };
  internalNode: {
    internal_node_id: string;
    name: string;
    level: number;
  };
}

interface Assignment {
  assignment_id: string;
  issue_id: string;
  assignee_id: string;
  assigned_by: string;
  assigned_at: string;
  status: string;
  remarks?: string;
  created_at: string;
  updated_at: string;
  assignee: any;
  assigner: any;
  attachments: any[];
}

export default function AssignmentPreview({
  issue_id,
  project_id,
  assigned_by,
  internal_node_id,
  onClose,
}: AssignmentPreviewProps) {
  const {
    data: usersData,
    isLoading: isLoadingUsers,
    isError,
  } = useGetInternalProjectSubNodeUsersQuery(
    { project_id, Internal_node_id: internal_node_id },
    { refetchOnMountOrArgChange: true }
  );

  const {
    data: assignments,
    isLoading: isLoadingAssignments,
    isError: assignmentsError,
  } = useGetAssignmentsByIssueIdQuery(issue_id, {
    refetchOnMountOrArgChange: true,
  });

  const [assignIssue, { isLoading: isAssigning }] = useAssignIssueMutation();
  const [removeAssignment, { isLoading: isRemoving }] =
    useRemoveAssignmentByAssigneeAndIssueMutation();

  const users: UserAssignment[] = usersData?.assignments || [];
  const assignmentList: Assignment[] = assignments || [];

  // Function to check if a user is already assigned
  const isUserAssigned = (userId: string): boolean => {
    return assignmentList.some(
      (assignment) => assignment.assignee_id === userId
    );
  };

  // Function to get assignment for a user (if assigned)
  const getUserAssignment = (userId: string): Assignment | undefined => {
    return assignmentList.find(
      (assignment) => assignment.assignee_id === userId
    );
  };

  const handleAssign = async (user: UserAssignment) => {
    try {
      await assignIssue({
        issue_id,
        assignee_id: user.user_id,
        assigned_by,
        remarks: `Assigned to ${user.user.full_name} from ${user.internalNode.name}`,
      }).unwrap();

      toast.success(`Successfully assigned to ${user.user.full_name}`);
    } catch (error) {
      console.error("Assignment error:", error);
      toast.error(`Failed to assign to ${user.user.full_name}`);
    }
  };

  const handleRemove = async (user: UserAssignment) => {
    try {
      await removeAssignment({
        issue_id,
        assignee_id: user.user_id,
        data: {
          removed_by: assigned_by,
          reason: `Removed assignment for ${user.user.full_name}`,
        },
      }).unwrap();

      toast.success(`Successfully removed ${user.user.full_name}`);
    } catch (error) {
      console.error("Removal error:", error);
      toast.error(`Failed to remove ${user.user.full_name}`);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      transition={{ duration: 0.35, ease: "easeInOut" }}
      className="absolute top-0 right-0 w-full lg:w-[360px] bg-white border-l border-[#D5E3EC] h-full flex flex-col shadow-xl"
    >
      {/* Header */}
      <div className="p-6 border-b border-[#D5E3EC] bg-gradient-to-r from-[#1E516A] to-[#2C6B8A]">
        <h2 className="text-xl font-bold text-white">Assign Users</h2>
        <p className="text-blue-100 text-sm mt-1">
          Select users to assign this issue
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Users List */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-[#1E516A] text-lg">
              Available Users
            </h3>
            <span className="text-sm text-gray-500 bg-blue-50 px-2 py-1 rounded">
              {users.length} users
            </span>
          </div>

          {isLoadingUsers || isLoadingAssignments ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1E516A]"></div>
            </div>
          ) : isError ? (
            <div className="text-center py-8 text-red-500">
              Failed to load users
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No users available for assignment
            </div>
          ) : (
            <div className="space-y-4">
              {users.map((userAssignment) => {
                const isAssigned = isUserAssigned(userAssignment.user_id);
                const userAssignmentData = getUserAssignment(
                  userAssignment.user_id
                );

                return (
                  <motion.div
                    key={userAssignment.internal_project_user_role_id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`bg-white rounded-lg border-2 transition-all duration-200 ${
                      isAssigned
                        ? "border-green-200 bg-green-50 shadow-md"
                        : "border-gray-200 shadow-md hover:shadow-lg"
                    }`}
                  >
                    <div className="p-2 w-full relative grid grid-cols-2">
                      {/* User Info */}
                      <div className="flex w-full justify-between items-start mb-3">
                        <div className="flex-1 w-full ">
                          <div className="flex items-center w-full justify-between gap-2">
                            <h4 className="font-semibold   text-gray-800">
                              {userAssignment.user.full_name}
                            </h4>
                            {isAssigned ? (
                              <span className="inline-block px-2 absolute right-3 top-3 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                                Assigned
                              </span>
                            ) : (
                              <span className="inline-block px-2 absolute right-3 top-3 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                                Not Assigned
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {userAssignment.user.email}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                              {userAssignment.role.name}
                            </span>
                            {/* <span className="inline-block px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                              {userAssignment.internalNode.name}
                            </span> */}
                          </div>
                          {/* {isAssigned && userAssignmentData && (
                            <div className="mt-2 text-xs text-gray-500">
                              <p>
                                Assigned on:{" "}
                                {new Date(
                                  userAssignmentData.assigned_at
                                ).toLocaleDateString()}
                              </p>
                              <p>
                                Status:{" "}
                                <span className="capitalize">
                                  {userAssignmentData.status}
                                </span>
                              </p>
                            </div>
                          )} */}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex justify-end items-end">
                      <div className="flex gap-2 border-t flex-col justify-center items-end h-fit border-gray-100">
                        {isAssigned ? (
                          <button
                            onClick={() => handleRemove(userAssignment)}
                            disabled={isRemoving}
                            className="flex-1   bg-red-100 text-red-700 py-2 px-3 rounded-md text-sm font-medium hover:bg-red-200 transition-colors duration-200 flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isRemoving ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                            ) : (
                              <>
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                  />
                                </svg>
                                Remove
                              </>
                            )}
                          </button>
                        ) : (
                          <button
                            onClick={() => handleAssign(userAssignment)}
                            disabled={isAssigning}
                            className="flex-1 bg-[#1E516A]   text-white py-2 px-3 rounded-md text-sm font-medium hover:bg-[#2C6B8A] transition-colors duration-200 flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isAssigning ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            ) : (
                              <>
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                  />
                                </svg>
                                Assign
                              </>
                            )}
                          </button>
                        )}
                      </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-6 border-t border-[#D5E3EC] bg-white">
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors duration-200"
          >
            Cancel
          </button>
        </div>
      </div>
    </motion.div>
  );
}
