"use client";

import React, { useEffect, useState } from "react";
import { Plus, Eye, Edit, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

import {
  useGetIssueCategoriesQuery,
  useDeleteIssueCategoryMutation,
} from "../../../redux/services/issueCategoryApi";
import { Button } from "../../ui/cn/button";
import { PageLayout } from "../../common/PageLayout";
import { DataTable } from "../../common/CommonTable";
import { ActionButton, FilterField } from "../../../types/layout";
import { CreateCategoryModal } from "../../modals/CreateCategoryModal";
import { format } from "date-fns";

// --- Define table columns ---
const CategoryTableColumns = [
  {
    accessorKey: "name",
    header: "Category Name",
    cell: ({ row }: any) => (
      <div className="font-medium text-blue-600">{row.getValue("name")}</div>
    ),
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }: any) => <div>{row.getValue("description") || "N/A"}</div>,
  },
  // {
  //   accessorKey: "created_at",
  //   header: "Created At",
  //   cell: ({ row }: any) => (
  //     <div>
  //       {row.getValue("created_at")
  //         ? format(new Date(row.getValue("created_at")), "PPP p")
  //         : "N/A"}
  //     </div>
  //   ),
  // },
  // {
  //   accessorKey: "updated_at",
  //   header: "Updated At",
  //   cell: ({ row }: any) => (
  //     <div>
  //       {row.getValue("updated_at")
  //         ? format(new Date(row.getValue("updated_at")), "PPP p")
  //         : "N/A"}
  //     </div>
  //   ),
  // },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }: any) => {
      const category = row.original;
      const [deleteCategory] = useDeleteIssueCategoryMutation();

      return (
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" className="h-8 w-8 p-0" asChild>
            <Link to={`/issue_category/${category.category_id}`}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
          {/* <Button variant="outline" size="sm" className="h-8 w-8 p-0" asChild>
            <Link to={`/issue_category/${category.category_id}`}>
              <Edit className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
            onClick={() => deleteCategory(category.category_id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button> */}
        </div>
      );
    },
  },
];

export default function IssueCategoryList() {
  const [response, setResponse] = useState<any[]>([]);
  const [filteredResponse, setFilteredResponse] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isModalOpen, setModalOpen] = useState(false);
  const [pageDetail, setPageDetail] = useState({
    pageIndex: 0,
    pageCount: 1,
    pageSize: 10,
  });

  const { data, isLoading, isError } = useGetIssueCategoriesQuery();

  const actions: ActionButton[] = [
    {
      label: "Create",
      icon: <Plus className="h-4 w-4" />,
      variant: "default",
      size: "default",
      onClick: () => setModalOpen(true),
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

  useEffect(() => {
    if (!isError && !isLoading && data) {
      setResponse(data || []);
      setFilteredResponse(data || []);
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
    setPageDetail({ ...pageDetail, pageIndex: index, pageSize: size });
  };

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
        />
      </PageLayout>

      <CreateCategoryModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}
