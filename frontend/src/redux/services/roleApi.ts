// src/redux/features/roleApi.ts
import { baseApi } from "../baseApi";

// --------------------- Types ---------------------
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

export interface Role {
  role_id: string;
  name: string;
  description: string;
  role_type?: string;
  is_active: boolean;
}

export interface GetRolesParams {
  role_type?: string;
  is_active?: boolean;
  search?: string;
  page?: number;
  pageSize?: number;
}

export const roleApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ===== Create a new role =====
    createRole: builder.mutation({
      query: (body) => ({
        url: "/roles",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Roles"],
    }),

    // ===== Get all roles (with optional filters) =====
    getRoles: builder.query<PaginatedResponse<Role>, GetRolesParams | void>({
      query: (params) => {
        if (!params || Object.keys(params).length === 0) {
          // No filters passed → fetch all roles
          return `/roles?page=1&pageSize=10`;
        }

        // Build query string from params
        const queryParams: Record<string, string> = {};

        if (params.role_type) queryParams.role_type = params.role_type;
        if (params.is_active !== undefined)
          queryParams.is_active = params.is_active.toString();
        if (params.search) queryParams.search = params.search;

        queryParams.page = (params.page || 1).toString();
        queryParams.pageSize = (params.pageSize || 10).toString();

        const queryString = "?" + new URLSearchParams(queryParams).toString();
        return `/roles${queryString}`;
      },
      providesTags: ["Roles"],
    }),

    getRoless: builder.query({
      query: (params?: { role_type?: string; is_active?: boolean }) => {
        if (!params || Object.keys(params).length === 0) {
          // No filters → fetch all roles
          return {
            url: "/roles",
            method: "GET",
          };
        }

        // Build query string from params
        const queryString =
          "?" +
          new URLSearchParams(
            Object.entries(params).reduce((acc, [key, value]) => {
              if (value !== undefined && value !== null) {
                acc[key] = String(value);
              }
              return acc;
            }, {} as Record<string, string>)
          ).toString();

        return {
          url: `/roles${queryString}`,
          method: "GET",
        };
      },
      providesTags: ["Roles"],
    }),

    // ===== Get a specific role by ID =====
    getRoleById: builder.query({
      query: (id: string) => ({
        url: `/roles/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [{ type: "Roles", id }],
    }),

    // ===== Update a specific role =====
    updateRole: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/roles/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Roles", id },
        "Roles",
      ],
    }),

    // ===== Delete a specific role =====
    deleteRole: builder.mutation({
      query: (id: string) => ({
        url: `/roles/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Roles"],
    }),

    // ===== Get sub-roles for a specific role =====
    getSubRolesByRole: builder.query({
      query: (id: string) => ({
        url: `/roles/${id}/sub-roles`,
        method: "GET",
      }),
    }),

    // ===== Get permissions for a role-subrole combination =====
    getPermissionsByRoleSubRole: builder.query({
      query: ({
        roleId,
        subRoleId,
      }: {
        roleId: string;
        subRoleId: string;
      }) => ({
        url: `/roles/${roleId}/sub-roles/${subRoleId}/permissions`,
        method: "GET",
      }),
    }),
  }),

  overrideExisting: false,
});

export const {
  useCreateRoleMutation,
  useGetRolesQuery,
  useGetRoleByIdQuery,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
  useGetSubRolesByRoleQuery,
  useGetPermissionsByRoleSubRoleQuery,
} = roleApi;
