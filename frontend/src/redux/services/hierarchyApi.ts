// src/redux/apis/hierarchyApi.ts
import { baseApi } from "../baseApi";

export interface Hierarchy {
  hierarchy_id: string;
  name: string;
  project_id: string;
  description?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
  project?: any;
}

export interface CreateHierarchyDto {
  name: string;
  project_id: string;
  description?: string;
  is_active?: boolean;
}

// Inject endpoints into the base API
export const hierarchyApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getHierarchies: builder.query<Hierarchy[], void>({
      query: () => `/hierarchies`,
      providesTags: ["Hierarchy"],
    }),
    getHierarchyById: builder.query<Hierarchy, string>({
      query: (id) => `/hierarchies/${id}`,
      providesTags: (result, error, id) => [{ type: "Hierarchy", id }],
    }),
    createHierarchy: builder.mutation<
      Hierarchy | Hierarchy[],
      CreateHierarchyDto | CreateHierarchyDto[]
    >({
      query: (data) => ({
        url: `/hierarchies`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Hierarchy"],
    }),
    updateHierarchy: builder.mutation<
      Hierarchy,
      { id: string; data: Partial<CreateHierarchyDto> }
    >({
      query: ({ id, data }) => ({
        url: `/hierarchies/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Hierarchy", id }],
    }),
    deleteHierarchy: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/hierarchies/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Hierarchy"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetHierarchiesQuery,
  useGetHierarchyByIdQuery,
  useCreateHierarchyMutation,
  useUpdateHierarchyMutation,
  useDeleteHierarchyMutation,
} = hierarchyApi;
