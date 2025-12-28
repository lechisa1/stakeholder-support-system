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

export interface GetIssueCategoryParams {
  is_active?: boolean;
  search?: string;
  page?: number;
  pageSize?: number;
}

// Inject endpoints into baseApi
export const issueCategoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all categories
    getIssueCategories: builder.query<
      PaginatedResponse<IssueCategory>,
      GetIssueCategoryParams | void
    >({
      query: (params) => {
        if (!params || Object.keys(params).length === 0) {
          // No filters passed → fetch all users
          return `/issue-categories?page=1&pageSize=10`;
        }

        // Build query string from params
        const queryParams: Record<string, string> = {};

        if (params.is_active !== undefined)
          queryParams.is_active = params.is_active.toString();
        if (params.search) queryParams.search = params.search;

        queryParams.page = (params.page || 1).toString();
        queryParams.pageSize = (params.pageSize || 10).toString();

        const queryString = "?" + new URLSearchParams(queryParams).toString();
        return `/issue-categories${queryString}`;
      },
      providesTags: ["IssueCategory"],
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
