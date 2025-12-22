// src/redux/apis/internalNodeApi.ts
import { baseApi } from "../baseApi";

// ---------------------------
// Interfaces
// ---------------------------
export interface InternalNode {
  internal_node_id: string;
  parent_id?: string | null;
  name: string;
  description?: string;
  level?: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
  parent?: InternalNode | null;
  children?: InternalNode[];
}

export interface CreateInternalNodeDto {
  parent_id?: string | null;
  name: string;
  description?: string;
  is_active?: boolean;
  children?: CreateInternalNodeDto[];
}

export interface UpdateInternalNodeDto {
  parent_id?: string | null;
  name?: string;
  description?: string;
  is_active?: boolean;
}

export interface ParentNodesResponse {
  success: boolean;
  count: number;
  nodes: InternalNode[];
}

export interface InternalTreeResponse {
  success: boolean;
  count: number;
  nodes: InternalNode[];
}

// ---------------------------
// API Endpoints
// ---------------------------
export const internalNodeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ✅ Create internal node
    createInternalNode: builder.mutation<
      InternalNode | InternalNode[],
      CreateInternalNodeDto | CreateInternalNodeDto[]
    >({
      query: (data) => ({
        url: `/internal-nodes`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["InternalNode"],
    }),

    // ✅ Get all internal nodes
    getInternalNodes: builder.query<InternalNode[], void>({
      query: () => `/internal-nodes`,
      providesTags: ["InternalNode"],
    }),

    // ✅ Get internal node by ID
    getInternalNodeById: builder.query<InternalNode, string>({
      query: (id) => `/internal-nodes/${id}`,
      providesTags: (result, error, id) => [{ type: "InternalNode", id }],
    }),

    // 🟢 Get user-assigned internal nodes by project
    getUserInternalNodesByProject: builder.query<
      { user_id: string; full_name: string; internal_nodes: InternalNode[] }[],
      string
    >({
      query: (projectId) => `/internal-nodes/project/${projectId}/user-nodes`,
      providesTags: ["InternalNode"],
    }),

    // ✅ Update internal node
    updateInternalNode: builder.mutation<
      InternalNode,
      { id: string; data: UpdateInternalNodeDto }
    >({
      query: ({ id, data }) => ({
        url: `/internal-nodes/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "InternalNode", id },
        "InternalNode",
      ],
    }),

    // ✅ Delete internal node
    deleteInternalNode: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/internal-nodes/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["InternalNode"],
    }),

    // ✅ Get top-level parent nodes
    getParentInternalNodes: builder.query<ParentNodesResponse, void>({
      query: () => `/internal-nodes/parent-nodes`,
      providesTags: ["InternalNode"],
    }),

    // ✅ Get full tree
    getInternalTree: builder.query<InternalTreeResponse, void>({
      query: () => `/internal-nodes/tree`,
      providesTags: ["InternalNode"],
    }),
  }),
  overrideExisting: false,
});

// ---------------------------
// Hooks Export
// ---------------------------
export const {
  useCreateInternalNodeMutation,
  useGetInternalNodesQuery,
  useGetInternalNodeByIdQuery,
  useUpdateInternalNodeMutation,
  useDeleteInternalNodeMutation,
  useGetParentInternalNodesQuery,
  useGetUserInternalNodesByProjectQuery,
  useGetInternalTreeQuery,
} = internalNodeApi;
