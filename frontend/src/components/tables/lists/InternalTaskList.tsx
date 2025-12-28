"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Eye } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";

import { useGetCurrentUserQuery } from "../../../redux/services/authApi";
import { Button } from "../../ui/cn/button";
import { PageLayout } from "../../common/PageLayout";
import { DataTable } from "../../common/CommonTable";
import { FilterField } from "../../../types/layout";

import { useIssuesQuery } from "../../../hooks/useIssueQuery";
import { formatStatus } from "../../../utils/statusFormatter";

const TaskTableColumns = [
  {
    accessorKey: "project.ticket_number",
    header: "Ticket Number",
    cell: ({ row }: any) => <div>{row.original.ticket_number || "N/A"}</div>,
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
    accessorKey: "project.name",
    header: "Project",
    cell: ({ row }: any) => row.original.project?.name || "N/A",
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
            <Link to={`/task_list/${issue.issue_id}`}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      );
    },
  },
];

export default function InternalTaskList() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [pageDetail, setPageDetail] = useState({
    pageIndex: 0,
    pageCount: 1,
    pageSize: 10,
  });

  const { data: loggedUser, isLoading: userLoading } = useGetCurrentUserQuery();
  const userId = loggedUser?.user?.user_id || "";
  const userInternalNode =
    loggedUser?.user?.internal_project_roles?.[0]?.internal_node;

  // CORRECTED: Use the hook which now accepts searchQuery from URL
  // The hook will pass searchQuery to the API
  const {
    data: issuesData,
    isLoading: issuesLoading,
    isError,
    error: errors,
  } = useIssuesQuery(
    userId,
    userInternalNode,
    pageDetail.pageIndex + 1,
    pageDetail.pageSize
  );

  // Extract issues and pagination data
  const allIssues = useMemo(() => {
    if (!issuesData) return [];

    // Check if it's the paginated response (has data property)
    if (issuesData.data && Array.isArray(issuesData.data)) {
      return issuesData.data;
    }

    // Check if it's the non-paginated array
    if (Array.isArray(issuesData)) {
      return issuesData;
    }

    // Check if it has issues property (for escalated issues)
    if (issuesData.issues && Array.isArray(issuesData.issues)) {
      return issuesData.issues;
    }

    return [];
  }, [issuesData]);

  // Get pagination metadata

  useEffect(() => {
    if (issuesData?.meta) {
      setPageDetail((prev) => ({
        ...prev,
        pageCount: issuesData.meta.totalPages,
      }));
    }
  }, [issuesData?.meta]);

  // Filter issues by status (client-side filtering)
  const filteredIssues = useMemo(() => {
    return allIssues.filter((issue) => {
      if (statusFilter === "all") return true;
      return issue.status === statusFilter;
    });
  }, [allIssues, statusFilter]);

  const handlePagination = (index: number, size: number) => {
    setPageDetail({
      ...pageDetail,
      pageIndex: index,
      pageSize: size,
    });
  };

  const filterFields: FilterField[] = [
    {
      key: "status",
      label: "Status",
      type: "multiselect",
      options: [
        { label: "All", value: "all" },
        { label: "Pending", value: "pending" },
        { label: "Resolved", value: "resolved" },
        { label: "Closed", value: "closed" },
      ],
      value: statusFilter,
      onChange: (value: string | string[]) => {
        const newStatus = Array.isArray(value) ? value[0] : value;
        setStatusFilter(newStatus);
        setPageDetail({ ...pageDetail, pageIndex: 0 });
      },
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
            {errors && (
              <div className="text-sm text-gray-600 mt-2">
                Error details: {JSON.stringify(errors)}
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
      title="Internal Task List"
      description="List of all internal tasks"
    >
      <DataTable
        columns={TaskTableColumns}
        data={filteredIssues}
        handlePagination={handlePagination}
        tablePageSize={pageDetail.pageSize}
        totalPageCount={pageDetail.pageCount}
        currentIndex={pageDetail.pageIndex}
        isLoading={issuesLoading}
      />
    </PageLayout>
  );
}
