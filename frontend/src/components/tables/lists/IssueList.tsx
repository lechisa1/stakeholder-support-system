"use client";

import React, { useEffect, useState } from "react";
import { Plus, Eye, Edit, Trash2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import {
  useGetIssuesByUserIdQuery,
  useGetIssuesQuery,
} from "../../../redux/services/issueApi";
import { Button } from "../../ui/cn/button";
import { PageLayout } from "../../common/PageLayout";
import { DataTable } from "../../common/CommonTable";
import { ActionButton, FilterField } from "../../../types/layout";
import { useGetCurrentUserQuery } from "../../../redux/services/authApi";
import { formatStatus } from "../../../utils/statusFormatter";

// --- Define table columns ---
// ticket_number
const IssueTableColumns = [
  {
    accessorKey: "project.ticket_number",
    header: "Ticket Number",
    cell: ({ row }: any) => <div>{row.original.ticket_number || "N/A"}</div>,
  },
  {
    accessorKey: "project.name",
    header: "Project",
    cell: ({ row }: any) => <div>{row.original.project?.name || "N/A"}</div>,
  },
  {
    accessorKey: "category.name",
    header: "Category",
    cell: ({ row }: any) => <div>{row.original.category?.name || "N/A"}</div>,
  },
  {
    accessorKey: "priority.name",
    header: "Priority",
    cell: ({ row }: any) => <div>{row.original.priority?.name || "N/A"}</div>,
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
            <Link to={`/issue/${issue.issue_id}`}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
          {/* <Button variant="outline" size="sm" className="h-8 w-8 p-0" asChild>
            <Link to={`/issues/edit/${issue.issue_id}`}>
              <Edit className="h-4 w-4" />
            </Link>
          </Button>
          <Button
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

export default function IssueList() {
  const navigate = useNavigate();
  const [response, setResponse] = useState<any[]>([]);
  const [filteredResponse, setFilteredResponse] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [pageDetail, setPageDetail] = useState({
    pageIndex: 0,
    pageCount: 1,
    pageSize: 10,
  });

  const { data: loggedUser, isLoading: userLoading } = useGetCurrentUserQuery();

  const actions: ActionButton[] = [
    {
      label: "Create Support Request",
      icon: <Plus className="h-4 w-4" />,
      variant: "default",
      size: "default",
      onClick: () => navigate("/add_issue"),
    },
  ];

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
      onChange: (value: string | string[]) => {
        setStatusFilter(Array.isArray(value) ? value[0] : value);
        setPageDetail({ ...pageDetail, pageIndex: 0 });
      },
    },
  ];

  const { isLoading, isError, data } = useGetIssuesByUserIdQuery(
    loggedUser?.user?.user_id ?? "",
    {
      skip: !loggedUser?.user?.user_id,
    }
  );

  useEffect(() => {
    if (!isError && !isLoading && data) {
      setResponse(data);
      setFilteredResponse(data);
    }
  }, [data, isError, isLoading]);

  // Apply status filter
  useEffect(() => {
    const filtered = response.filter((item) => {
      if (!statusFilter || statusFilter === "all") return true;
      return item.status === statusFilter;
    });
    setFilteredResponse(filtered);
  }, [response, statusFilter]);

  const handlePagination = (index: number, size: number) => {
    setPageDetail({ ...pageDetail, pageIndex: index, pageSize: size });
  };

  return (
    <PageLayout
      filters={filterFields}
      filterColumnsPerRow={1}
      actions={actions}
      title="Issue List"
      description="List of all issues"
    >
      <DataTable
        columns={IssueTableColumns}
        data={filteredResponse}
        handlePagination={handlePagination}
        tablePageSize={pageDetail.pageSize}
        totalPageCount={pageDetail.pageCount}
        currentIndex={pageDetail.pageIndex}
      />
    </PageLayout>
  );
}
