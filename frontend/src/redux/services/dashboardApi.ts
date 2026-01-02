import { baseApi } from "../baseApi";
import {
  DashboardQueryParams,
  DashboardResponse,
  DashboardSummary,
} from "../types/dashboard";

export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get Dashboard Statistics
    getDashboardStats: builder.query<
      DashboardResponse,
      DashboardQueryParams | void
    >({
      query: (params) => ({
        url: "/dashboard/stats",
        method: "GET",
        params: params || {}, 
      }),
      // Optional: Add caching/refetching behavior
      providesTags: ["Dashboard"],
      // Optional: Transform the response if needed
      transformResponse: (response: any) => {
        return {
          success: response.success,
          message: response.message,
          data: response.data || {
            summary: {
              total_institutes: 0,
              total_projects: 0,
              total_issues: 0,
            },
            institutes: [],
          },
        };
      },
    }),

    // Refresh Dashboard Data (if you want a mutation to force refresh)
    refreshDashboardStats: builder.mutation<
      DashboardResponse,
      DashboardQueryParams | void
    >({
      query: (params) => ({
        url: "/dashboard/stats",
        method: "GET",
        params: params || {},
      }),
      invalidatesTags: ["Dashboard"],
      transformResponse: (response: any) => {
        return {
          success: response.success,
          message: response.message,
          data: response.data || {
            summary: {
              total_institutes: 0,
              total_projects: 0,
              total_issues: 0,
            },
            institutes: [],
          },
        };
      },
    }),

    // Get Dashboard Summary Only (if you want a separate endpoint)
    getDashboardSummary: builder.query<DashboardSummary, void>({
      query: () => ({
        url: "/dashboard/stats/summary", // You'll need to create this endpoint
        method: "GET",
      }),
      providesTags: ["Dashboard"],
      transformResponse: (response: any) => {
        return (
          response.data?.summary || {
            total_institutes: 0,
            total_projects: 0,
            total_issues: 0,
          }
        );
      },
    }),
  }),

  // Optional: Override the default tag types
  overrideExisting: false,
});

export const {
  useGetDashboardStatsQuery,
  useLazyGetDashboardStatsQuery,
  useRefreshDashboardStatsMutation,
  useGetDashboardSummaryQuery,
} = dashboardApi;
