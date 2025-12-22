// src/redux/apis/instituteApi.ts
import { baseApi } from "../baseApi";

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

// Inject endpoints into the base API
export const instituteApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getInstitutes: builder.query<Institute[], void>({
      query: () => `/institutes`,
      providesTags: ["Institute"],
    }),
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
