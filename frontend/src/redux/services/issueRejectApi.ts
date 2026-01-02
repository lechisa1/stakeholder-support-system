import { baseApi } from "../baseApi";

// ----------------------
// Interfaces
// ----------------------

export interface RejectAttachment {
  reject_id?: string;
  attachment_id: string;
  attachment?: any;
}

export interface IssueReject {
  reject_id: string;
  issue_id: string;
  reason?: string;
  rejected_by?: string;
  rejected_at?: string;
  created_at?: string;

  issue?: any;
  rejector?: any; // User
  attachments?: RejectAttachment[];
}

export interface CreateRejectDto {
  issue_id: string;
  reason?: string;
  rejected_by: string;
  attachment_ids?: string[];
}

// ----------------------------------------------------
// Inject Reject Endpoints
// ----------------------------------------------------
export const issueRejectApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ---------------------------------------------
    // POST – Reject Issue
    // ---------------------------------------------
    rejectIssue: builder.mutation<IssueReject, CreateRejectDto>({
      query: (data) => ({
        url: `/issue-rejects`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["IssueReject"],
    }),

    // ---------------------------------------------
    // GET – Rejects by Issue ID
    // ---------------------------------------------
    getRejectsByIssueId: builder.query<IssueReject[], string>({
      query: (issue_id) => `/issue-rejects/issue/${issue_id}`,
      providesTags: ["IssueReject"],
    }),

    // ---------------------------------------------
    // GET – Latest Reject by Issue ID
    // ---------------------------------------------
    getLatestRejectByIssueId: builder.query<IssueReject, string>({
      query: (issue_id) => `/issue-rejects/latest/${issue_id}`,
      providesTags: ["IssueReject"],
    }),

    // ---------------------------------------------
    // GET – Reject by ID
    // ---------------------------------------------
    getRejectById: builder.query<IssueReject, string>({
      query: (reject_id) => `/issue-rejects/id/${reject_id}`,
      providesTags: (result, error, id) => [{ type: "IssueReject", id }],
    }),

    // ---------------------------------------------
    // DELETE – Reject
    // ---------------------------------------------
    deleteReject: builder.mutation<{ message?: string }, string>({
      query: (reject_id) => ({
        url: `/issue-rejects/id/${reject_id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["IssueReject"],
    }),
  }),
  overrideExisting: false,
});

// ----------------------------------------------------
// Hook Exports
// ----------------------------------------------------
export const {
  useRejectIssueMutation,
  useGetRejectsByIssueIdQuery,
  useGetLatestRejectByIssueIdQuery,
  useGetRejectByIdQuery,
  useDeleteRejectMutation,
} = issueRejectApi;
