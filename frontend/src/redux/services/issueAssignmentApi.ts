// src/redux/apis/issueAssignmentApi.ts
import { baseApi } from "../baseApi";

// ----------------------
// Interfaces
// ----------------------
export interface AssignmentAttachment {
  assignment_id?: string;
  attachment_id: string;
  attachment?: any;
  created_at?: string;
}

export interface IssueAssignment {
  assignment_id: string;
  issue_id: string;
  assignee_id: string;
  assigned_by: string;
  assigned_at: string;
  status: "pending" | "accepted" | "rejected" | "completed";
  remarks?: string;
  created_at?: string;
  updated_at?: string;
  assignee?: any; // User
  assigner?: any; // User
  issue?: any; // Issue
  attachments?: AssignmentAttachment[];
}

export interface CreateAssignmentDto {
  issue_id: string;
  assignee_id: string;
  assigned_by: string;
  remarks?: string;
  attachment_ids?: string[];
}

export interface UpdateAssignmentStatusDto {
  status?: "pending" | "accepted" | "rejected" | "completed";
  remarks?: string;
}

export interface RemoveAssignmentDto {
  removed_by: string;
  reason?: string;
}

export interface RemoveAssignmentResponse {
  message: string;
  removed_assignment: {
    assignment_id: string;
    issue_id: string;
    assignee_name: string;
    assigner_name: string;
    removed_by: string;
    reason?: string;
  };
}

// ----------------------------------------------------
// Inject Assignment Endpoints
// ----------------------------------------------------
export const issueAssignmentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ---------------------------------------------
    // POST – Assign Issue
    // ---------------------------------------------
    assignIssue: builder.mutation<IssueAssignment, CreateAssignmentDto>({
      query: (data) => ({
        url: `/assignments`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["IssueAssignment", "Issue"], // Also invalidate issue cache
    }),

    // ---------------------------------------------
    // DELETE – Remove Assignment
    // ---------------------------------------------
    removeAssignment: builder.mutation<
      RemoveAssignmentResponse,
      { assignment_id: string; data: RemoveAssignmentDto }
    >({
      query: ({ assignment_id, data }) => ({
        url: `/assignments/${assignment_id}`,
        method: "DELETE",
        body: data,
      }),
      invalidatesTags: (result, error, { assignment_id }) => [
        { type: "IssueAssignment", id: assignment_id },
        "Issue", // Invalidate issue cache as removal affects issue status
      ],
    }),

    // Add to your endpoints
    removeAssignmentByAssigneeAndIssue: builder.mutation<
      RemoveAssignmentResponse,
      { issue_id: string; assignee_id: string; data: RemoveAssignmentDto }
    >({
      query: ({ issue_id, assignee_id, data }) => ({
        url: `/assignments/issue/${issue_id}/assignee/${assignee_id}`,
        method: "DELETE",
        body: data,
      }),
      invalidatesTags: (result, error, { issue_id, assignee_id }) => [
        { type: "IssueAssignment", id: `issue-${issue_id}` },
        { type: "IssueAssignment", id: `user-${assignee_id}` },
        { type: "IssueAssignment", id: `latest-${issue_id}` },
        "Issue",
      ],
    }),

    // ---------------------------------------------
    // GET – Assignments by Issue ID
    // ---------------------------------------------
    getAssignmentsByIssueId: builder.query<IssueAssignment[], string>({
      query: (issue_id) => `/assignments/issue/${issue_id}`,
      providesTags: (result, error, issue_id) => [
        { type: "IssueAssignment", id: `issue-${issue_id}` },
      ],
    }),

    // ---------------------------------------------
    // GET – Latest Assignment by Issue ID
    // ---------------------------------------------
    getLatestAssignmentByIssueId: builder.query<IssueAssignment, string>({
      query: (issue_id) => `/assignments/latest/issue/${issue_id}`,
      providesTags: (result, error, issue_id) => [
        { type: "IssueAssignment", id: `latest-${issue_id}` },
      ],
    }),

    // ---------------------------------------------
    // GET – Assignment by ID
    // ---------------------------------------------
    getAssignmentById: builder.query<IssueAssignment, string>({
      query: (assignment_id) => `/assignments/${assignment_id}`,
      providesTags: (result, error, id) => [{ type: "IssueAssignment", id }],
    }),

    // ---------------------------------------------
    // GET – Assignments by User ID
    // ---------------------------------------------
    getAssignmentsByUserId: builder.query<IssueAssignment[], string>({
      query: (user_id) => `/assignments/user/${user_id}`,
      providesTags: (result, error, user_id) => [
        { type: "IssueAssignment", id: `user-${user_id}` },
      ],
    }),

    // ---------------------------------------------
    // PUT – Update Assignment Status
    // ---------------------------------------------
    updateAssignmentStatus: builder.mutation<
      IssueAssignment,
      { assignment_id: string; data: UpdateAssignmentStatusDto }
    >({
      query: ({ assignment_id, data }) => ({
        url: `/assignments/${assignment_id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { assignment_id }) => [
        { type: "IssueAssignment", id: assignment_id },
        { type: "IssueAssignment", id: `issue-${result?.issue_id}` },
        { type: "IssueAssignment", id: `user-${result?.assignee_id}` },
        { type: "IssueAssignment", id: `latest-${result?.issue_id}` },
        "Issue", // Invalidate issue cache as status might affect issue
      ],
    }),
  }),
  overrideExisting: false,
});

// Hook Exports
export const {
  useAssignIssueMutation,
  useGetAssignmentsByIssueIdQuery,
  useGetLatestAssignmentByIssueIdQuery,
  useGetAssignmentByIdQuery,
  useGetAssignmentsByUserIdQuery,
  useUpdateAssignmentStatusMutation,
  useRemoveAssignmentMutation,
  useRemoveAssignmentByAssigneeAndIssueMutation,
} = issueAssignmentApi;
