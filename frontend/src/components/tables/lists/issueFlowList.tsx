"use client";

import { useEffect, useState } from "react";
import { Plus, Eye } from "lucide-react";
import { Link, useLocation, useSearchParams } from "react-router-dom";

import {
  useDeleteInternalNodeMutation,
  useGetInternalNodesQuery,
} from "../../../redux/services/internalNodeApi";

import { Button } from "../../ui/cn/button";
import { PageLayout } from "../../common/PageLayout";
import { DataTable } from "../../common/CommonTable";
import { ActionButton, FilterField } from "../../../types/layout";
// import { CreateInternalNodeModal } from "../../modals/CreateInternalNodeModal";
import HierarchyD3TreeInstitute from "./HierarchyD3TreeInstitute";
import { CreateInternalNodeModal } from "../../modals/CreateInternalNodeModal";

interface IssueFlowListProps {
  toggleActions?: ActionButton[];
  isAssignUsersToStructure?: boolean;
  hideAction?: boolean;
}

// ------------------- Component -------------------
export default function IssueFlowList({
  toggleActions,
  isAssignUsersToStructure,
}: IssueFlowListProps) {
  const [nodes, setNodes] = useState<any[]>([]);
  const [filteredNodes, setFilteredNodes] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isModalOpen, setModalOpen] = useState(false);
  const [toggleView, setToggleView] = useState("table");

  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") || "";
  const [pageDetail, setPageDetail] = useState({
    pageIndex: 0,
    pageCount: 1,
    pageSize: 10,
  });
  const { pathname } = useLocation();

  const { data, isLoading, isError, refetch } = useGetInternalNodesQuery({
    search: searchQuery,
    page: pageDetail.pageIndex + 1,
    pageSize: pageDetail.pageSize,
  });
  const [deleteNode] = useDeleteInternalNodeMutation();

  useEffect(() => {
    refetch();
  }, [searchQuery, pageDetail.pageIndex, pageDetail.pageSize, refetch]);

  // ------------------- Table Columns -------------------
  const InternalNodeTableColumns = (deleteNode: any) => [
    {
      accessorKey: "name",
      header: "Support Request Flow Name",
      cell: ({ row }: any) => (
        <div className="font-medium text-blue-600">{row.getValue("name")}</div>
      ),
    },
    // {
    //   accessorKey: "description",
    //   header: "Description",
    //   cell: ({ row }: any) => <div>{row.getValue("description") || "N/A"}</div>,
    // },
    {
      accessorKey: "parent",
      header: "Parent Request Flow",
      cell: ({ row }: any) => {
        const parent = row.original.parent;
        return <div>{parent?.name || "No Parent"}</div>;
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
        const node = row.original;

        // const handleDelete = async () => {
        //   if (confirm(`Delete node "${node.name}"?`)) {
        //     try {
        //       await deleteNode(node.internal_node_id).unwrap();
        //       toast.success("Internal node deleted successfully");
        //     } catch (err: any) {
        //       toast.error(err?.data?.message || "Error deleting node");
        //     }
        //   }
        // };
        let toggle = true;
        if (pathname.startsWith("/inistitutes/project")) {
          toggle = false;
        }

        return (
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" className="h-8 w-8 p-0" asChild>
              <Link
                to={
                  toggle
                    ? `/issue_configuration/${node.internal_node_id}`
                    : `/issue_flow/${node.internal_node_id}`
                }
              >
                <Eye className="h-4 w-4" />
              </Link>
            </Button>
            {/* Uncomment if edit/delete actions are needed */}
            {/* <Button variant="outline" size="sm" className="h-8 w-8 p-0">
            <Edit className="h-4 w-4" />
          </Button>
          <Button
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
  ];
  const actions: ActionButton[] = [
    {
      label: "Create Flow",
      icon: <Plus className="h-4 w-4" />,
      variant: "default",
      size: "default",
      onClick: () => setModalOpen(true),
      permissions: ["REQUEST_FLOWS:CREATE"],
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
      const nodes = Array.isArray(data) ? data : data.data || [];
      setNodes(nodes);

      const filtered = nodes.filter((node) => {
        if (statusFilter === "all") return true;
        if (statusFilter === "active") return node.is_active;
        if (statusFilter === "inactive") return !node.is_active;
        return true;
      });
      setFilteredNodes(filtered);
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
    const filtered = nodes.filter((item) => {
      if (!statusFilter || statusFilter === "all") return true;
      if (statusFilter === "ACTIVE") return item.is_active;
      if (statusFilter === "INACTIVE") return !item.is_active;
      return true;
    });
    setFilteredNodes(filtered);
  }, [nodes, statusFilter]);

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
        title={
          pathname.startsWith("/issue_configuration")
            ? "Support Request Flow List"
            : ""
        }
        description={
          pathname.startsWith("/issue_configuration")
            ? "List of all support request flows"
            : ""
        }
        filterColumnsPerRow={1}
        toggleActions={toggleActions}
        actions={actions}
        showtoggle={true}
        toggle={toggleView}
        onToggle={(value: string) => setToggleView(value)}
      >
        {toggleView === "table" ? (
          <DataTable
            columns={InternalNodeTableColumns(deleteNode)}
            data={filteredNodes}
            handlePagination={handlePagination}
            tablePageSize={pageDetail.pageSize}
            totalPageCount={pageDetail.pageCount}
            currentIndex={pageDetail.pageIndex}
            isLoading={isLoading}
          />
        ) : (
          <HierarchyD3TreeInstitute
            isAssignUsersToStructure={isAssignUsersToStructure}
            data={filteredNodes}
            isLoading={isLoading}
          />
        )}
        {/* <HierarchyD3TreeInstitute isAssignUsersToStructure={isAssignUsersToStructure} data={filteredNodes} isLoading={isLoading} /> */}
      </PageLayout>

      <CreateInternalNodeModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}
