"use client";

import React, { useEffect, useState } from "react";
import { Plus, Edit, Trash2, Eye } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "../../ui/cn/button";
import { PageLayout } from "../../common/PageLayout";
import { DataTable } from "../../common/CommonTable";
import { ActionButton, FilterField } from "../../../types/layout";
import DeleteModal from "../../common/DeleteModal";
import {
  useDeleteProjectMetricMutation,
  useGetProjectMetricsQuery,
} from "../../../redux/services/projectMetricApi";
import { CreateProjectMetricModal } from "../../modals/CreateProjectMetricModal";
import { useAuth } from "../../../contexts/AuthContext";
import { ComponentGuard } from "../../common/ComponentGuard";
import { EditHumanResourceModal } from "../../modals/EditProjectMetricModal";

export default function ProjectMetricsList() {
  const [response, setResponse] = useState<any[]>([]);
  const [filteredResponse, setFilteredResponse] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isModalOpen, setModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [editMetricId, setEditMetricId] = useState<string>("");

  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") || "";
  const [pageDetail, setPageDetail] = useState({
    pageIndex: 0,
    pageCount: 1,
    pageSize: 10,
  });
  const [deleteMetric, { isLoading: isDeleteLoading }] =
    useDeleteProjectMetricMutation();
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteMetricId, setDeleteMetricId] = useState<string>("");
  const { hasAnyPermission } = useAuth();
  const hasPermission = hasAnyPermission([
    "HUMAN_RESOURCES:UPDATE",
    "HUMAN_RESOURCES:DELETE",
  ]);

  // --- Table columns ---
  const metricColumns = [
    {
      accessorKey: "name",
      header: "Human Resource Name",
      cell: ({ row }: any) => (
        <div className="font-medium text-blue-600">{row.getValue("name")}</div>
      ),
    },
    {
      accessorKey: "is_active",
      header: "Status",
      cell: ({ row }: any) => {
        const isActive = row.getValue("is_active");

        return (
          <span
            className={`font-medium ${
              isActive ? "text-green-600" : "text-red-600"
            }`}
          >
            {isActive ? "Active" : "Inactive"}
          </span>
        );
      },
    },
    hasPermission && {
      id: "actions",
      header: "Actions",
      cell: ({ row }: any) => {
        const metric = row.original;

        return (
          <div className="flex items-center  space-x-2">
            <ComponentGuard permissions={["HUMAN_RESOURCES:UPDATE"]}>
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => {
                  setEditModalOpen(true);
                  setEditMetricId(metric.project_metric_id);
                }}
              >
                <Edit className="h-4 w-4" />
              </Button>
            </ComponentGuard>
            <ComponentGuard permissions={["HUMAN_RESOURCES:DELETE"]}>
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                onClick={() => {
                  setDeleteModalOpen(true);
                  setDeleteMetricId(metric.project_metric_id);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </ComponentGuard>
          </div>
        );
      },
    },
  ].filter(Boolean);

  const { data, isLoading, isError, refetch } = useGetProjectMetricsQuery({
    search: searchQuery,
    page: pageDetail.pageIndex + 1,
    pageSize: pageDetail.pageSize,
  });

  useEffect(() => {
    refetch();
  }, [searchQuery, pageDetail.pageIndex, pageDetail.pageSize, refetch]);

  const actions: ActionButton[] = [
    {
      label: "Create ",
      icon: <Plus className="h-4 w-4" />,
      variant: "default",
      size: "default",
      permissions: ["HUMAN_RESOURCES:CREATE"],
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

  // --- Convert API data to array ---
  useEffect(() => {
    if (!isError && !isLoading && data) {
      const metrics = Array.isArray(data) ? data : data.data || [];
      setResponse(metrics);

      const filtered = metrics.filter((metric) => {
        if (statusFilter === "all") return true;
        if (statusFilter === "active") return metric.is_active;
        if (statusFilter === "inactive") return !metric.is_active;
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

  return (
    <>
      <PageLayout
        filters={filterFields}
        filterColumnsPerRow={1}
        actions={actions}
        title="Human Resource List"
        description="List of all human resources"
      >
        <DataTable
          columns={metricColumns}
          data={filteredResponse}
          handlePagination={handlePagination}
          tablePageSize={pageDetail.pageSize}
          totalPageCount={pageDetail.pageCount}
          currentIndex={pageDetail.pageIndex}
          isLoading={isLoading}
        />
      </PageLayout>

      <CreateProjectMetricModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
      />

      <DeleteModal
        message="Are you sure you want to delete this Human Resource?"
        onCancel={() => setDeleteModalOpen(false)}
        onDelete={() => {
          deleteMetric(deleteMetricId).unwrap();
          setDeleteModalOpen(false);
        }}
        open={isDeleteModalOpen}
        isLoading={isDeleteLoading || isLoading}
      />
      <EditHumanResourceModal
        isOpen={isEditModalOpen}
        onClose={() => setEditModalOpen(false)}
        metricId={editMetricId}
      />
    </>
  );
}
