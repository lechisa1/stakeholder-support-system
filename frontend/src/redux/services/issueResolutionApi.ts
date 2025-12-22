// src/redux/apis/issueResolutionApi.ts
import { baseApi } from "../baseApi";

// ----------------------
// Interfaces
// ----------------------
export interface ResolutionAttachment {
  resolution_id?: string;
  attachment_id: string;
  attachment?: any;
}

export interface IssueResolution {
  resolution_id: string;
  issue_id: string;
  reason?: string;
  resolved_by: string;
  resolved_at?: string;
  created_at?: string;
  updated_at?: string;
  resolver?: any; // User
  attachments?: ResolutionAttachment[];
}

export interface CreateResolutionDto {
  issue_id: string;
  reason?: string;
  resolved_by: string;
  attachment_ids?: string[];
}

// ----------------------------------------------------
// Inject Resolution Endpoints
// ----------------------------------------------------
export const issueResolutionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ---------------------------------------------
    // POST – Resolve Issue
    // ---------------------------------------------
    resolveIssue: builder.mutation<IssueResolution, CreateResolutionDto>({
      query: (data) => ({
        url: `/issue-resolutions`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["IssueResolution"],
    }),

    // ---------------------------------------------
    // GET – Resolutions by Issue ID
    // ---------------------------------------------
    getResolutionsByIssueId: builder.query<IssueResolution[], string>({
      query: (issue_id) => `/issue-resolutions/issue/${issue_id}`,
      providesTags: ["IssueResolution"],
    }),

    // ---------------------------------------------
    // GET – Latest Resolution by Issue ID
    // ---------------------------------------------
    getLatestResolutionByIssueId: builder.query<IssueResolution, string>({
      query: (issue_id) => `/issue-resolutions/latest/${issue_id}`,
      providesTags: ["IssueResolution"],
    }),

    // ---------------------------------------------
    // GET – Resolution by ID
    // ---------------------------------------------
    getResolutionById: builder.query<IssueResolution, string>({
      query: (resolution_id) => `/issue-resolutions/id/${resolution_id}`,
      providesTags: (result, error, id) => [{ type: "IssueResolution", id }],
    }),

    // ---------------------------------------------
    // DELETE – Resolution
    // ---------------------------------------------
    deleteResolution: builder.mutation<{ message?: string }, string>({
      query: (resolution_id) => ({
        url: `/issue-resolutions/id/${resolution_id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["IssueResolution"],
    }),
  }),
  overrideExisting: false,
});

// Hook Exports
export const {
  useResolveIssueMutation,
  useGetResolutionsByIssueIdQuery,
  useGetLatestResolutionByIssueIdQuery,
  useGetResolutionByIdQuery,
  useDeleteResolutionMutation,
} = issueResolutionApi;
