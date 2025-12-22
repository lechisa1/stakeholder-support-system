"use client";

import { useEffect, useState } from "react";
import { Plus, Eye, Edit, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import {
  useDeleteHierarchyNodeMutation,
  useGetHierarchyNodesByProjectIdQuery,
} from "../../../redux/services/hierarchyNodeApi";

import { Button } from "../../ui/cn/button";
import { PageLayout } from "../../common/PageLayout";
import { DataTable } from "../../common/CommonTable";
import { ActionButton, FilterField } from "../../../types/layout";
import { CreateHierarchyNodeModal } from "../../modals/CreateHierarchyNodeModal";
import HierarchyD3Tree from "./HierarchyD3Tree";

// ------------------- Table Columns -------------------
const HierarchyNodeTableColumns = (deleteNode: any) => [
  {
    accessorKey: "name",
    header: "Structure Name",
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
  //   accessorKey: "project",
  //   header: "Project",
  //   cell: ({ row }: any) => {
  //     const project = row.original.project;
  //     return (
  //       <div className="font-medium text-gray-700">
  //         {project?.name ||
  //           project?.project_name ||
  //           project?.project_id ||
  //           "N/A"}
  //       </div>
  //     );
  //   },
  // },
  {
    accessorKey: "parent",
    header: "Parent Structure",
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
      const node = row.original;

      const handleDelete = async () => {
        if (confirm(`Delete node "${node.name}"?`)) {
          try {
            await deleteNode(node.hierarchy_node_id).unwrap();
            toast.success("Hierarchy node deleted successfully");
          } catch (err: any) {
            toast.error(err?.data?.message || "Error deleting node");
          }
        }
      };

      return (
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" className="h-8 w-8 p-0" asChild>
            <Link to={`/org_structure/${node.hierarchy_node_id}`}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
          {/* <Button variant="outline" size="sm" className="h-8 w-8 p-0" asChild>
            <Link to={`/org_structure/${node.hierarchy_node_id}`}>
              <Edit className="h-4 w-4" />
            </Link>
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

interface HierarchyNodeListProps {
  project_id: string;
  inistitute_id?: string;
  toggleActions?: ActionButton[];
}

// ------------------- Component -------------------
export default function HierarchyNodeList({
  project_id,
  inistitute_id,
  toggleActions,
}: HierarchyNodeListProps) {
  const [nodes, setNodes] = useState<any[]>([]);
  const [filteredNodes, setFilteredNodes] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isModalOpen, setModalOpen] = useState(false);
  const [pageDetail, setPageDetail] = useState({
    pageIndex: 0,
    pageCount: 1,
    pageSize: 10,
  });

  const { data, isLoading, isError } = useGetHierarchyNodesByProjectIdQuery(
    project_id,
    {
      skip: !project_id,
    }
  );
  const [deleteNode] = useDeleteHierarchyNodeMutation();
  const [toggleHierarchyNode, setToggleHierarchyNode] = useState("table");
  const actions: ActionButton[] = [
    {
      label: "Add Structure",
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
  ];

  useEffect(() => {
    if (!isError && !isLoading && data) {
      setNodes(data || []);
      setFilteredNodes(data || []);
    }
  }, [data, isError, isLoading]);

  useEffect(() => {
    const filtered = nodes.filter((item) => {
      if (!statusFilter || statusFilter === "all") return true;
      if (statusFilter === "ACTIVE") return item.is_active;
      if (statusFilter === "INACTIVE") return !item.is_active;
      return true;
    });
    setFilteredNodes(filtered);
  }, [nodes, statusFilter]);

  const handlePagination = (index: number, size: number) => {
    setPageDetail({ ...pageDetail, pageIndex: index, pageSize: size });
  };
  console.log("filteredNodes: ", filteredNodes);
  return (
    <>
      <PageLayout
        filters={filterFields}
        filterColumnsPerRow={1}
        toggleActions={toggleActions}
        actions={actions}
        showtoggle={true}
        toggle={toggleHierarchyNode}
        onToggle={(value: string) => setToggleHierarchyNode(value)}
      >
        {toggleHierarchyNode === "table" ? (
          <DataTable
            columns={HierarchyNodeTableColumns(deleteNode)}
            data={filteredNodes}
            handlePagination={handlePagination}
            tablePageSize={pageDetail.pageSize}
            totalPageCount={pageDetail.pageCount}
            currentIndex={pageDetail.pageIndex}
          />
        ) : (
          <HierarchyD3Tree inistitute_id={inistitute_id} data={filteredNodes} isLoading={isLoading} />
        )}
          {/* <HierarchyD3Tree
            data={filteredNodes}
            isLoading={isLoading}
            // pass institute for AssignUserModal
            inistitute_id={inistitute_id}
          /> */}

      </PageLayout>

      <CreateHierarchyNodeModal
        project_id={project_id}
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}
