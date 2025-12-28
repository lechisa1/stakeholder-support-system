"use client";

import { useEffect, useState } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import {
  useGetIssueCategoriesQuery,
  useDeleteIssueCategoryMutation,
} from "../../../redux/services/issueCategoryApi";
import { Button } from "../../ui/cn/button";
import { PageLayout } from "../../common/PageLayout";
import { DataTable } from "../../common/CommonTable";
import { ActionButton, FilterField } from "../../../types/layout";
import { CreateCategoryModal } from "../../modals/CreateCategoryModal";
import { EditCategoryModal } from "../../modals/EditCategoryModal";
import DeleteModal from "../../common/DeleteModal";
import type { IssueCategory } from "../../../redux/services/issueCategoryApi";

type IssueCategoryRow = IssueCategory & { is_active?: boolean };

export default function IssueCategoryList() {
  const [response, setResponse] = useState<IssueCategoryRow[]>([]);
  const [filteredResponse, setFilteredResponse] = useState<IssueCategoryRow[]>(
    []
  );
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isModalOpen, setModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] =
    useState<IssueCategory | null>(null);

  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") || "";
  const [pageDetail, setPageDetail] = useState({
    pageIndex: 0,
    pageCount: 1,
    pageSize: 10,
  });

  const { data, isLoading, isError, refetch } = useGetIssueCategoriesQuery({
    search: searchQuery,
    page: pageDetail.pageIndex + 1,
    pageSize: pageDetail.pageSize,
  });

  useEffect(() => {
    refetch();
  }, [searchQuery, pageDetail.pageIndex, pageDetail.pageSize, refetch]);

  const [deleteCategory, { isLoading: isDeleting }] =
    useDeleteIssueCategoryMutation();

  const actions: ActionButton[] = [
    {
      label: "Create",
      icon: <Plus className="h-4 w-4" />,
      variant: "default",
      size: "default",
      onClick: () => setModalOpen(true),
      permissions: ["REQUEST_CATEGORIES:CREATE"],
    },
  ];

  // No filters for first version
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
      const categories = Array.isArray(data) ? data : data.data || [];
      setResponse(categories);

      const filtered = categories.filter((category) => {
        if (statusFilter === "all") return true;
        if (statusFilter === "active") return category.is_active;
        if (statusFilter === "inactive") return !category.is_active;
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

  const handleDeleteClick = (categoryId: string) => {
    setPendingDeleteId(categoryId);
    setDeleteModalOpen(true);
  };

  const handleEditClick = (category: IssueCategoryRow) => {
    setSelectedCategory(category);
    setEditModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!pendingDeleteId) return;
    try {
      await deleteCategory(pendingDeleteId).unwrap();
    } finally {
      setDeleteModalOpen(false);
      setPendingDeleteId(null);
    }
  };

  const handleEditClose = () => {
    setEditModalOpen(false);
    setSelectedCategory(null);
  };

  const CategoryTableColumns = [
    {
      accessorKey: "name",
      header: "Category Name",
      cell: ({
        row,
      }: {
        row: { getValue: (key: string) => string; original: IssueCategoryRow };
      }) => (
        <div className="font-medium text-blue-600">{row.getValue("name")}</div>
      ),
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({
        row,
      }: {
        row: {
          getValue: (key: string) => string | null;
          original: IssueCategoryRow;
        };
      }) => <div>{row.getValue("description") || "N/A"}</div>,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: { row: { original: IssueCategory } }) => {
        const category = row.original;
        return (
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" className="h-8 w-8 p-0" asChild>
              <div
                role="button"
                className="flex items-center justify-center"
                onClick={(e) => {
                  e.preventDefault();
                  handleEditClick(category);
                }}
              >
                <Edit className="h-4 w-4" />
              </div>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
              onClick={() => handleDeleteClick(category.category_id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  console.log("filterFields: ", filterFields);
  console.log("response: ", response);

  return (
    <>
      <PageLayout
        filters={filterFields}
        filterColumnsPerRow={1}
        actions={actions}
        title="Issue Category List"
        description="List of all issue categories"
      >
        <DataTable
          columns={CategoryTableColumns}
          data={filteredResponse}
          handlePagination={handlePagination}
          tablePageSize={pageDetail.pageSize}
          totalPageCount={pageDetail.pageCount}
          currentIndex={pageDetail.pageIndex}
          isLoading={isLoading}
        />
      </PageLayout>

      <CreateCategoryModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
      />

      <EditCategoryModal
        isOpen={isEditModalOpen}
        onClose={handleEditClose}
        category={selectedCategory}
      />

      <DeleteModal
        open={deleteModalOpen}
        message="Are you sure you want to delete this issue category?"
        onCancel={() => {
          setDeleteModalOpen(false);
          setPendingDeleteId(null);
        }}
        onDelete={handleConfirmDelete}
        isLoading={isDeleting || isLoading}
      />
    </>
  );
}
