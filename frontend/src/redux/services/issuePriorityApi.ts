// src/redux/apis/issuePriorityApi.ts
import { baseApi } from "../baseApi";

// Interface for IssuePriority
export interface IssuePriority {
  priority_id: string;
  name: string;
  description?: string;
  color_value: string;
  response_time: string;
  created_at?: string;
  updated_at?: string;
}

// DTO for creating/updating IssuePriority
export interface CreateIssuePriorityDto {
  name: string;
  description: string;
  color_value: string;
  response_unit: string;
  response_duration: number;
  is_active?: boolean;
}

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

export interface GetIssuePriorityParams {
  is_active?: boolean;
  search?: string;
  page?: number;
  pageSize?: number;
}

// Inject endpoints into baseApi
export const issuePriorityApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all priorities
    getIssuePriorities: builder.query<
      PaginatedResponse<IssuePriority>,
      GetIssuePriorityParams | void
    >({
      query: (params) => {
        if (!params || Object.keys(params).length === 0) {
          // No filters passed → fetch all users
          return `/issue-priorities?page=1&pageSize=10`;
        }

        // Build query string from params
        const queryParams: Record<string, string> = {};

        if (params.is_active !== undefined)
          queryParams.is_active = params.is_active.toString();
        if (params.search) queryParams.search = params.search;

        queryParams.page = (params.page || 1).toString();
        queryParams.pageSize = (params.pageSize || 10).toString();

        const queryString = "?" + new URLSearchParams(queryParams).toString();
        return `/issue-priorities${queryString}`;
      },
      providesTags: ["IssuePriority"],
    }),

    // Get priority by ID
    getIssuePriorityById: builder.query<IssuePriority, string>({
      query: (id) => `/issue-priorities/${id}`,
      providesTags: (result, error, id) => [{ type: "IssuePriority", id }],
    }),

    // Create a new priority
    createIssuePriority: builder.mutation<
      IssuePriority,
      CreateIssuePriorityDto
    >({
      query: (data) => ({
        url: `/issue-priorities`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["IssuePriority"],
    }),

    // Update a priority
    updateIssuePriority: builder.mutation<
      IssuePriority,
      { id: string; data: Partial<CreateIssuePriorityDto> }
    >({
      query: ({ id, data }) => ({
        url: `/issue-priorities/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "IssuePriority", id },
        "IssuePriority",
      ],
    }),

    // Delete a priority
    deleteIssuePriority: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/issue-priorities/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["IssuePriority"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetIssuePrioritiesQuery,
  useGetIssuePriorityByIdQuery,
  useCreateIssuePriorityMutation,
  useUpdateIssuePriorityMutation,
  useDeleteIssuePriorityMutation,
} = issuePriorityApi;
