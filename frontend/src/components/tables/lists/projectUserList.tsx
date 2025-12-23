"use client";

import { useEffect, useState } from "react";

import { useDeleteHierarchyNodeMutation } from "../../../redux/services/hierarchyNodeApi";

import { PageLayout } from "../../common/PageLayout";
import { DataTable } from "../../common/CommonTable";
import { ActionButton, FilterField } from "../../../types/layout";
import { useGetUsersAssignedToProjectQuery } from "../../../redux/services/userApi";

// ------------------- Table Columns -------------------
const ProjectUserTableColumns = () => [
  {
    accessorKey: "user.full_name",
    header: "Full Name",
    cell: ({ row }: any) => (
      <div className="font-medium text-blue-600">
        {row.original.user?.full_name || "N/A"}
      </div>
    ),
  },
  {
    accessorKey: "user.email",
    header: "Email",
    cell: ({ row }: any) => <div>{row.original.user?.email || "N/A"}</div>,
  },
  {
    accessorKey: "role.name",
    header: "Role",
    cell: ({ row }: any) => (
      <div className="font-medium text-gray-700">
        {row.original.role?.name || "N/A"}
      </div>
    ),
  },
  {
    accessorKey: "hierarchyNode.name",
    header: "Assigned Structure",
    cell: ({ row }: any) => (
      <div>{row.original.hierarchyNode?.name || "N/A"}</div>
    ),
  },
  {
    accessorKey: "is_active",
    header: "Status",
    cell: ({ row }: any) => {
      const isActive = row.getValue("is_active");
      return (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}
        >
          {isActive ? "Active" : "Inactive"}
        </span>
      );
    },
  },
];

interface ProjectUserListProps {
  project_id: string;
  toggleActions?: ActionButton[];
}

// ------------------- Component -------------------
export default function ProjectUserList({
  project_id,
  toggleActions,
}: ProjectUserListProps) {
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [pageDetail, setPageDetail] = useState({
    pageIndex: 0,
    pageCount: 1,
    pageSize: 10,
  });

  const { data, isLoading, isError } = useGetUsersAssignedToProjectQuery(
    project_id,
    {
      skip: !project_id,
    }
  );

  const filterFields: FilterField[] = [
    {
      key: "status",
      label: "Status",
      type: "multiselect",
      options: [
        { label: "Active", value: "ACTIVE" },
        { label: "Inactive", value: "INACTIVE" },
      ],
      value: statusFilter,
      onChange: (value: string | string[]) => {
        setStatusFilter(Array.isArray(value) ? value[0] : value);
        setPageDetail({ ...pageDetail, pageIndex: 0 });
      },
    },
  ];

  useEffect(() => {
    if (!isError && !isLoading && data) {
      // Access the data array from the response
      const userAssignments = data.data || [];
      setUsers(userAssignments);
      setFilteredUsers(userAssignments);

      // Update pagination info based on response count
      if (data.count) {
        setPageDetail((prev) => ({
          ...prev,
          pageCount: Math.ceil(data.count / prev.pageSize),
        }));
      }
    }
  }, [data, isError, isLoading]);

  useEffect(() => {
    const filtered = users.filter((item) => {
      if (!statusFilter || statusFilter === "all") return true;
      if (statusFilter === "ACTIVE") return item.is_active;
      if (statusFilter === "INACTIVE") return !item.is_active;
      return true;
    });
    setFilteredUsers(filtered);
  }, [users, statusFilter]);

  const handlePagination = (index: number, size: number) => {
    setPageDetail({ ...pageDetail, pageIndex: index, pageSize: size });
  };

  return (
    <>
      <PageLayout
        filters={filterFields}
        filterColumnsPerRow={1}
        toggleActions={toggleActions}
      >
        <DataTable
          columns={ProjectUserTableColumns()}
          data={filteredUsers}
          handlePagination={handlePagination}
          tablePageSize={pageDetail.pageSize}
          totalPageCount={pageDetail.pageCount}
          currentIndex={pageDetail.pageIndex}
        />
      </PageLayout>
    </>
  );
}
