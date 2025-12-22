// src/redux/baseApi.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const API_BASE_URL = import.meta.env.VITE_API_PUBLIC_BASE_URL;

// --- Base query with JWT from localStorage ---
const baseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  credentials: "same-origin",
  prepareHeaders: (headers) => {
    const token = localStorage.getItem("authToken"); // ✅ Read token

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    headers.set("Content-Type", "application/json");
    headers.set("Accept", "application/json");

    return headers;
  },
});

// --- Wrap to handle 401 globally ---
const baseQueryWithAuth = async (args: any, api: any, extraOptions: any) => {
  const result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    console.warn("⚠️ Unauthorized (401) — token invalid or expired.");
    // Clear token and user on 401
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithAuth,
  tagTypes: [
    "User",
    "Roles",
    "Permission",
    "Project",
    "Institute",
    "Hierarchy",
    "HierarchyNode",
    "InternalNode",
    "Issue",
    "IssueEscalation",
    "IssueResolution",
    "IssuePriority",
    "IssueAssignment",
    "IssueCategory",
    "Assignment",
    "Escalation",
    "Attachment",
    "IssueAttachment",
    "ProjectMetrics",
  ],
  endpoints: () => ({}),
});
