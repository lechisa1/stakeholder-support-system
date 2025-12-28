"use client";

import { useEffect, useState } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "../../ui/cn/button";
import { PageLayout } from "../../common/PageLayout";
import { DataTable } from "../../common/CommonTable";
import { ActionButton, FilterField } from "../../../types/layout";
import {
  useGetIssuePrioritiesQuery,
  useDeleteIssuePriorityMutation,
} from "../../../redux/services/issuePriorityApi";
import { CreatePriorityModal } from "../../modals/CreatePriorityModal";
import DeleteModal from "../../common/DeleteModal";
import { EditPriorityModal } from "../../modals/EditPriorityModal";
import { ComponentGuard } from "../../common/ComponentGuard";
import { useAuth } from "../../../contexts/AuthContext";

export default function IssuePriorityList() {
  const [response, setResponse] = useState<any[]>([]);
  const [filteredResponse, setFilteredResponse] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isModalOpen, setModalOpen] = useState(false);

  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") || "";
  const [pageDetail, setPageDetail] = useState({
    pageIndex: 0,
    pageCount: 1,
    pageSize: 10,
  });
  const [deletePriority, { isLoading: isDeleteLoading }] =
    useDeleteIssuePriorityMutation();
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletePriorityId, setDeletePriorityId] = useState<string>("");
  const { hasAnyPermission } = useAuth();
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [editPriorityId, setEditPriorityId] = useState<string>("");
  const hasPermission = hasAnyPermission([
    "REQUEST_PRIORITIES:UPDATE",
    "REQUEST_PRIORITIES:DELETE",
  ]);

  // Helper function to format response time
  const formatResponseTime = (duration: number, unit: string) => {
    if (!duration) return "N/A";

    const unitMap: Record<string, string> = {
      hour: "hour(s)",
      day: "day(s)",
      week: "week(s)",
      month: "month(s)",
    };

    const formattedUnit = unitMap[unit] || unit;
    return `${duration} ${formattedUnit}`;
  };

  // --- Define table columns ---
  const PriorityTableColumns = [
    {
      accessorKey: "name",
      header: "Priority Name",
      cell: ({ row }: any) => (
        <div className="font-medium text-blue-600">{row.getValue("name")}</div>
      ),
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }: any) => (
        <div className="text-gray-600">
          {row.getValue("description") || "N/A"}
        </div>
      ),
    },
    {
      accessorKey: "color_value",
      header: "Color",
      cell: ({ row }: any) => {
        const color = row.getValue("color_value");
        return (
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded-full border border-gray-300"
              style={{ backgroundColor: color }}
            />
            <span className="text-sm text-gray-600">{color}</span>
          </div>
        );
      },
    },
    {
      id: "response_time",
      header: "Response Time",
      cell: ({ row }: any) => {
        const priority = row.original;
        return (
          <div className="font-medium">
            {formatResponseTime(
              priority.response_duration,
              priority.response_unit
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "is_active",
      header: "Escalate to Admin",
      cell: ({ row }: any) => (
        <div className="flex items-center">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              row.getValue("is_active")
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {row.getValue("is_active") ? "Active" : "Inactive"}
          </span>
        </div>
      ),
    },
    hasPermission && {
      id: "actions",
      header: "Actions",
      cell: ({ row }: any) => {
        const priority = row.original;

        return (
          <div className="flex items-center space-x-2">
            <ComponentGuard permissions={["REQUEST_PRIORITIES:UPDATE"]}>
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => {
                  setEditPriorityId(priority.priority_id);
                  setEditModalOpen(true);
                }}
              >
                <Edit className="h-4 w-4" />
              </Button>
            </ComponentGuard>
            <ComponentGuard permissions={["REQUEST_PRIORITIES:DELETE"]}>
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:border-red-300"
                onClick={() => {
                  setDeleteModalOpen(true);
                  setDeletePriorityId(priority.priority_id);
                }}
                disabled={!priority.is_active}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </ComponentGuard>
          </div>
        );
      },
    },
  ].filter(Boolean);

  const { data, isLoading, isError, refetch } = useGetIssuePrioritiesQuery({
    search: searchQuery,
    page: pageDetail.pageIndex + 1,
    pageSize: pageDetail.pageSize,
  });

  useEffect(() => {
    refetch();
  }, [searchQuery, pageDetail.pageIndex, pageDetail.pageSize, refetch]);

  const actions: ActionButton[] = [
    {
      label: "Create",
      icon: <Plus className="h-4 w-4" />,
      variant: "default",
      size: "default",
      permissions: ["REQUEST_PRIORITIES:CREATE"],
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

  // --- Convert API data to array ---
  useEffect(() => {
    if (!isError && !isLoading && data) {
      const priorities = Array.isArray(data) ? data : data.data || [];
      setResponse(priorities);

      const filtered = priorities.filter((priority) => {
        if (statusFilter === "all") return true;
        if (statusFilter === "active") return priority.is_active;
        if (statusFilter === "inactive") return !priority.is_active;
        return true;
      });
      setFilteredResponse(filtered);
      if (data.meta) {
        setPageDetail((prev) => ({
          ...prev,
          pageCount: data.meta.totalPages || 1,
        }));
      } else if (data.pageCount !== undefined) {
        setPageDetail((prev) => ({
          ...prev,
          pageCount: data.pageCount,
        }));
      }
    }
  }, [data, isError, isLoading, statusFilter]);

  useEffect(() => {
    const filtered = response.filter((item) => {
      if (!statusFilter || statusFilter === "all") return true;
      if (statusFilter === "ACTIVE") return item.is_active;
      if (statusFilter === "INACTIVE") return !item.is_active;
      return true;
    });
    setFilteredResponse(filtered);
  }, [response, statusFilter]);

  const handlePagination = (pageIndex: number, pageSize: number) => {
    setPageDetail((prev) => ({
      ...prev,
      pageIndex,
      pageSize,
    }));
  };

  const handleDelete = async () => {
    try {
      await deletePriority(deletePriorityId).unwrap();
      setDeleteModalOpen(false);
      // You might want to refetch data here or update local state
    } catch (error) {
      console.error("Failed to delete priority:", error);
    }
  };

  return (
    <>
      <PageLayout
        filters={filterFields}
        filterColumnsPerRow={1}
        actions={actions}
        title="Request Priority List"
        description="List of all request priorities with their response times"
      >
        <DataTable
          columns={PriorityTableColumns}
          data={filteredResponse}
          handlePagination={handlePagination}
          tablePageSize={pageDetail.pageSize}
          totalPageCount={pageDetail.pageCount}
          currentIndex={pageDetail.pageIndex}
          isLoading={isLoading}
        />
      </PageLayout>

      <CreatePriorityModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
      />
      {/* Uncomment when you have the EditPriorityModal component */}
      {/* <EditPriorityModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setEditPriorityId("");
        }}
        priorityId={editPriorityId}
      /> */}
      <DeleteModal
        message="Are you sure you want to delete this priority?"
        onCancel={() => setDeleteModalOpen(false)}
        onDelete={handleDelete}
        open={isDeleteModalOpen}
        isLoading={isDeleteLoading}
      />
      <EditPriorityModal
        isOpen={isEditModalOpen}
        priorityId={editPriorityId}
        onClose={() => {
          setEditModalOpen(false);
          setEditPriorityId("");
        }}
      />
    </>
  );
}
