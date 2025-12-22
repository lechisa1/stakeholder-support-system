"use client";

import React, { useEffect, useState } from "react";
import { Plus, Eye, Edit, Trash2 } from "lucide-react";
import { Link, useParams } from "react-router-dom";

import {
  useGetProjectsQuery,
  useDeleteProjectMutation,
  useGetProjectsByInstituteIdQuery,
} from "../../../redux/services/projectApi";
import { Button } from "../../ui/cn/button";
import { PageLayout } from "../../common/PageLayout";
import { DataTable } from "../../common/CommonTable";
import { ActionButton, FilterField } from "../../../types/layout";
import { CreateProjectModal } from "../../modals/CreateProjectModal";
import { isPermittedActionButton } from "../../../utils/guards/isPermittedActionButton";

interface ProjectListProps {
  userType: string;
  insistitute_id: string;
}
export default function ProjectList({
  insistitute_id,
  userType,
}: ProjectListProps) {
  const [response, setResponse] = useState<any[]>([]);
  const [filteredResponse, setFilteredResponse] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isModalOpen, setModalOpen] = useState(false);
  const [pageDetail, setPageDetail] = useState({
    pageIndex: 0,
    pageCount: 1,
    pageSize: 10,
  });
  const { id } = useParams<{ id: string }>();

  // --- Define table columns ---
  const ProjectTableColumns = [
    {
      accessorKey: "name",
      header: "Project Name",
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
        const project = row.original;
        const [deleteProject] = useDeleteProjectMutation();
        // id from local storage
        // Dynamic link depending on userType
        const projectLink =
          userType === "external_user"
            ? `/project/${project.project_id}`
            : `projects/${project.project_id}`;

        return (
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" className="h-8 w-8 p-0" asChild>
              <Link to={`${projectLink}`}>
                <Eye className="h-4 w-4" />
              </Link>
            </Button>
            {/* <Button variant="outline" size="sm" className="h-8 w-8 p-0" asChild>
            <Link to={`/edit/${project.project_id}`}>
              <Edit className="h-4 w-4" />
            </Link>
          </Button> */}
            {/* <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
            onClick={() => deleteProject(project.project_id)}
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
      label: "Add Project",
      icon: <Plus className="h-4 w-4" />,
      variant: "default",
      size: "default",
      onClick: () => setModalOpen(true),
      // permissions: ["create:projects"],
      allowedFor: ["internal_user"],
    },
  ];

  // Filter the actions once
  const permittedActions = actions.filter((action) =>
    isPermittedActionButton(action)
  );

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

  // const { data, isLoading, isError } = useGetProjectsQuery();
  const { data, isLoading, isError } =
    useGetProjectsByInstituteIdQuery(insistitute_id);

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
    setPageDetail({
      ...pageDetail,
      pageIndex: index,
      pageSize: size,
    });
  };

  return (
    <>
      <PageLayout
        filters={filterFields}
        filterColumnsPerRow={1}
        actions={permittedActions}
        title="Project List"
        description="List of all projects"
      >
        <DataTable
          columns={ProjectTableColumns}
          data={filteredResponse}
          handlePagination={handlePagination}
          tablePageSize={pageDetail.pageSize}
          totalPageCount={pageDetail.pageCount}
          currentIndex={pageDetail.pageIndex}
        />
      </PageLayout>
      <CreateProjectModal
        instituteId={insistitute_id}
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}
