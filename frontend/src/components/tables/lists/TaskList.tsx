"use client";

import React, { useState, useMemo } from "react";
import { Plus, Eye, Trash2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { useGetCurrentUserQuery } from "../../../redux/services/authApi";
import { Button } from "../../ui/cn/button";
import { PageLayout } from "../../common/PageLayout";
import { DataTable } from "../../common/CommonTable";
import { FilterField } from "../../../types/layout";
import { useMultipleIssuesQueries } from "../../../hooks/useMultipleIssuesQueries";
import { formatStatus } from "../../../utils/statusFormatter";

const TaskTableColumns = [
  {
    accessorKey: "project.ticket_number",
    header: "Ticket Number",
    cell: ({ row }: any) => <div>{row.original.ticket_number || "N/A"}</div>,
  },
  {
    accessorKey: "project.name",
    header: "Project",
    cell: ({ row }: any) => row.original.project?.name || "N/A",
  },
  {
    accessorKey: "priority.name",
    header: "Priority",
    cell: ({ row }: any) => row.original.priority?.name || "N/A",
  },
  {
    accessorKey: "category.name",
    header: "Category",
    cell: ({ row }: any) => row.original.category?.name || "N/A",
  },
  {
    accessorKey: "reporter.full_name",
    header: "Created By",
    cell: ({ row }: any) => row.original.reporter?.full_name || "N/A",
  },
  {
    accessorKey: "hierarchyNode.name",
    header: "Structure",
    cell: ({ row }: any) => row.original.hierarchyNode?.name || "N/A",
  },

  {
    accessorKey: "issue_occured_time",
    header: "Occurred Time",
    cell: ({ row }: any) =>
      row.original.issue_occured_time
        ? new Date(row.original.issue_occured_time).toLocaleString()
        : "N/A",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }: any) => {
      const status = row.getValue("status");
      let bgClass = "bg-gray-100 text-gray-800";
      if (status === "pending") bgClass = "bg-yellow-100 text-yellow-800";
      else if (status === "resolved") bgClass = "bg-green-100 text-green-800";
      else if (status === "closed") bgClass = "bg-red-100 text-red-800";

      return (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgClass}`}
        >
          {formatStatus(status) || "N/A"}
        </span>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }: any) => {
      const issue = row.original;
      return (
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" className="h-8 w-8 p-0" asChild>
            <Link to={`/task/${issue.issue_id}`}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
          {/* <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
            onClick={() => console.log("Delete issue:", issue.issue_id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button> */}
        </div>
      );
    },
  },
];

export default function TaskList() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [pageDetail, setPageDetail] = useState({
    pageIndex: 0,
    pageCount: 1,
    pageSize: 10,
  });

  const { data: loggedUser, isLoading: userLoading } = useGetCurrentUserQuery();
  const userId = loggedUser?.user?.user_id || "";

  // Map project-role pairs
  const projectHierarchyPairs = useMemo(
    () =>
      (loggedUser?.user?.project_roles || []).map((role) => ({
        project_id: role.project?.project_id!,
        hierarchy_node_id: role.hierarchy_node?.hierarchy_node_id || null,
      })),
    [loggedUser]
  );

  // Use custom hook to fetch all issues
  const {
    allIssues,
    isLoading: issuesLoading,
    isError,
    errors,
  } = useMultipleIssuesQueries(projectHierarchyPairs, userId);

  console.log("allIssues: ", allIssues);

  // Apply status filter
  // const filteredIssues = useMemo(() => {
  //   return allIssues.filter(
  //     (issue) => statusFilter === "all" || issue.status === statusFilter
  //   );
  // }, [allIssues, statusFilter]);

  const filteredIssues = useMemo(() => {
    const safeIssues = Array.isArray(allIssues?.issues)
      ? allIssues?.issues
      : [];
    return safeIssues.filter(
      (issue) => statusFilter === "all" || issue.status === statusFilter
    );
  }, [allIssues, statusFilter]);

  const filterFields: FilterField[] = [
    {
      key: "status",
      label: "Status",
      type: "multiselect",
      options: [
        { label: "Pending", value: "pending" },
        { label: "Resolved", value: "resolved" },
        { label: "Closed", value: "closed" },
      ],
      value: statusFilter,
      onChange: (value: string | string[]) =>
        setStatusFilter(Array.isArray(value) ? value[0] : value),
    },
  ];

  // Show loading state
  if (userLoading || issuesLoading) {
    return (
      <PageLayout>
        <div className="flex justify-center items-center h-64">
          <div>Loading tasks...</div>
        </div>
      </PageLayout>
    );
  }

  // Show error state
  if (isError) {
    return (
      <PageLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-red-600">
            Error loading tasks. Please try again.
            {errors.length > 0 && (
              <div className="text-sm text-gray-600 mt-2">
                {errors.map((error, index) => (
                  <div key={index}>Error: {JSON.stringify(error)}</div>
                ))}
              </div>
            )}
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      filters={filterFields}
      filterColumnsPerRow={1}
      title="Task List"
      description="List of all tasks"
    >
      <DataTable
        columns={TaskTableColumns}
        data={filteredIssues}
        handlePagination={(index, size) =>
          setPageDetail({ ...pageDetail, pageIndex: index, pageSize: size })
        }
        tablePageSize={pageDetail.pageSize}
        totalPageCount={pageDetail.pageCount}
        currentIndex={pageDetail.pageIndex}
      />
    </PageLayout>
  );
}
