"use client";

import React, { useState, useEffect } from "react";
import { Plus, Eye, Edit, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "../../ui/cn/button";
import { PageLayout } from "../../common/PageLayout";
import { DataTable } from "../../common/CommonTable";
import { ActionButton, FilterField } from "../../../types/layout";
import { CreateUserModal } from "../../modals/CreateUserModal";

import {
  useGetUsersQuery,
  useDeleteUserMutation,
  User,
} from "../../../redux/services/userApi";
import { useAuth } from "../../../contexts/AuthContext";
import { getUserPositionId } from "../../../utils/helper/userPosition";

interface UserListProps {
  user_type?: string;
  logged_user_type?: string;
  user_type_id?: string;
  user_position_id?: string;
  inistitute_id?: string;
  toggleActions?: ActionButton[];
}

export default function UserList({
  user_type,
  logged_user_type,
  user_type_id,
  user_position_id,
  inistitute_id,
  toggleActions,
}: UserListProps) {
  // --- Define table columns ---
  const UserTableColumns = [
    {
      accessorKey: "full_name",
      header: "Full Name",
      cell: ({ row }: any) => (
        <div className="font-medium text-blue-600">
          {row.getValue("full_name")}
        </div>
      ),
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }: any) => <div>{row.getValue("email")}</div>,
    },
    {
      accessorKey: "phone_number",
      header: "Phone Number",
      cell: ({ row }: any) => <div>{row.getValue("phone_number")}</div>,
    },
    logged_user_type !== "external_user" &&
      user_type === "external_user" && {
        accessorKey: "institute.name", // ✅ Access nested userType name
        header: "Institute",
        cell: ({ row }: any) => {
          const inst = row.original.institute?.name || "N/A";
          return (
            <span className={`px-2 py-1 text-xs font-semibold rounded-full`}>
              {inst.replace("_", " ")}
            </span>
          );
        },
      },
    {
      accessorKey: "is_active",
      header: "Status",
      cell: ({ row }: any) => {
        const isActive = row.getValue("is_active");
        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              isActive
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {isActive ? "Active" : "Inactive"}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: any) => {
        const user = row.original as User;
        const [deleteUser] = useDeleteUserMutation();

        const handleDelete = async () => {
          try {
            await deleteUser(user.user_id).unwrap();
            toast.success("User deleted successfully!");
          } catch (err: any) {
            toast.error(err?.data?.message || "Failed to delete user");
          }
        };

        return (
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" className="h-8 w-8 p-0" asChild>
              <Link to={`/users/${user.user_id}`}>
                <Eye className="h-4 w-4" />
              </Link>
            </Button>
            {/* <Button variant="outline" size="sm" className="h-8 w-8 p-0" asChild>
            <Link to={`/users/${user.user_id}`}>
              <Edit className="h-4 w-4" />
            </Link>
          </Button> */}
            {/* <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4" />
          </Button> */}
          </div>
        );
      },
    },
  ].filter(Boolean);
  const { user } = useAuth();
  const positionId = getUserPositionId(logged_user_type, user_type, false);

  // user_position_id
  const { data, isLoading, isError } = useGetUsersQuery({
    institute_id: user?.institute?.institute_id || inistitute_id,
    user_position_id: user_position_id || positionId,
    user_type_id: user_type_id,
  });
  // useGetUsersByInstituteIdQuery
  const [response, setResponse] = useState<User[]>([]);
  const [filteredResponse, setFilteredResponse] = useState<User[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isModalOpen, setModalOpen] = useState(false);

  const [pageDetail, setPageDetail] = useState({
    pageIndex: 0,
    pageSize: 10,
    pageCount: 1,
  });

  // --- Convert API data to array ---
  useEffect(() => {
    if (!isError && !isLoading && data?.data) {
      setResponse(data.data);
      setFilteredResponse(data.data);
    }
  }, [data, isError, isLoading]);

  // --- Filter by status ---
  useEffect(() => {
    const filtered = response.filter((user) => {
      if (statusFilter === "all") return true;
      if (statusFilter === "active") return user.is_active;
      if (statusFilter === "inactive") return !user.is_active;
      return true;
    });
    setFilteredResponse(filtered);
  }, [response, statusFilter]);

  const handlePagination = (pageIndex: number, pageSize: number) => {
    setPageDetail({ ...pageDetail, pageIndex, pageSize });
  };

  const buttonLabel = toggleActions
    ? user_type === "internal_user"
      ? "Create Internal User"
      : "Create External User"
    : "Create User";
  const actions: ActionButton[] = [
    {
      label: buttonLabel,
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
        { label: "Active", value: "active" },
        { label: "Inactive", value: "inactive" },
      ],
      value: statusFilter,
      onChange: (val: string | string[]) => {
        setStatusFilter(Array.isArray(val) ? val[0] : val);
        setPageDetail({ ...pageDetail, pageIndex: 0 });
      },
    },
  ];

  return (
    <>
      <PageLayout
        filters={filterFields}
        filterColumnsPerRow={1}
        toggleActions={toggleActions}
        actions={actions}
      >
        <DataTable
          columns={UserTableColumns}
          data={filteredResponse}
          handlePagination={handlePagination}
          tablePageSize={pageDetail.pageSize}
          totalPageCount={pageDetail.pageCount}
          currentIndex={pageDetail.pageIndex}
        />
      </PageLayout>

      <CreateUserModal
        logged_user_type={logged_user_type || ""}
        user_type={user_type || "internal_user"}
        user_type_id={user_type_id || ""}
        inistitute_id={inistitute_id || ""}
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}
