// src/redux/apis/issueEscalationApi.ts
import { baseApi } from "../baseApi";

// ----------------------
// Interfaces
// ----------------------
export interface EscalationAttachment {
  attachment_id: string;
  attachment: any;
}

export interface IssueEscalation {
  escalation_id: string;
  issue_id: string;
  from_tier: string;
  to_tier: string | null;
  reason?: string;
  escalated_by: string;
  escalated_at?: string;
  created_at?: string;
  updated_at?: string;
  escalator?: any;
  attachments?: EscalationAttachment[];
}

export interface IssueEscalationHistory {
  issue_escalation_history_id: string;
  issue_id: string;
  from_tier: string;
  to_tier: string | null;
  escalated_by: string;
  created_at: string;
  escalator?: any;
  issue?: any;
}

export interface EscalateIssueDto {
  issue_id: string;
  from_tier: string;
  to_tier: string | null;
  reason?: string;
  escalated_by: string;
  attachment_ids?: string[];
}

// ----------------------------------------------------
// Inject Escalation Endpoints
// ----------------------------------------------------
export const issueEscalationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ---------------------------------------------
    // POST – Escalate Issue
    // ---------------------------------------------
    escalateIssue: builder.mutation<IssueEscalation, EscalateIssueDto>({
      query: (data) => ({
        url: `/issue-escalations`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["IssueEscalation"],
    }),

    // ---------------------------------------------
    // GET – Escalations by Issue ID
    // ---------------------------------------------
    getEscalationsByIssueId: builder.query<IssueEscalation[], string>({
      query: (issue_id) => `/issue-escalations/issue/${issue_id}`,
      providesTags: ["IssueEscalation"],
    }),

    // ---------------------------------------------
    // GET – Escalation History
    // ---------------------------------------------
    getEscalationHistoryByIssueId: builder.query<
      IssueEscalationHistory[],
      string
    >({
      query: (issue_id) => `/issue-escalations/history/${issue_id}`,
      providesTags: ["IssueEscalation"],
    }),

    // ---------------------------------------------
    // GET – Escalation by ID
    // ---------------------------------------------
    getEscalationById: builder.query<IssueEscalation, string>({
      query: (id) => `/issue-escalations/id/${id}`,
      providesTags: (result, error, id) => [{ type: "IssueEscalation", id }],
    }),

    // ---------------------------------------------
    // DELETE – Escalation
    // ---------------------------------------------
    deleteEscalation: builder.mutation<{ message?: string }, string>({
      query: (id) => ({
        url: `/issue-escalations/id/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["IssueEscalation"],
    }),
  }),
  overrideExisting: false,
});

// Export Hooks
export const {
  useEscalateIssueMutation,
  useGetEscalationsByIssueIdQuery,
  useGetEscalationHistoryByIssueIdQuery,
  useGetEscalationByIdQuery,
  useDeleteEscalationMutation,
} = issueEscalationApi;
