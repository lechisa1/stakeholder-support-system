// src/redux/apis/issueApi.ts
import { baseApi } from "../baseApi";

// Issue interface (matches backend Issue model)
export interface IssuesByHierarchyAndProjectParams {
  hierarchy_node_id: string;
  project_id: string;
}

// New interface for multiple pairs
export interface IssuesByMultiplePairsParams {
  pairs: Array<{
    project_id: string;
    hierarchy_node_id: string;
  }>;
}

export interface IssueByTicketNumberParams {
  ticket_number: string;
}

export interface Issue {
  issue_id: string;
  institute_project_id?: string | null;
  title: string;
  description?: string;
  issue_category_id?: string | null;
  hierarchy_node_id?: string | null;
  priority_id?: string | null;
  reported_by: string;
  assigned_to?: string | null;
  action_taken?: string | null;
  url_path?: string | null;
  issue_description?: string | null;
  issue_occured_time?: string | null;
  status?: string;
  created_at?: string;
  updated_at?: string;
  resolved_at?: string | null;
  closed_at?: string | null;
  attachments?: { attachment_id: string; attachment: any }[];
  category?: any;
  priority?: any;
  reporter?: any;
  assignee?: any;
  instituteProject?: any;
  hierarchyNode?: any;
}
// In src/redux/apis/issueApi.ts

export interface AcceptIssueDto {
  issue_id: string;
}

export interface ConfirmIssueDto {
  issue_id: string;
}

// DTO for creating/updating an Issue
export interface CreateIssueDto {
  institute_project_id?: string;
  title: string;
  description?: string;
  issue_category_id?: string;
  hierarchy_node_id?: string;
  priority_id?: string;
  reported_by: string;
  assigned_to?: string;
  action_taken?: string;
  url_path?: string;
  issue_description?: string;
  issue_occured_time?: string;
  status?: string;
  attachment_ids?: string[]; // array of attachment UUIDs
}

// Inject endpoints into the base API
export const issueApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getIssues: builder.query<Issue[], void>({
      query: () => `/issues`,
      providesTags: ["Issue"],
    }),
    getIssueById: builder.query<Issue, string>({
      query: (id) => `/issues/${id}`,
      providesTags: (result, error, id) => [{ type: "Issue", id }],
    }),
    getIssueByTicketNumber: builder.query<Issue, string>({
      query: (ticket_number) => `/issues/ticket/${ticket_number}`,
      providesTags: (result, error, ticket_number) => [
        { type: "Issue", id: ticket_number },
      ],
    }),
    getIssuesByUserId: builder.query<Issue[], string>({
      query: (userId) => `/issues/user/${userId}`,
      providesTags: ["Issue"],
    }),

    // ⭐ NEW — Get issues assigned via IssueAssignment
    getAssignedIssues: builder.query<Issue[], string>({
      query: (user_id) => `/issues/assigned/${user_id}`,
      providesTags: ["Issue"],
    }),

    getIssuesByHierarchyAndProject: builder.query<
      Issue[],
      IssuesByHierarchyAndProjectParams
    >({
      query: ({ hierarchy_node_id, project_id }) =>
        `/issues/hierarchy/${hierarchy_node_id}/project/${project_id}`,
      providesTags: ["Issue"],
    }),
    // NEW: Get issues by multiple pairs
    getIssuesByMultiplePairs: builder.query<
      Issue[],
      IssuesByMultiplePairsParams & { user_id: string }
    >({
      query: ({ pairs, user_id }) => {
        // Encode the pairs array as a URL parameter
        const encodedPairs = encodeURIComponent(JSON.stringify(pairs));
        return `issues/issues-by-pairs/${encodedPairs}/user/${user_id}`;
      },
      providesTags: ["Issue"],
    }),

    // New endpoint: Get escalated issues with null tier
    getEscalatedIssuesWithNullTier: builder.query<Issue[], void>({
      query: () => `/issues/escalated/null-tier`,
      providesTags: ["Issue"], // Refresh when needed
    }),

    createIssue: builder.mutation<Issue, CreateIssueDto>({
      query: (data) => ({
        url: `/issues`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Issue"],
    }),
    acceptIssue: builder.mutation<
      { success: boolean; message: string },
      AcceptIssueDto
    >({
      query: (data) => ({
        url: `/issues/accept`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Issue"], // invalidate issues to refresh queries
    }),

    confirmIssueResolved: builder.mutation<
      { success: boolean; message: string },
      ConfirmIssueDto
    >({
      query: (data) => ({
        url: `/issues/confirm`, // ensure this matches your backend route
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Issue"], // refresh related queries
    }),

    updateIssue: builder.mutation<
      Issue,
      { id: string; data: Partial<CreateIssueDto> }
    >({
      query: ({ id, data }) => ({
        url: `/issues/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Issue", id }],
    }),
    deleteIssue: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/issues/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Issue"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetIssuesQuery,
  useGetIssueByIdQuery,
  useGetIssueByTicketNumberQuery,
  useGetIssuesByUserIdQuery,
  useGetAssignedIssuesQuery,
  useGetEscalatedIssuesWithNullTierQuery,
  useCreateIssueMutation,
  useAcceptIssueMutation,
  useConfirmIssueResolvedMutation,
  useUpdateIssueMutation,
  useDeleteIssueMutation,
  useGetIssuesByHierarchyAndProjectQuery,
  useGetIssuesByMultiplePairsQuery, // NEW: Export the new hook
} = issueApi;
