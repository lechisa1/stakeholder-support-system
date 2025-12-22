// Internally  assgined users to project
"use client";

import { useEffect, useState } from "react";

import {
  useDeleteHierarchyNodeMutation,
  useGetHierarchyNodesByProjectIdQuery,
} from "../../../redux/services/hierarchyNodeApi";

import { PageLayout } from "../../common/PageLayout";
import { DataTable } from "../../common/CommonTable";
import { ActionButton, FilterField } from "../../../types/layout";
import {
  useGetInternalUsersAssignedToProjectQuery,
  useGetUsersAssignedToProjectQuery,
} from "../../../redux/services/userApi";
import { Plus } from "lucide-react";
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
  //   {
  //     id: "actions",
  //     header: "Actions",
  //     cell: ({ row }: any) => {
  //       const userAssignment = row.original;

  //       const handleDelete = async () => {
  //         if (
  //           confirm(
  //             `Remove user "${userAssignment.user?.full_name}" from project?`
  //           )
  //         ) {
  //           try {
  //             // You'll need to implement this mutation or use an existing one
  //             await deleteUser(userAssignment.project_user_role_id).unwrap();
  //             toast.success("User removed from project successfully");
  //           } catch (err: any) {
  //             toast.error(
  //               err?.data?.message || "Error removing user from project"
  //             );
  //           }
  //         }
  //       };

  //       return (
  //         <div className="flex items-center space-x-2">
  //           <Button variant="outline" size="sm" className="h-8 w-8 p-0" asChild>
  //             <Link to={`/users/${userAssignment.user_id}`}>
  //               <Eye className="h-4 w-4" />
  //             </Link>
  //           </Button>
  //           {/* <Button variant="outline" size="sm" className="h-8 w-8 p-0" asChild>
  //             <Link to={`/users/${userAssignment.user_id}/edit`}>
  //               <Edit className="h-4 w-4" />
  //             </Link>
  //           </Button>
  //           <Button
  //             variant="outline"
  //             size="sm"
  //             className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
  //             onClick={handleDelete}
  //           >
  //             <Trash2 className="h-4 w-4" />
  //           </Button> */}
  //         </div>
  //       );
  //     },
  //   },
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
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isModalOpen, setModalOpen] = useState(false);
  const [pageDetail, setPageDetail] = useState({
    pageIndex: 0,
    pageCount: 1,
    pageSize: 10,
  });

  const { data, isLoading, isError } =
    useGetInternalUsersAssignedToProjectQuery(project_id, {
      skip: !project_id,
    });

  // You'll need to implement this mutation or use an existing one
  const [deleteUserAssignment] = useDeleteHierarchyNodeMutation(); // Replace with actual user assignment deletion mutation

  const [toggleView, setToggleView] = useState("table");

  const actions: ActionButton[] = [
    {
      label: "Assign Users",
      icon: <Plus className="h-4 w-4" />,
      variant: "default", // matches allowed type
      size: "default", // matches allowed type
      onClick: () => setModalOpen(true),
    },
  ];

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

  console.log("toggleView: ", toggleView);

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
            data={filteredUsers}
            handlePagination={handlePagination}
            tablePageSize={pageDetail.pageSize}
            totalPageCount={pageDetail.pageCount}
            currentIndex={pageDetail.pageIndex}
          />
        ) : (
          // You might want to create a different visualization for users
          // or keep the hierarchy tree if it makes sense for your use case
          <div className="p-4">
            <p>User list visualization not implemented yet</p>
          </div>
        )}
        <AssignInternalUsersModal
          project_id={project_id}
          isOpen={isModalOpen}
          onClose={() => setModalOpen(false)}
        />
      </PageLayout>
    </>
  );
}
