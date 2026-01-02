// src/redux/apis/instituteApi.ts
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

export interface Institute {
  institute_id: string;
  name: string;
  description?: string;
  has_branch?: boolean;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
  projects?: any[];
}

export interface CreateInstituteDto {
  name: string;
  description?: string;
  is_active?: boolean;
}

export interface GetInstitutesParams {
  is_active?: boolean;
  search?: string;
  page?: number;
  pageSize?: number;
}

// Inject endpoints into the base API
export const instituteApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    getInstitutes: builder.query<PaginatedResponse<Institute>,GetInstitutesParams | void>({
      query: (params) => {
        if (!params || Object.keys(params).length === 0) {
          // No filters passed → fetch all users
          return `/institutes?page=1&pageSize=10`;
        }

        // Build query string from params
        const queryParams: Record<string, string> = {};

        if (params.is_active !== undefined)
          queryParams.is_active = params.is_active.toString();
        if (params.search) queryParams.search = params.search;

        queryParams.page = (params.page || 1).toString();
        queryParams.pageSize = (params.pageSize || 10).toString();

        const queryString = "?" + new URLSearchParams(queryParams).toString();
        return `/institutes${queryString}`;
      },
      providesTags: ["Institute"],
    }),

    // getInstitutes: builder.query<Institute[], void>({
    //   query: () => `/institutes`,
    //   providesTags: ["Institute"],
    // }),
    getInstituteById: builder.query<Institute, string>({
      query: (id) => `/institutes/${id}`,
      providesTags: (result, error, id) => [{ type: "Institute", id }],
    }),
    createInstitute: builder.mutation<Institute, CreateInstituteDto>({
      query: (data) => ({
        url: `/institutes`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Institute"],
    }),
    updateInstitute: builder.mutation<
      Institute,
      { id: string; data: Partial<CreateInstituteDto> }
    >({
      query: ({ id, data }) => ({
        url: `/institutes/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Institute", id }],
    }),
    deleteInstitute: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/institutes/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Institute"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetInstitutesQuery,
  useGetInstituteByIdQuery,
  useCreateInstituteMutation,
  useUpdateInstituteMutation,
  useDeleteInstituteMutation,
} = instituteApi;
