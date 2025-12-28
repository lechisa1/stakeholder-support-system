"use client";

import React, { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useSearchParams } from "react-router-dom";

import { Button } from "../../ui/cn/button";
import { PageLayout } from "../../common/PageLayout";
import { DataTable } from "../../common/CommonTable";
import { ActionButton, FilterField } from "../../../types/layout";

import { useRemoveUserFromProjectMutation } from "../../../redux/services/projectApi";
import AssignUserModal from "../../modals/AssignUserToProjectModal";
import { useGetUsersByInternalNodeIdQuery } from "../../../redux/services/userApi";
import AssignInternalUsersModal from "../../modals/AssignInternalUsersToProjectHierarchyModal";

// =======================
// TABLE COLUMNS
// =======================
const columns = [
  {
    accessorKey: "user.full_name",
    header: "User",
    cell: ({ row }: any) => (
      <div className="font-medium text-blue-600">
        {row.original.user?.full_name}
      </div>
    ),
  },
  {
    accessorKey: "user.email",
    header: "Email",
    cell: ({ row }: any) => <div>{row.original.user?.email}</div>,
  },
  {
    accessorKey: "role.name",
    header: "Role",
    cell: ({ row }: any) => row.original.role?.name,
  },
  {
    accessorKey: "internalNode.name",
    header: "Structure",
    cell: ({ row }: any) =>
      row.original.internalNode?.name || (
        <span className="text-gray-400">-</span>
      ),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }: any) => {
      const item = row.original;
      const [removeAssignment] = useRemoveUserFromProjectMutation();

      return (
        <Button
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
          onClick={() => {
            if (confirm("Remove this assignment?")) {
              removeAssignment({
                project_id: item.project_id,
                user_id: item.user_id,
              });
            }
          }}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      );
    },
  },
];

interface Props {
  projectId: string;
  internal_node_id: string;
  internal_node_name: string;
}

export default function InternalNodeUsersListConfig({
  projectId,
  internal_node_id,
  internal_node_name,
}: Props) {
  const [response, setResponse] = useState<any[]>([]);
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") || "";
  const [pageDetail, setPageDetail] = useState({
    pageIndex: 0,
    pageCount: 1,
    pageSize: 10,
  });
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [isModalOpen, setModalOpen] = useState(false);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  // Use the API query with search functionality
  const { data, isLoading, isError, refetch } =
    useGetUsersByInternalNodeIdQuery(
      {
        project_id: projectId,
        internal_node_id,
        search: searchQuery,
        page: pageDetail.pageIndex + 1,
        pageSize: pageDetail.pageSize,
      },
      {
        skip: !projectId || !internal_node_id,
      }
    );

  // Refetch when search query or pagination changes
  useEffect(() => {
    if (projectId && internal_node_id) {
      refetch();
    }
  }, [
    searchQuery,
    pageDetail.pageIndex,
    pageDetail.pageSize,
    projectId,
    internal_node_id,
    refetch,
  ]);

  const actions: ActionButton[] = [
    {
      label: "Assign User",
      icon: <Plus className="h-4 w-4" />,
      variant: "default",
      size: "default",
      onClick: () => setModalOpen(true),
    },
  ];

  // Filters - Note: The search is now handled through URL params like in IssueFlowList
  const filterFields: FilterField[] = [
    {
      key: "role",
      label: "Role",
      type: "text",
      placeholder: "Search by role name",
      value: roleFilter,
      onChange: (value: string | string[]) => {
        const newRoleFilter = Array.isArray(value) ? value[0] : value;
        setRoleFilter(newRoleFilter);
        setPageDetail({ ...pageDetail, pageIndex: 0 });
      },
    },
  ];

  // --- Convert API data to array ---
  useEffect(() => {
    if (!isError && !isLoading && data) {
      // Directly use the data from API (already server-side filtered by search)
      const users = Array.isArray(data) ? data : data.data || [];
      setResponse(users);

      // Apply role filter client-side if needed
      const filtered = users.filter((item) => {
        if (roleFilter === "all" || roleFilter === "") return true;
        return item.role?.name
          ?.toLowerCase()
          .includes(roleFilter.toLowerCase());
      });

      // Update pagination info from API metadata
      if (data.meta) {
        setPageDetail((prev) => ({
          ...prev,
          pageCount: data.meta.totalPages || 1,
          pageSize: data.meta.pageSize || prev.pageSize,
        }));
      } else if (data.pageCount !== undefined) {
        setPageDetail((prev) => ({
          ...prev,
          pageCount: data.pageCount,
        }));
      }
    }
    setCurrentProjectId(localStorage.getItem("current_project_id") || null);
  }, [data, isError, isLoading, roleFilter]);

  // Apply pagination - server-side handled by API, client-side for role filter
  const paginatedData = React.useMemo(() => {
    // If role filter is "all" or empty, use all response data
    if (roleFilter === "all" || roleFilter === "") {
      return response;
    }

    // Apply role filter client-side
    const filtered = response.filter((item) =>
      item.role?.name?.toLowerCase().includes(roleFilter.toLowerCase())
    );

    return filtered;
  }, [response, roleFilter]);

  const handlePagination = (pageIndex: number, pageSize: number) => {
    setPageDetail((prev) => ({
      ...prev,
      pageIndex,
      pageSize,
    }));
  };
  return (
    <PageLayout
      filters={filterFields}
      filterColumnsPerRow={1}
      actions={ currentProjectId ? actions : [] }
      title="Assigned Users"
      description={`Users assigned to ${internal_node_name}`}
    >
      <DataTable
        columns={columns}
        data={paginatedData}
        handlePagination={handlePagination}
        tablePageSize={pageDetail.pageSize}
        totalPageCount={pageDetail.pageCount}
        currentIndex={pageDetail.pageIndex}
        isLoading={isLoading}
      />

      <AssignInternalUsersModal
        project_id={projectId}
        parent_node_id={internal_node_id}
        parent_node_name={internal_node_name}
          isOpen={isModalOpen}
          onClose={() => setModalOpen(false)}
        />
    </PageLayout>
  );
}
