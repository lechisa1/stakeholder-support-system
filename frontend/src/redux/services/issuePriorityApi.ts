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
  description?: string;
  color_value: string;
  response_time: string;
}

// Inject endpoints into baseApi
export const issuePriorityApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all priorities
    getIssuePriorities: builder.query<IssuePriority[], void>({
      query: () => `/issue-priorities`,
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
