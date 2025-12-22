"use client";

import { useEffect, useState } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
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


export default function IssuePriorityList() {
  const [response, setResponse] = useState<any[]>([]);
  const [filteredResponse, setFilteredResponse] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isModalOpen, setModalOpen] = useState(false);
  const [pageDetail, setPageDetail] = useState({
    pageIndex: 0,
    pageCount: 1,
    pageSize: 10,
  });
  const [deletePriority,{isLoading: isDeleteLoading}] = useDeleteIssuePriorityMutation();
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletePriorityId, setDeletePriorityId] = useState<string>("");
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [editPriorityId, setEditPriorityId] = useState<string>("");
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
    cell: ({ row }: any) => <div>{row.getValue("description") || "N/A"}</div>,
  },
  {
    accessorKey: "response_time",
    header: "Response Time",
    cell: ({ row }: any) => <div>{row.getValue("response_time") || "N/A"}</div>,
  },
  {
    accessorKey: "Escalate to Admin",
    header: "Escalate to Admin",
    cell: ({ row }: any) => <div>{row.getValue("is_active") ? "Yes" : "No"}</div>,
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }: any) => {
      const priority = row.original;

      return (
        <div className="flex items-center space-x-2">
          {/* show button to view priority
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
            // onClick={() => openViewModal(priority)}
          >
            <Eye className="h-4 w-4" />
          </Button> */}
          {/* Edit button */}
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

          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
            onClick={() => {
              setDeleteModalOpen(true);
              setDeletePriorityId(priority.priority_id);
              console.log("deletePriorityId", deletePriorityId);
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>

        </div>
      );
    },
  },
];
  const { data, isLoading, isError } = useGetIssuePrioritiesQuery();

  const actions: ActionButton[] = [
    {
      label: "Create",
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
        { label: "Active", value: "ACTIVE" },
        { label: "Inactive", value: "INACTIVE" },
      ],
      value: statusFilter,
      onChange: (value: string | string[]) => {
        setStatusFilter(Array.isArray(value) ? value[0] : value);
        setPageDetail({ ...pageDetail, pageIndex: 0 });
      },
    },
  ]; // Add filters if needed

  useEffect(() => {
    if (!isError && !isLoading && data) {
      // Handle both array and object with data property
      const priorities = Array.isArray(data) ? data : (data as any)?.data || [];
      setResponse(priorities);
      setFilteredResponse(priorities);
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
  // Optional: filter by name or other criteria
  // const [searchTerm, setSearchTerm] = useState("");
  // useEffect(() => {
  //   const filtered = response.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
  //   setFilteredResponse(filtered);
  // }, [response, searchTerm]);

  return (
    <>
      <PageLayout
        filters={filterFields}
        filterColumnsPerRow={1}
        actions={actions}
        title="Request Priority List"
        description="List of all request priorities"
      >
        <DataTable
          columns={PriorityTableColumns}
          data={filteredResponse}
          handlePagination={handlePagination}
          tablePageSize={pageDetail.pageSize}
          totalPageCount={pageDetail.pageCount}
          currentIndex={pageDetail.pageIndex}
        />
      </PageLayout>

      <CreatePriorityModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
      />
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
        onDelete={() => {deletePriority(deletePriorityId).unwrap()
          setDeleteModalOpen(false);}
        }
        open={isDeleteModalOpen}
        isLoading={isDeleteLoading || isLoading}
      />
    </>
  );
}
