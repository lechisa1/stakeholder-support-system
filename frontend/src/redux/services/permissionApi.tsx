// src/redux/apis/permissionApi.ts
import { baseApi } from "../baseApi";

export interface Permission {
  permission_id: string;
  resource: string;
  action: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface PermissionToggleResponse {
  success: boolean;
  message: string;
  data: Permission;
}

export const permissionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPermissions: builder.query<Permission[], void>({
      query: () => `/permissions`,
      providesTags: ["Permission"],
    }),
    activatePermission: builder.mutation<PermissionToggleResponse, string>({
      query: (permission_id) => ({
        url: `/permissions/activate/${permission_id}`,
        method: "PUT",
      }),
      invalidatesTags: ["Permission"],
    }),
    deactivatePermission: builder.mutation<PermissionToggleResponse, string>({
      query: (permission_id) => ({
        url: `/permissions/deactivate/${permission_id}`,
        method: "PUT",
      }),
      invalidatesTags: ["Permission"],
    }),
    togglePermission: builder.mutation({
      query: (permission_id) => ({
        url: `/permissions/toggle/${permission_id}`,
        method: "PUT",
        body: {},
      }),
      invalidatesTags: ["Permission"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetPermissionsQuery,
  useActivatePermissionMutation,
  useDeactivatePermissionMutation,
  useTogglePermissionMutation,
} = permissionApi;
