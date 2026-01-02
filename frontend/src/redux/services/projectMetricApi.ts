// src/redux/features/projectMetricApi.ts
import { baseApi } from "../baseApi";
export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  meta?: PaginationMeta;
}
export interface GetProjectMetricsParams {
  is_active?: boolean;
  search?: string;
  page?: number;
  pageSize?: number;
}
export const projectMetricApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ===== CRUD Operations =====

    // Create a new Project Metric
    createProjectMetric: builder.mutation({
      query: (body) => ({
        url: "/project-metrics",
        method: "POST",
        body,
      }),
      invalidatesTags: ["ProjectMetrics"],
    }),

    // Get all Project Metrics
    getProjectMetrics: builder.query<
      PaginatedResponse<any>,
      GetProjectMetricsParams | void
    >({
      query: (params) => {
        if (!params || Object.keys(params).length === 0) {
          // No filters passed → fetch all users
          return `/project-metrics?page=1&pageSize=10`;
        }

        // Build query string from params
        const queryParams: Record<string, string> = {};

        if (params.is_active !== undefined)
          queryParams.is_active = params.is_active.toString();
        if (params.search) queryParams.search = params.search;

        queryParams.page = (params.page || 1).toString();
        queryParams.pageSize = (params.pageSize || 10).toString();

        const queryString = "?" + new URLSearchParams(queryParams).toString();
        return `/project-metrics${queryString}`;
      },
      providesTags: ["ProjectMetrics"],
    }),

    // Get a specific Project Metric by ID
    getProjectMetricById: builder.query({
      query: (id: string) => ({
        url: `/project-metrics/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [{ type: "ProjectMetrics", id }],
    }),

    // Update a specific Project Metric
    updateProjectMetric: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/project-metrics/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "ProjectMetrics", id },
        "ProjectMetrics",
      ],
    }),

    // Delete a specific Project Metric
    deleteProjectMetric: builder.mutation({
      query: (id: string) => ({
        url: `/project-metrics/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["ProjectMetrics"],
    }),

    // ===== User Metric Assignment Operations =====

    // Assign multiple metrics to a user
    assignMetricsToUser: builder.mutation({
      query: ({ user_id, ...body }) => ({
        url: `/project-metrics/users/${user_id}/assign-metrics`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["ProjectMetrics"],
    }),

    // Remove multiple metrics from a user
    removeMetricsFromUser: builder.mutation({
      query: ({ user_id, ...body }) => ({
        url: `/project-metrics/users/${user_id}/remove-metrics`,
        method: "DELETE",
        body,
      }),
      invalidatesTags: ["ProjectMetrics"],
    }),

    // Get all metrics assigned to a specific user
    getUserMetrics: builder.query({
      query: (user_id: string) => ({
        url: `/project-metrics/users/${user_id}/metrics`,
        method: "GET",
      }),
      providesTags: ["ProjectMetrics"],
    }),

    // ===== Project Metric Assignment Operations =====

    // Assign multiple metrics to a project
    assignMetricsToProject: builder.mutation({
      query: ({ project_id, ...body }) => ({
        url: `/project-metrics/projects/${project_id}/assign-metrics`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["ProjectMetrics"],
    }),

    // Remove multiple metrics from a project
    removeMetricsFromProject: builder.mutation({
      query: ({ project_id, ...body }) => ({
        url: `/project-metrics/projects/${project_id}/remove-metrics`,
        method: "DELETE",
        body,
      }),
      invalidatesTags: ["ProjectMetrics"],
    }),

    // Get all metrics assigned to a specific project
    getProjectProjectMetrics: builder.query({
      query: (project_id: string) => ({
        url: `/project-metrics/projects/${project_id}/metrics`,
        method: "GET",
      }),
      providesTags: ["ProjectMetrics"],
    }),

    // ===== User Metric Value Management =====

    // Update specific metric value for a user
    updateUserMetricValue: builder.mutation({
      query: ({ user_id, metric_id, ...body }) => ({
        url: `/project-metrics/users/${user_id}/metrics/${metric_id}/value`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["ProjectMetrics"],
    }),

    // ===== Legacy/Compatibility Endpoints (if needed) =====

    // Get Metrics Assigned to a Project (legacy - consider using getProjectProjectMetrics instead)
    getMetricsByProject: builder.query({
      query: (projectId: string) => ({
        url: `/projects/${projectId}/metrics`,
        method: "GET",
      }),
      providesTags: ["ProjectMetrics"],
    }),

    // Get User Metrics for a project metric (legacy)
    getMetricUsers: builder.query({
      query: (metric_id: string) => ({
        url: `/project-metrics/metrics/${metric_id}`,
        method: "GET",
      }),
      providesTags: ["ProjectMetrics"],
    }),

    // Assign User to a Project Metric (legacy - consider using assignMetricsToUser instead)
    assignUserToMetric: builder.mutation({
      query: (body) => ({
        url: "/project-metric-users",
        method: "POST",
        body,
      }),
      invalidatesTags: ["ProjectMetrics"],
    }),

    // Update User Metric Value (legacy - consider using updateUserMetricValue instead)
    updateMetricUserValue: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/project-metric-users/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["ProjectMetrics"],
    }),

    // Remove User from Metric (legacy - consider using removeMetricsFromUser instead)
    deleteMetricUser: builder.mutation({
      query: (id: string) => ({
        url: `/project-metric-users/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["ProjectMetrics"],
    }),
  }),

  overrideExisting: false,
});

export const {
  // CRUD Operations
  useCreateProjectMetricMutation,
  useGetProjectMetricsQuery,
  useGetProjectMetricByIdQuery,
  useUpdateProjectMetricMutation,
  useDeleteProjectMetricMutation,

  // User Metric Assignment Operations
  useAssignMetricsToUserMutation,
  useRemoveMetricsFromUserMutation,
  useGetUserMetricsQuery,

  // Project Metric Assignment Operations
  useAssignMetricsToProjectMutation,
  useRemoveMetricsFromProjectMutation,
  useGetProjectProjectMetricsQuery,

  // User Metric Value Management
  useUpdateUserMetricValueMutation,

  // Legacy/Compatibility Endpoints
  useGetMetricsByProjectQuery,
  useGetMetricUsersQuery,
  useAssignUserToMetricMutation,
  useUpdateMetricUserValueMutation,
  useDeleteMetricUserMutation,
} = projectMetricApi;
