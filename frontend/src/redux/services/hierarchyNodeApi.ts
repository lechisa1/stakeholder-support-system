// src/redux/apis/hierarchyNodeApi.ts
import { baseApi } from "../baseApi";

// ---------------------------
// Interfaces
// ---------------------------
export interface HierarchyNode {
  hierarchy_node_id: string;
  project_id: string;
  parent_id?: string | null;
  name: string;
  description?: string;
  is_active?: boolean;
  level?: number;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
  project?: any;
  parent?: HierarchyNode | null;
  children?: HierarchyNode[];
}

export interface CreateHierarchyNodeDto {
  project_id: string;
  parent_id?: string | null;
  name: string;
  description?: string;
  is_active?: boolean;
  children?: CreateHierarchyNodeDto[];
}

export interface UpdateHierarchyNodeDto {
  project_id?: string;
  parent_id?: string | null;
  name?: string;
  description?: string;
  is_active?: boolean;
}

export interface ParentNodesResponse {
  success: boolean;
  project_id: string;
  count: number;
  nodes: HierarchyNode[];
}

// ---------------------------
// API Endpoints
// ---------------------------
export const hierarchyNodeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ✅ Create one or multiple hierarchy nodes (nested supported)
    createHierarchyNode: builder.mutation<
      HierarchyNode | HierarchyNode[],
      CreateHierarchyNodeDto | CreateHierarchyNodeDto[]
    >({
      query: (data) => ({
        url: `/hierarchy-nodes`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["HierarchyNode"],
    }),

    // ✅ Get all hierarchy nodes
    getHierarchyNodes: builder.query<HierarchyNode[], void>({
      query: () => `/hierarchy-nodes`,
      providesTags: ["HierarchyNode"],
    }),

    // Get hierarchy nodes by project ID
    getHierarchyNodesByProjectId: builder.query<HierarchyNode[], string>({
      query: (project_id) => `/hierarchy-nodes/project/${project_id}`,
      providesTags: ["HierarchyNode"],
    }),

    // ✅ Get a single hierarchy node by ID
    getHierarchyNodeById: builder.query<HierarchyNode, string>({
      query: (id) => `/hierarchy-nodes/${id}`,
      providesTags: (result, error, id) => [{ type: "HierarchyNode", id }],
    }),

    // ✅ Update a hierarchy node
    updateHierarchyNode: builder.mutation<
      HierarchyNode,
      { id: string; data: UpdateHierarchyNodeDto }
    >({
      query: ({ id, data }) => ({
        url: `/hierarchy-nodes/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "HierarchyNode", id },
        "HierarchyNode",
      ],
    }),

    // ✅ Delete a hierarchy node
    deleteHierarchyNode: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/hierarchy-nodes/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["HierarchyNode"],
    }),

    // ✅ Get top-level parent nodes for a given project_id
    getParentNodes: builder.query<ParentNodesResponse, string>({
      query: (project_id) => `/hierarchy-nodes/parent-nodes/${project_id}`,
      providesTags: ["HierarchyNode"],
    }),
  }),
  overrideExisting: false,
});

// ---------------------------n
// Hooks Export
// ---------------------------
export const {
  useCreateHierarchyNodeMutation,
  useGetHierarchyNodesQuery,
  useGetHierarchyNodesByProjectIdQuery,
  useGetHierarchyNodeByIdQuery,
  useUpdateHierarchyNodeMutation,
  useDeleteHierarchyNodeMutation,
  useGetParentNodesQuery,
} = hierarchyNodeApi;
