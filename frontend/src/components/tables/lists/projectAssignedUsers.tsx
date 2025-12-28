"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Plus } from "lucide-react";

import {
  useDeleteHierarchyNodeMutation,
  useGetHierarchyNodesByProjectIdQuery,
} from "../../../redux/services/hierarchyNodeApi";

import { PageLayout } from "../../common/PageLayout";
import { DataTable } from "../../common/CommonTable";
import { ActionButton, FilterField } from "../../../types/layout";
import { useGetInternalUsersAssignedToProjectQuery } from "../../../redux/services/userApi";
import AssignInternalUsersModal from "../../modals/AssignInternalUsersToProjectModal";

// ------------------- Table Columns -------------------
const ProjectUserTableColumns = (deleteUser: any) => [
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
    accessorKey: "internalNode.name",
    header: "Level",
    cell: ({ row }: any) => (
      <div>{row.original.internalNode?.name || "N/A"}</div>
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
export default function ProjectAssignedUsers({
  project_id,
  toggleActions,
}: ProjectUserListProps) {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") || "";

  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isModalOpen, setModalOpen] = useState(false);
  const [pageDetail, setPageDetail] = useState({
    pageIndex: 0,
    pageCount: 1,
    pageSize: 10,
  });

  // Use the new RTK query with search and pagination parameters
  const { data, isLoading, isError, refetch } =
    useGetInternalUsersAssignedToProjectQuery(
      {
        project_id,
        search: searchQuery,
        page: pageDetail.pageIndex + 1,
        pageSize: pageDetail.pageSize,
      },
      {
        skip: !project_id,
      }
    );

  // Refetch when search or pagination changes
  useEffect(() => {
    if (project_id) {
      refetch();
    }
  }, [
    searchQuery,
    pageDetail.pageIndex,
    pageDetail.pageSize,
    project_id,
    refetch,
  ]);

  const [deleteUserAssignment] = useDeleteHierarchyNodeMutation();
  const [toggleView, setToggleView] = useState("table");

  const actions: ActionButton[] = [
    {
      label: "Assign Users",
      icon: <Plus className="h-4 w-4" />,
      variant: "default",
      size: "default",
      onClick: () => setModalOpen(true),
    },
  ];

  const filterFields: FilterField[] = [
    {
      key: "status",
      label: "Status",
      type: "multiselect",
      options: [
        { label: "All", value: "all" },
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

      // Apply status filter to the server-side filtered data
      const filtered = userAssignments.filter((item) => {
        if (!statusFilter || statusFilter === "all") return true;
        if (statusFilter === "ACTIVE") return item.is_active;
        if (statusFilter === "INACTIVE") return !item.is_active;
        return true;
      });

      setFilteredUsers(filtered);

      // Update pagination info from API metadata
      if (data.meta) {
        setPageDetail((prev) => ({
          ...prev,
          pageCount: data.meta.totalPages || 1,
          pageSize: data.meta.pageSize || prev.pageSize,
        }));
      } else if (data.count) {
        // Fallback to count if meta is not available
        setPageDetail((prev) => ({
          ...prev,
          pageCount: Math.ceil(data.count / prev.pageSize),
        }));
      }
    }
  }, [data, isError, isLoading, statusFilter]);

  // Apply pagination to filtered users
  const paginatedData = filteredUsers.slice(
    pageDetail.pageIndex * pageDetail.pageSize,
    (pageDetail.pageIndex + 1) * pageDetail.pageSize
  );

  const handlePagination = (index: number, size: number) => {
    setPageDetail({ ...pageDetail, pageIndex: index, pageSize: size });
  };

  // Calculate page count based on filtered users
  const filteredPageCount = Math.ceil(
    filteredUsers.length / pageDetail.pageSize
  );

  return (
    <>
      <PageLayout
        filters={filterFields}
        filterColumnsPerRow={1}
        actions={actions}
        toggleActions={toggleActions}
        onToggle={(value: string) => setToggleView(value)}
      >
        {toggleView === "table" ? (
          <DataTable
            columns={ProjectUserTableColumns(deleteUserAssignment)}
            data={paginatedData}
            handlePagination={handlePagination}
            tablePageSize={pageDetail.pageSize}
            totalPageCount={filteredPageCount}
            currentIndex={pageDetail.pageIndex}
            isLoading={isLoading}
          />
        ) : (
          <div className="p-4">
            <p>User list visualization not implemented yet</p>
          </div>
        )}
        <AssignInternalUsersModal
          project_id={project_id}
          isOpen={isModalOpen}
          onClose={() => {
            setModalOpen(false);
            refetch(); // Refetch data after modal closes
          }}
        />
      </PageLayout>
    </>
  );
}
