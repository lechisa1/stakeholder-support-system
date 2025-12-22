"use client";

import React, { useEffect, useState } from "react";
import { Plus, Eye, Edit, Trash2 } from "lucide-react";
import { Link, Navigate, useNavigate } from "react-router-dom";

import { useGetInstitutesQuery } from "../../../redux/services/instituteApi";
import { Button } from "../../ui/cn/button";
import { PageLayout } from "../../common/PageLayout";
import { DataTable } from "../../common/CommonTable";
import { ActionButton, FilterField } from "../../../types/layout";
import { CreateInstituteModal } from "../../modals/CreateInstituteModal";

// --- Define table columns ---
const InstituteTableColumns = [
  {
    accessorKey: "name",
    header: "Organization Name",
    cell: ({ row }: any) => (
      <div className="font-medium text-blue-600">{row.getValue("name")}</div>
    ),
  },
  // {
  //   accessorKey: "description",
  //   header: "Description",
  //   cell: ({ row }: any) => <div>{row.getValue("description") || "N/A"}</div>,
  // },
  // {
  //   accessorKey: "has_branch",
  //   header: "Type",
  //   cell: ({ row }: any) => {
  //     const hasBranch = row.getValue("has_branch");
  //     return (
  //       <span
  //         className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
  //           hasBranch ? "bg-green-600 text-white" : "bg-red-600 text-white"
  //         }`}
  //       >
  //         {hasBranch ? "Multi-Branch" : "Central Only"}
  //       </span>
  //     );
  //   },
  // },
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
      const institute = row.original;
      return (
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" className="h-8 w-8 p-0" asChild>
            <Link to={`/organization/${institute.institute_id}`}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
          {/* <Button variant="outline" size="sm" className="h-8 w-8 p-0" asChild>
            <Link to={`/organization/${institute.institute_id}`}>
              <Edit className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
            onClick={() => {
              console.log("Delete institute:", institute.institute_id);
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button> */}
        </div>
      );
    },
  },
];

export default function OrganizationList() {
  const [response, setResponse] = useState<any[]>([]);
  const [filteredResponse, setFilteredResponse] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isModalOpen, setModalOpen] = useState(false);
  const [pageDetail, setPageDetail] = useState({
    pageIndex: 0,
    pageCount: 1,
    pageSize: 10,
  });

  const actions: ActionButton[] = [
    {
      label: "Create",
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

  const { isLoading, isError, data } = useGetInstitutesQuery();

  useEffect(() => {
    if (!isError && !isLoading && data) {
      setResponse(data || []);
      setFilteredResponse(data || []);
    }
  }, [data, isError, isLoading]);

  // Apply status filter
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
      <PageLayout
        title="Organization List"
        description="List of organizations"
        filters={filterFields}
        filterColumnsPerRow={1}
        actions={actions}
      >
        <DataTable
          columns={InstituteTableColumns}
          data={filteredResponse}
          handlePagination={handlePagination}
          tablePageSize={pageDetail.pageSize}
          totalPageCount={pageDetail.pageCount}
          currentIndex={pageDetail.pageIndex}
        />
      </PageLayout>
      <CreateInstituteModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}
