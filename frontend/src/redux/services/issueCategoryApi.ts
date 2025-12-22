// src/redux/apis/issueCategoryApi.ts
import { baseApi } from "../baseApi";

// Interface for IssueCategory
export interface IssueCategory {
  category_id: string;
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

// DTO for creating/updating IssueCategory
export interface CreateIssueCategoryDto {
  name: string;
  description?: string;
}

// Inject endpoints into baseApi
export const issueCategoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all categories
    getIssueCategories: builder.query<IssueCategory[], void>({
      query: () => `/issue-categories`,
      providesTags: ["IssueCategory"],
      transformResponse: (response: any) => response.data || [],
    }),

    // Get category by ID
    getIssueCategoryById: builder.query<IssueCategory, string>({
      query: (id) => `/issue-categories/${id}`,
      providesTags: (result, error, id) => [{ type: "IssueCategory", id }],
      transformResponse: (response: any) => response.data,
    }),

    // Create a new category
    createIssueCategory: builder.mutation<
      IssueCategory,
      CreateIssueCategoryDto
    >({
      query: (data) => ({
        url: `/issue-categories`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["IssueCategory"],
    }),

    // Update an existing category
    updateIssueCategory: builder.mutation<
      IssueCategory,
      { id: string; data: Partial<CreateIssueCategoryDto> }
    >({
      query: ({ id, data }) => ({
        url: `/issue-categories/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "IssueCategory", id },
        "IssueCategory",
      ],
    }),

    // Delete a category
    deleteIssueCategory: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/issue-categories/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["IssueCategory"],
    }),
  }),
  overrideExisting: false,
});

// Export hooks
export const {
  useGetIssueCategoriesQuery,
  useGetIssueCategoryByIdQuery,
  useCreateIssueCategoryMutation,
  useUpdateIssueCategoryMutation,
  useDeleteIssueCategoryMutation,
} = issueCategoryApi;
