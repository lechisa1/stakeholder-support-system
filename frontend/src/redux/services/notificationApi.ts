// src/redux/apis/notificationApi.ts
import { baseApi } from "../baseApi";

// ----------------------
// Interfaces
// ----------------------
export interface Notification {
  notification_id: string;
  type: 
    | "ISSUE_CREATED"
    | "ISSUE_ASSIGNED"
    | "ISSUE_UNASSIGNED"
    | "ISSUE_RESOLVED"
    | "ISSUE_CONFIRMED"
    | "ISSUE_REJECTED"
    | "ISSUE_REOPENED"
    | "ISSUE_ESCALATED"
    | "ISSUE_COMMENTED"
    | "PASSWORD_UPDATED"
    | "LOGIN_ALERT"
    | "USER_DEACTIVATED"
    | "USER_REACTIVATED"
    | "PROFILE_UPDATED"
    | "SYSTEM_ALERT"
    | "BROADCAST_MESSAGE";
  sender_id?: string | null;
  receiver_id: string;
  issue_id?: string | null;
  project_id?: string | null;
  title: string;
  message: string;
  data?: Record<string, any>;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  is_read: boolean;
  read_at?: string | null;
  is_sent: boolean;
  sent_at?: string | null;
  channel: "IN_APP" | "EMAIL" | "SMS" | "PUSH" | "ALL";
  expires_at?: string | null;
  created_at: string;
  updated_at?: string;
  sender?: any; // User
  receiver?: any; // User
  issue?: any; // Issue
  project?: any; // Project
}

export interface NotificationStats {
  total: number;
  read: number;
  unread: number;
  by_type: Array<{ type: string; count: number }>;
  by_priority: Array<{ priority: string; count: number }>;
}

export interface MarkAsReadDto {
  notification_id: string;
}

export interface SendToParentHierarchyDto {
  sender_id: string;
  project_id: string;
  issue_id?: string;
  hierarchy_node_id?: string;
  message?: string;
  title?: string;
}

export interface SendToImmediateParentDto {
  sender_id: string;
  project_id: string;
  issue_id?: string;
  hierarchy_node_id?: string;
  message?: string;
  title?: string;
}

export interface NotifyIssueCreatorDto {
  issue_id: string;
  resolver_id: string;
  solution_details?: string;
}

export interface NotifySolverDto {
  issue_id: string;
  creator_id: string;
  is_confirmed: boolean;
  rejection_reason?: string;
}

export interface SendGeneralNotificationDto {
  sender_id?: string | null;
  receiver_ids: string[];
  type?: Notification["type"];
  title: string;
  message: string;
  priority?: Notification["priority"];
  channel?: Notification["channel"];
  data?: Record<string, any>;
  expires_at?: string;
}

export interface NotificationsQueryParams {
  is_read?: "true" | "false";
  type?: Notification["type"];
  page?: number;
  pageSize?: number;
  search?: string;
}

export interface NotificationsResponse {
  success: boolean;
  message: string;
  data: Notification[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    unreadCount: number;
  };
}

export interface ParentHierarchyResponse {
  success: boolean;
  message: string;
  data: {
    sent_count: number;
    sender_info?: {
      user_id: string;
      name: string;
      hierarchy_node_id?: string;
    };
    hierarchy_chain?: Array<{
      hierarchy_node_id: string;
      name: string;
      level?: number;
      project_id: string;
    }>;
    recipients: Array<{
      user_id: string;
      name: string;
      email: string;
      hierarchy_node_id?: string;
      hierarchy_node_name?: string;
      role?: string;
      role_id?: string;
    }>;
  };
}

// ----------------------------------------------------
// Inject Notification Endpoints
// ----------------------------------------------------
export const notificationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ---------------------------------------------
    // GET – Notification by ID
    // ---------------------------------------------
    getNotificationById: builder.query<Notification, string>({
      query: (id) => `/notifications/${id}`,
      transformResponse: (response: { data: Notification; success: boolean; message: string }) => response.data,
      providesTags: (result, error, id) => [{ type: "Notification", id }],
    }),

    // ---------------------------------------------
    // GET – Notifications by User ID with pagination
    // ---------------------------------------------
    getNotificationsByUserId: builder.query<NotificationsResponse, { userId: string; params?: NotificationsQueryParams }>({
      query: ({ userId, params }) => ({
        url: `/notifications/user/${userId}`,
        params: {
          ...params,
          // Convert booleans to strings for query params
          is_read: params?.is_read,
        },
      }),
      providesTags: ["Notification"],
    }),

    // ---------------------------------------------
    // GET – Notification Statistics
    // ---------------------------------------------
    getNotificationStats: builder.query<NotificationStats, void>({
      query: () => `/notifications/stats`,
      transformResponse: (response: { data: NotificationStats; success: boolean; message: string }) => response.data,
      providesTags: ["Notification"],
    }),

    // ---------------------------------------------
    // POST – Mark Notification as Read
    // ---------------------------------------------
    markNotificationAsRead: builder.mutation<Notification, MarkAsReadDto>({
      query: (data) => ({
        url: `/notifications/mark-read`,
        method: "POST",
        body: data,
      }),
      transformResponse: (response: { data: Notification; success: boolean; message: string }) => response.data,
      invalidatesTags: (result) => [
        { type: "Notification", id: result?.notification_id },
        "Notification",
      ],
    }),

    // ---------------------------------------------
    // POST – Mark All Notifications as Read
    // ---------------------------------------------
    markAllNotificationsAsRead: builder.mutation<{ updatedCount: number }, void>({
      query: () => ({
        url: `/notifications/mark-all-read`,
        method: "POST",
        body: {},
      }),
      transformResponse: (response: { data: { updatedCount: number }; success: boolean; message: string }) => response.data,
      invalidatesTags: ["Notification"],
    }),

    // ---------------------------------------------
    // POST – Send to Parent Hierarchy Users
    // ---------------------------------------------
    sendNotificationToParentHierarchyUsers: builder.mutation<ParentHierarchyResponse, SendToParentHierarchyDto>({
      query: (data) => ({
        url: `/notifications/send/parent-hierarchy`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Notification"],
    }),

    // ---------------------------------------------
    // POST – Send to Immediate Parent Hierarchy
    // ---------------------------------------------
    sendNotificationToImmediateParentHierarchy: builder.mutation<ParentHierarchyResponse, SendToImmediateParentDto>({
      query: (data) => ({
        url: `/notifications/send/immediate-parent`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Notification"],
    }),

    // ---------------------------------------------
    // POST – Notify Issue Creator When Solved
    // ---------------------------------------------
    notifyIssueCreatorWhenSolved: builder.mutation<Notification, NotifyIssueCreatorDto>({
      query: (data) => ({
        url: `/notifications/send/issue-solved`,
        method: "POST",
        body: data,
      }),
      transformResponse: (response: { data: Notification; success: boolean; message: string }) => response.data,
      invalidatesTags: ["Notification"],
    }),

    // ---------------------------------------------
    // POST – Notify Solver on Confirmation/Rejection
    // ---------------------------------------------
    notifySolverOnConfirmation: builder.mutation<Notification, NotifySolverDto>({
      query: (data) => ({
        url: `/notifications/send/solver-confirmation`,
        method: "POST",
        body: data,
      }),
      transformResponse: (response: { data: Notification; success: boolean; message: string }) => response.data,
      invalidatesTags: ["Notification"],
    }),

    // ---------------------------------------------
    // POST – Send General Notification
    // ---------------------------------------------
    sendGeneralNotification: builder.mutation<{ sent_count: number }, SendGeneralNotificationDto>({
      query: (data) => ({
        url: `/notifications/send/general`,
        method: "POST",
        body: data,
      }),
      transformResponse: (response: { data: { sent_count: number }; success: boolean; message: string }) => response.data,
      invalidatesTags: ["Notification"],
    }),

    // ---------------------------------------------
    // DELETE – Notification
    // ---------------------------------------------
    deleteNotification: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/notifications/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Notification"],
    }),
  }),
  overrideExisting: false,
});

// Hook Exports
export const {
  useGetNotificationByIdQuery,
  useLazyGetNotificationByIdQuery,
  useGetNotificationsByUserIdQuery,
  useLazyGetNotificationsByUserIdQuery,
  useGetNotificationStatsQuery,
  useMarkNotificationAsReadMutation,
  useMarkAllNotificationsAsReadMutation,
  useSendNotificationToParentHierarchyUsersMutation,
  useSendNotificationToImmediateParentHierarchyMutation,
  useNotifyIssueCreatorWhenSolvedMutation,
  useNotifySolverOnConfirmationMutation,
  useSendGeneralNotificationMutation,
  useDeleteNotificationMutation,
} = notificationApi;