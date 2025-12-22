// src/redux/apis/userApi.ts
import { baseApi } from "../baseApi";

// --------------------- Types ---------------------
export interface UserType {
  user_type_id: string;
  name: string;
  description?: string;
}

export interface UserPosition {
  user_position_id: string;
  name: string;
  description?: string;
}

export interface Institute {
  institute_id: string;
  name: string;
  description?: string;
  is_active?: boolean;
}

export interface HierarchyNode {
  hierarchy_node_id: string;
  name: string;
}

export interface User {
  user_id: string;
  full_name: string;
  email: string;
  phone_number?: string;
  position?: string;
  is_active: boolean;
  user_type_id: string;
  institute_id?: string | null;
  hierarchy_node_id?: string | null;
  profile_image?: string;
  is_first_logged_in?: boolean;
  last_login_at?: string;
  password_changed_at?: string;
  created_at?: string;
  updated_at?: string;
  assigned_by?: string;
  assigned_at?: string;
  userType?: UserType;
  userPosition?: UserPosition;
  institute?: Institute;
  hierarchyNode?: HierarchyNode;
}

export interface CreateUserDto {
  full_name: string;
  email: string;
  user_type_id: string;
  user_position_id?: string;
  institute_id?: string;
  role_ids?: string[];
  hierarchy_node_id?: string;
  project_metrics_ids?: string[];
  position?: string;
  phone_number?: string;
}

export interface UpdateUserDto {
  full_name?: string;
  email?: string;
  phone_number?: string;
  position?: string;
  user_type_id?: string;
  institute_id?: string;
  hierarchy_node_id?: string;
  is_active?: boolean;
  role_ids?: string[];
  project_metrics_ids?: string[];
}

export interface GetUsersParams {
  institute_id?: string;
  user_type_id?: string;
  user_position_id?: string;
  hierarchy_node_id?: string;
  is_active?: boolean;
  search?: string;
}

// --------------------- API ---------------------
export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all users (with optional filters)
    getUsers: builder.query<User[], GetUsersParams | void>({
      query: (params) => {
        if (!params || Object.keys(params).length === 0) {
          // No filters passed → fetch all users
          return `/users`;
        }

        // Build query string from params
        const queryString =
          "?" +
          new URLSearchParams(
            Object.entries(params).reduce((acc, [key, value]) => {
              if (value !== undefined && value !== null)
                acc[key] = String(value);
              return acc;
            }, {} as Record<string, string>)
          ).toString();

        return `/users${queryString}`;
      },
      providesTags: ["User"],
    }),

    // Get users by institute ID
    getUsersByInstituteId: builder.query<User[], string>({
      query: (institute_id) => `/users/institute/${institute_id}`,
      providesTags: ["User"],
    }),

    // Get users by project + hierarchy node
    getUsersByHierarchyNodeId: builder.query<
      any,
      { project_id: string; hierarchy_node_id: string }
    >({
      query: ({ project_id, hierarchy_node_id }) =>
        `/users/project/${project_id}/node/${hierarchy_node_id}`,
      providesTags: ["User"],
    }),

    // Get users by project + Internal node
    getUsersByInternalNodeId: builder.query<
      any,
      { project_id: string; internal_node_id: string }
    >({
      query: ({ project_id, internal_node_id }) =>
        `/users/project/internal/${project_id}/node/${internal_node_id}`,
      providesTags: ["User"],
    }),

    // Get all users assigned to a project
    getUsersAssignedToProject: builder.query<any, string>({
      query: (project_id) => `/users/project/${project_id}`,
      providesTags: ["User"],
    }),

    // Get all users assigned to a project
    getInternalUsersAssignedToProject: builder.query<any, string>({
      query: (project_id) => `/users/project/internal/${project_id}`,
      providesTags: ["User"],
    }),

    // Get users from an institute NOT assigned to a project
    getUsersNotAssignedToProject: builder.query<
      User[],
      { institute_id: string; project_id: string }
    >({
      query: ({ institute_id, project_id }) =>
        `/users/not-assigned/${institute_id}/${project_id}`,
      providesTags: ["User"],
    }),

    // Get internal users not assigned to a project
    getInternalUsersNotAssignedToProject: builder.query<
      User[],
      string // project_id
    >({
      query: (project_id) => `/users/internal-not-assigned/${project_id}`,
      providesTags: ["User"],
    }),

    getInternalProjectSubNodeUsers: builder.query<
      any,
      { project_id: string; Internal_node_id: string }
    >({
      query: ({ project_id, Internal_node_id }) =>
        `/users/project-subnode-users/${project_id}/${Internal_node_id}`,
      providesTags: ["User"],
    }),

    // Get user by ID
    getUserById: builder.query<User, string>({
      query: (user_id) => `/users/${user_id}`,
      providesTags: (result, error, user_id) => [{ type: "User", user_id }],
    }),

    // Create a new user
    createUser: builder.mutation<User, CreateUserDto>({
      query: (data) => ({
        url: `/users`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),

    // Update user
    updateUser: builder.mutation<User, { user_id: string; data: UpdateUserDto }>({
      query: ({ user_id, data }) => ({
        url: `/users/${user_id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),

    // Delete (deactivate) user
    deleteUser: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/users/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["User"],
    }),

    // Toggle user active status
    toggleUserStatus: builder.mutation<
      {
        success: boolean;
        message: string;
        data: { user_id: string; is_active: boolean };
      },
      { id: string; is_active: boolean }
    >({
      query: ({ id, is_active }) => ({
        url: `/users/${id}/toggle-status`,
        method: "PATCH",
        body: { is_active },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "User", id },
        "User",
      ],
    }),

    // Reset user password
    resetUserPassword: builder.mutation<
      { success: boolean; message: string },
      string
    >({
      query: (id) => ({
        url: `/users/${id}/reset-password`,
        method: "POST",
      }),
      invalidatesTags: ["User"],
    }),

    // Get all user types
    getUserTypes: builder.query<UserType[], void>({
      query: () => `/users/user-types`,
      providesTags: ["User"],
    }),
    // Get all user positions
    getUserPositions: builder.query<UserPosition[], void>({
      query: () => `/users/user-positions`,
      providesTags: ["User"],
    }),
  }),
  overrideExisting: false,
});

// --------------------- Hooks ---------------------
export const {
  useGetUsersQuery,
  useGetUsersByInstituteIdQuery,
  useGetUsersByHierarchyNodeIdQuery,
  useGetUsersByInternalNodeIdQuery,
  useGetUsersAssignedToProjectQuery,
  useGetUsersNotAssignedToProjectQuery,
  useGetInternalUsersAssignedToProjectQuery,
  useGetInternalUsersNotAssignedToProjectQuery,
  useGetInternalProjectSubNodeUsersQuery,
  useGetUserByIdQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useToggleUserStatusMutation,
  useResetUserPasswordMutation,
  useGetUserTypesQuery,
  useGetUserPositionsQuery,
} = userApi;
