// src/redux/services/projectApi.ts
import { baseApi } from "../baseApi";

export interface Project {
  project_id: string;
  name: string;
  description?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
  institutes?: any[];
  hierarchies?: any[];
}

export interface CreateProjectDto {
  name: string;
  description?: string;
  is_active?: boolean;
  institute_id?: string;
  project_metrics_ids?: string[];
}

export const projectApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all projects
    getProjects: builder.query<Project[], void>({
      query: () => `/projects`,
      providesTags: ["Project"],
    }),

    // Get project by ID
    getProjectById: builder.query<Project, string>({
      query: (id) => `/projects/${id}`,
      providesTags: (result, error, id) => [{ type: "Project", id }],
    }),

    // 🔹 Get all projects by institute ID
    getProjectsByInstituteId: builder.query<Project[], string>({
      query: (institute_id) => `/projects/institute/${institute_id}`,
      providesTags: (result, error, institute_id) => [
        { type: "Project", id: `institute-${institute_id}` },
      ],
    }),

    // Create project
    createProject: builder.mutation<Project, CreateProjectDto>({
      query: (data) => ({
        url: `/projects`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Project"],
    }),

    // Update project
    updateProject: builder.mutation<
      Project,
      { id: string; data: Partial<CreateProjectDto> }
    >({
      query: ({ id, data }) => ({
        url: `/projects/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Project", id }],
    }),

    // Delete project
    deleteProject: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/projects/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Project"],
    }),

    // Assign user to project
    assignUserToProject: builder.mutation<
      any,
      {
        project_id: string;
        user_id: string;
        // role_id: string;
        // sub_role_id?: string;
        hierarchy_node_id?: string;
      }
    >({
      query: (data) => ({
        url: `/projects/assign-user`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Project"],
    }),

    // Assign internal user to project
    assignInternalUserToProject: builder.mutation<
      any,
      {
        project_id: string;
        user_id: string;
        project_metric_id: string;
        internal_node_id?: string;
      }
    >({
      query: (data) => ({
        url: `/projects/assign-internal-user`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Project"],
    }),

    // Update project maintenance (timeline)
    updateProjectMaintenance: builder.mutation<
      {
        message: string;
        maintenance: { start_date: string; end_date: string };
      },
      {
        project_id: string;
        data: { maintenance_start?: string; maintenance_end?: string };
      }
    >({
      query: ({ project_id, data }) => ({
        url: `/projects/${project_id}/maintenance`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { project_id }) => [
        { type: "Project", id: project_id },
      ],
    }),

    // Remove user from project
    removeUserFromProject: builder.mutation<
      any,
      { project_id: string; user_id: string }
    >({
      query: (data) => ({
        url: `/projects/remove-user`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Project"],
    }),

    // 🔹 Get all projects assigned to a user
    getProjectsByUserId: builder.query<
      { success: boolean; count: number; projects: any[] },
      string
    >({
      query: (user_id) => `/projects/user/${user_id}`,
      providesTags: (result, error, user_id) => [
        { type: "Project", id: user_id },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetProjectsQuery,
  useGetProjectByIdQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useUpdateProjectMaintenanceMutation,
  useGetProjectsByInstituteIdQuery,
  useDeleteProjectMutation,
  useAssignUserToProjectMutation,
  useAssignInternalUserToProjectMutation,
  useRemoveUserFromProjectMutation,
  useGetProjectsByUserIdQuery, // 🔹 New hook added
} = projectApi;
