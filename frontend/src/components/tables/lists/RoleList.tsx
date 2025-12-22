"use client";

import { useEffect, useState } from "react";
import { Plus, Eye } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import {
  useGetRolesQuery,
  useDeleteRoleMutation,
} from "../../../redux/services/roleApi";
import { Button } from "../../ui/cn/button";
import { PageLayout } from "../../common/PageLayout";
import { DataTable } from "../../common/CommonTable";
import { ActionButton, FilterField } from "../../../types/layout";

const RoleTableColumns = (handleDelete: (id: string) => void) => [
  {
    accessorKey: "name",
    header: "Role Name",
    cell: ({ row }: any) => (
      <div className="font-medium text-blue-600">{row.getValue("name")}</div>
    ),
  },
  {
    accessorKey: "role_type",
    header: "Type",
    cell: ({ row }: any) => <div>{row.getValue("role_type") || "N/A"}</div>,
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }: any) => <div>{row.getValue("description") || "N/A"}</div>,
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
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }: any) => {
      const role = row.original;
      return (
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" className="h-8 w-8 p-0" asChild>
            <Link to={`/role/${role.role_id}`}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
          {/* <Button variant="outline" size="sm" className="h-8 w-8 p-0" asChild>
            <Link to={`/role/${role.role_id}`}>
              <Edit className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
            onClick={() => handleDelete(role.role_id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button> */}
        </div>
      );
    },
  },
];

export default function RoleList() {
  const [response, setResponse] = useState<any[]>([]);
  const [filteredResponse, setFilteredResponse] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const navigate = useNavigate();
  const [pageDetail, setPageDetail] = useState({
    pageIndex: 0,
    pageCount: 1,
    pageSize: 10,
  });

  const { data, isLoading, isError } = useGetRolesQuery(undefined);
  const [deleteRole] = useDeleteRoleMutation();

  const handleDelete = async (id: string) => {
    try {
      await deleteRole(id).unwrap();
      toast.success("Role deleted successfully");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete role");
    }
  };

  const actions: ActionButton[] = [
    {
      label: "Create Role",
      icon: <Plus className="h-4 w-4" />,
      variant: "default",
      size: "default",
      onClick: () => {
        navigate("/role/create");
      },
      permissions: ["ROLES:CREATE"],
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
      const roles = Array.isArray(data) ? data : data?.data || [];
      setResponse(roles);
      setFilteredResponse(roles);
    }
  }, [data, isError, isLoading]);

  useEffect(() => {
    const filtered = response.filter((item) => {
      if (!statusFilter || statusFilter === "all") return true;
      if (statusFilter === "ACTIVE") return item.is_active;
      if (statusFilter === "INACTIVE") return !item.is_active;
      return true;
    });
    setFilteredResponse(filtered);
  }, [response, statusFilter]);

  const handlePagination = (index: number, size: number) => {
    setPageDetail({
      ...pageDetail,
      pageIndex: index,
      pageSize: size,
    });
  };

  return (
    <>
      {/* <DetailHeader className="mb-5 mt-2" breadcrumbs={[{ title: "Roles", link: "" }]} /> */}

      <PageLayout
        filters={filterFields}
        filterColumnsPerRow={1}
        actions={actions}
        title="Role List"
        description="List of all roles"
      >
        <DataTable
          columns={RoleTableColumns(handleDelete)}
          data={filteredResponse}
          handlePagination={handlePagination}
          tablePageSize={pageDetail.pageSize}
          totalPageCount={pageDetail.pageCount}
          currentIndex={pageDetail.pageIndex}
        />
      </PageLayout>
    </>
  );
}
