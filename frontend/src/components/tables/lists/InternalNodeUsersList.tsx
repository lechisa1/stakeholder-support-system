"use client";

import React, { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";

import { Button } from "../../ui/cn/button";
import { PageLayout } from "../../common/PageLayout";
import { DataTable } from "../../common/CommonTable";
import { ActionButton, FilterField } from "../../../types/layout";

import { useRemoveUserFromProjectMutation } from "../../../redux/services/projectApi";
import AssignUserModal from "../../modals/AssignUserToProjectModal";
import { useGetUsersByInternalNodeIdQuery } from "../../../redux/services/userApi";

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

// =======================
// COMPONENT
// =======================
export default function InternalNodeUsersList({
  projectId,
  internal_node_id,
  internal_node_name,
}: Props) {
  const [response, setResponse] = useState<any[]>([]);
  const [filteredResponse, setFilteredResponse] = useState<any[]>([]);
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [isModalOpen, setModalOpen] = useState(false);

  const [pageDetail, setPageDetail] = useState({
    pageIndex: 0,
    pageCount: 1,
    pageSize: 10,
  });

  const { data, isLoading, isError } = useGetUsersByInternalNodeIdQuery(
    {
      project_id: projectId,
      internal_node_id,
    },
    {
      skip: !projectId || !internal_node_id,
    }
  );

  const actions: ActionButton[] = [
    {
      label: "Assign User",
      icon: <Plus className="h-4 w-4" />,
      variant: "default",
      size: "default",
      onClick: () => setModalOpen(true),
    },
  ];
  // Filters
  const filterFields: FilterField[] = [
    {
      key: "role",
      label: "Role",
      type: "text",
      placeholder: "Search by role",
      value: roleFilter,
      onChange: (value: string | string[]) => {
        setRoleFilter(value as string);
        setPageDetail({ ...pageDetail, pageIndex: 0 });
      },
    },
  ];

  // Load initial data
  useEffect(() => {
    if (!isLoading && !isError && data?.data) {
      setResponse(data.data);
      setFilteredResponse(data.data);
    }
  }, [data, isLoading, isError]);

  // Apply filters
  useEffect(() => {
    const filtered = response.filter((item) => {
      if (roleFilter === "all" || roleFilter === "") return true;
      return item.role?.name?.toLowerCase().includes(roleFilter.toLowerCase());
    });

    setFilteredResponse(filtered);
  }, [roleFilter, response]);

  // Apply pagination
  const paginatedData = React.useMemo(() => {
    const start = pageDetail.pageIndex * pageDetail.pageSize;
    const end = start + pageDetail.pageSize;

    // Compute page count dynamically
    const totalCount = filteredResponse.length;
    const pageCount = Math.ceil(totalCount / pageDetail.pageSize);

    // update pageCount state
    if (pageCount !== pageDetail.pageCount) {
      setPageDetail((prev) => ({ ...prev, pageCount }));
    }

    return filteredResponse.slice(start, end);
  }, [filteredResponse, pageDetail.pageIndex, pageDetail.pageSize]);

  const handlePagination = (index: number, size: number) => {
    setPageDetail({
      ...pageDetail,
      pageIndex: index,
      pageSize: size,
    });
  };

  return (
    <PageLayout
      filters={filterFields}
      filterColumnsPerRow={1}
      actions={actions}
      title=" Users List in Structure"
      description="List of all users in the structure"
    >
      <DataTable
        columns={columns}
        data={paginatedData}
        handlePagination={handlePagination}
        tablePageSize={pageDetail.pageSize}
        totalPageCount={pageDetail.pageCount}
        currentIndex={pageDetail.pageIndex}
      />
      {/* <AssignUserModal
        inistitute_id={inistitute_id}
        project_id={projectId}
        internal_node_id={internal_node_id}
        internal_node_name={internal_node_name}
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
      /> */}
    </PageLayout>
  );
}
