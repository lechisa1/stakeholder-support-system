import { baseApi } from "../baseApi";

// ----------------------
// Interfaces
// ----------------------

export interface ReRaiseAttachment {
  re_raise_id?: string;
  attachment_id: string;
  attachment?: any;
}

export interface IssueReRaise {
  re_raise_id: string;
  issue_id: string;
  reason?: string;
  re_raised_by?: string;
  re_raised_at?: string;
  created_at?: string;

  issue?: any;
  re_raiser?: any; // User
  attachments?: ReRaiseAttachment[];
}

export interface CreateReRaiseDto {
  issue_id: string;
  reason?: string;
  re_raised_by: string;
  re_raised_at: string;
  attachment_ids?: string[];
}

// ----------------------------------------------------
// Inject Re-Raise Endpoints
// ----------------------------------------------------
export const issueReRaiseApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ---------------------------------------------
    // POST – Re-Raise Issue
    // ---------------------------------------------
    reRaiseIssue: builder.mutation<IssueReRaise, CreateReRaiseDto>({
      query: (data) => ({
        url: `/issue-re-raises`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["IssueReRaise"],
    }),

    // ---------------------------------------------
    // GET – Re-Raises by Issue ID
    // ---------------------------------------------
    getReRaisesByIssueId: builder.query<IssueReRaise[], string>({
      query: (issue_id) => `/issue-re-raises/issue/${issue_id}`,
      providesTags: ["IssueReRaise"],
    }),

    // ---------------------------------------------
    // GET – Latest Re-Raise by Issue ID
    // ---------------------------------------------
    getLatestReRaiseByIssueId: builder.query<IssueReRaise, string>({
      query: (issue_id) => `/issue-re-raises/latest/${issue_id}`,
      providesTags: ["IssueReRaise"],
    }),

    // ---------------------------------------------
    // GET – Re-Raise by ID
    // ---------------------------------------------
    getReRaiseById: builder.query<IssueReRaise, string>({
      query: (re_raise_id) => `/issue-re-raises/id/${re_raise_id}`,
      providesTags: (result, error, id) => [{ type: "IssueReRaise", id }],
    }),

    // ---------------------------------------------
    // DELETE – Re-Raise
    // ---------------------------------------------
    deleteReRaise: builder.mutation<{ message?: string }, string>({
      query: (re_raise_id) => ({
        url: `/issue-re-raises/id/${re_raise_id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["IssueReRaise"],
    }),
  }),
  overrideExisting: false,
});

// ----------------------------------------------------
// Hook Exports
// ----------------------------------------------------
export const {
  useReRaiseIssueMutation,
  useGetReRaisesByIssueIdQuery,
  useGetLatestReRaiseByIssueIdQuery,
  useGetReRaiseByIdQuery,
  useDeleteReRaiseMutation,
} = issueReRaiseApi;
