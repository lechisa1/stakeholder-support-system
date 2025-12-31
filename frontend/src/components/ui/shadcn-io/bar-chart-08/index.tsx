"use client";

import * as React from "react";
import { TrendingUp, TrendingDown, Minus, AlertCircle, CheckCircle, Clock, XCircle, RefreshCw, ArrowUpRight, ArrowRight } from "lucide-react";
import { Bar, BarChart, Cell, XAxis, YAxis } from "recharts";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "../../chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../select";
import { Card } from "../../card";
import { useGetDashboardStatsQuery } from "../../../../redux/services/dashboardApi";
import { Button } from "../../cn/button";
import { exportToCSV } from "../../../../utils/dashboardHelper";

/* =========================
   CHART CONFIG WITH ALL STATUS COLORS
   ========================= */
const chartConfig = {
  requests: {
    label: "Requests",
  },
  pending: {
    label: "Pending",
    color: "hsl(45, 100%, 50%)", // Yellow/Orange
    icon: Clock,
  },
  in_progress: {
    label: "In Progress",
    color: "hsl(210, 100%, 50%)", // Blue
    icon: RefreshCw,
  },
  rejected: {
    label: "Rejected",
    color: "hsl(0, 100%, 45%)", // Red
    icon: XCircle,
  },
  closed: {
    label: "Closed",
    color: "hsl(0, 0%, 60%)", // Gray
    icon: CheckCircle,
  },
  re_raised: {
    label: "Re-raised",
    color: "hsl(270, 100%, 60%)", // Purple
    icon: ArrowUpRight,
  },
  escalated: {
    label: "Escalated",
    color: "hsl(0, 80%, 50%)", // Dark Red
    icon: AlertCircle,
  },
  resolved: {
    label: "Resolved",
    color: "hsl(120, 100%, 35%)", // Green
    icon: CheckCircle,
  },
} satisfies ChartConfig;


// Helper to get status display name
const getStatusDisplayName = (status: string): string => {
  const statusMap: Record<string, string> = {
    pending: "Pending",
    in_progress: "In Progress",
    rejected: "Rejected",
    closed: "Closed",
    re_raised: "Re-raised",
    escalated: "Escalated",
    resolved: "Resolved",
  };
  return statusMap[status] || status;
};

/* =========================
   COMPONENT
   ========================= */
export function ChartBarMixed() {
  const { data: dashboardData, isLoading, isError } = useGetDashboardStatsQuery();

  const [selectedInstituteId, setSelectedInstituteId] = React.useState<string>("");
  const [selectedProjectId, setSelectedProjectId] = React.useState<string | null>(null);

  // Set default institute when data loads
  React.useEffect(() => {
    if (dashboardData?.data?.institutes?.length > 0) {
      const firstInstitute = dashboardData.data.institutes[0];
      if (!selectedInstituteId && firstInstitute) {
        setSelectedInstituteId(firstInstitute.institute_id);
      }
    }
  }, [dashboardData, selectedInstituteId]);

  // Transform data for chart
  const chartData = React.useMemo(() => {
    if (!dashboardData || !selectedInstituteId) return [];

    // Get selected institute
    const selectedInstitute = dashboardData.data.institutes.find(
      (inst: any) => inst.institute_id === selectedInstituteId
    );

    if (!selectedInstitute) return [];

    // Get projects
    const projects = selectedProjectId
      ? selectedInstitute.projects.filter((p: any) => p.project_id === selectedProjectId)
      : selectedInstitute.projects;

    // Collect all issues and count by status
    const statusCounts: Record<string, number> = {
      pending: 0,
      in_progress: 0,
      rejected: 0,
      closed: 0,
      re_raised: 0,
      escalated: 0,
      resolved: 0,
    };

    projects.forEach((project: any) => {
      project.issues.forEach((issue: any) => {
        const status = issue.status.toLowerCase();
        if (statusCounts.hasOwnProperty(status)) {
          statusCounts[status]++;
        } else {
          // If status is not in our predefined list, add it
          statusCounts[status] = (statusCounts[status] || 0) + 1;
        }
      });
    });

    // Convert to chart data format
    return Object.entries(statusCounts)
      .filter(([_, count]) => count > 0) // Only include statuses with data
      .map(([status, requests]) => ({
        status,
        requests,
        displayName: getStatusDisplayName(status),
      }))
      .sort((a, b) => b.requests - a.requests); // Sort by request count descending
  }, [dashboardData, selectedInstituteId, selectedProjectId]);

  // Calculate trend based on status distribution
  const getTrend = React.useMemo(() => {
    if (chartData.length === 0) {
      return {
        icon: Minus,
        text: "No issues found",
        description: "No maintenance requests for selected filters"
      };
    }

    const totalRequests = chartData.reduce((sum, item) => sum + item.requests, 0);

    // Count active issues (pending, in_progress, escalated, re_raised)
    const activeIssues = chartData
      .filter(item => ['pending', 'in_progress', 'escalated', 're_raised'].includes(item.status))
      .reduce((sum, item) => sum + item.requests, 0);

    // Count completed issues (resolved, closed)
    const completedIssues = chartData
      .filter(item => ['resolved', 'closed'].includes(item.status))
      .reduce((sum, item) => sum + item.requests, 0);

    const activeRatio = activeIssues / totalRequests;
    const completionRatio = completedIssues / totalRequests;

    if (completionRatio > 0.7) {
      return {
        icon: CheckCircle,
        text: "High completion rate",
        description: "Most issues are resolved or closed"
      };
    } else if (activeRatio > 0.6) {
      return {
        icon: AlertCircle,
        text: "Many active issues",
        description: "High number of pending or in-progress issues"
      };
    } else if (chartData.find(item => item.status === 'escalated')?.requests || 0 > totalRequests * 0.3) {
      return {
        icon: ArrowUpRight,
        text: "High escalation rate",
        description: "Many issues require escalation"
      };
    } else if (completionRatio > 0.4) {
      return {
        icon: TrendingUp,
        text: "Good progress",
        description: "Making steady progress on issue resolution"
      };
    } else {
      return {
        icon: Minus,
        text: "Needs attention",
        description: "Requires focus on issue resolution"
      };
    }
  }, [chartData]);

  // Get color for each bar based on status
  const getBarFill = (status: string) => {
    const statusConfig = chartConfig[status as keyof typeof chartConfig];
    return statusConfig?.color || "var(--color-medium)";
  };

  // Get icon for each status
  const getStatusIcon = (status: string) => {
    const statusConfig = chartConfig[status as keyof typeof chartConfig];
    const IconComponent = (statusConfig as any)?.icon || AlertCircle;
    return <IconComponent className="h-3 w-3" />;
  };

  const exportData = React.useMemo(() => {
    if (!dashboardData || !selectedInstituteId || chartData.length === 0) {
      return [];
    }

    const institute = dashboardData.data.institutes.find(
      (i: any) => i.institute_id === selectedInstituteId
    );

    if (!institute) return [];

    const projectName = selectedProjectId
      ? institute.projects.find((p: any) => p.project_id === selectedProjectId)?.name
      : "All Projects";

    return chartData.map((item) => ({
      Institute: institute.name,
      Project: projectName || "All Projects",
      Status: item.displayName,
      Requests: item.requests,
    }));
  }, [dashboardData, selectedInstituteId, selectedProjectId, chartData]);


  if (isLoading) {
    return (
      <Card className="hover:shadow-lg transition-all duration-300 w-full h-full flex flex-col p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Loading chart data...</p>
          </div>
        </div>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="hover:shadow-lg transition-all duration-300 w-full h-full flex flex-col p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-sm text-red-500 mb-2">Error loading chart data</p>
            <button
              onClick={() => window.location.reload()}
              className="text-sm text-primary hover:underline"
            >
              Retry
            </button>
          </div>
        </div>
      </Card>
    );
  }

  if (!dashboardData?.data?.institutes?.length) {
    return (
      <Card className="hover:shadow-lg transition-all duration-300 w-full h-full flex flex-col p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">No data available</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-lg transition-all duration-300 w-full h-full flex flex-col p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pb-4 mb-4">
        <div className="grid flex-1 gap-1">
          <h3 className="text-lg font-semibold">Requests by Status</h3>
          <p className="text-sm text-muted-foreground">
            Distribution of maintenance requests by current status
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() =>
              exportToCSV(
                exportData,
                `requests_by_status_${selectedInstituteId}.csv`
              )
            }
            disabled={!exportData.length}
            className="rounded-lg border px-4 py-2 text-sm font-medium
             hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Export CSV
          </Button>

          {/* Institute Filter */}
          <Select value={selectedInstituteId} onValueChange={(value) => {
            setSelectedInstituteId(value);
            setSelectedProjectId(null);
          }}>
            <SelectTrigger
              className="w-full sm:w-[180px] rounded-lg bg-white"
              aria-label="Select organization"
            >
              <SelectValue placeholder="Select organization" />
            </SelectTrigger>
            <SelectContent className="rounded-xl bg-white">
              {dashboardData.data.institutes.map((institute: any) => (
                <SelectItem
                  key={institute.institute_id}
                  value={institute.institute_id}
                  className="rounded-lg"
                >
                  {institute.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Project Filter */}
          {selectedInstituteId && (
            <Select
              value={selectedProjectId || "all"}
              onValueChange={(value) => {
                setSelectedProjectId(value === "all" ? null : value);
              }}
            >
              <SelectTrigger
                className="w-full sm:w-[180px] rounded-lg bg-white"
                aria-label="Select project"
              >
                <SelectValue placeholder="Select project" />
              </SelectTrigger>
              <SelectContent className="rounded-xl bg-white">
                <SelectItem value="all" className="rounded-lg">
                  All Projects
                </SelectItem>
                {dashboardData.data.institutes
                  .find((inst: any) => inst.institute_id === selectedInstituteId)
                  ?.projects.map((project: any) => (
                    <SelectItem
                      key={project.project_id}
                      value={project.project_id}
                      className="rounded-lg"
                    >
                      {project.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 flex items-center justify-center min-h-0">
        {chartData.length > 0 ? (
          <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <BarChart
              accessibilityLayer
              data={chartData}
              layout="vertical"
              margin={{ left: 0, right: 20 }}
            >
              <YAxis
                dataKey="displayName"
                type="category"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                width={120}
                tickFormatter={(value) => value}
              />
              <XAxis
                dataKey="requests"
                type="number"
                axisLine={false}
                tickLine={false}
                tickMargin={5}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    hideLabel
                    formatter={(value) => [`${value} requests`, 'Count']}
                  />
                }
              />

              <Bar dataKey="requests" radius={5}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={getBarFill(entry.status)}
                  />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        ) : (
          <div className="flex items-center justify-center h-64 w-full">
            <p className="text-sm text-muted-foreground">
              No data available for the selected filters
            </p>
          </div>
        )}
      </div>

      {/* Footer with trend analysis */}
      <div className="flex flex-col items-start gap-2 text-sm pt-4 border-t">
        <div className="flex items-center gap-2 leading-none font-medium">
          <getTrend.icon className="h-4 w-4" />
          {getTrend.text}
        </div>
        <div className="text-muted-foreground leading-none">
          {getTrend.description}
        </div>

        {/* Color Legend */}
        <div className="flex flex-wrap gap-3 mt-2">
          {chartData.map((item) => {
            const statusConfig = chartConfig[item.status as keyof typeof chartConfig];
            if (!statusConfig) return null;

            return (
              <div key={item.status} className="flex items-center gap-1 text-xs">
                <div
                  className="w-3 h-3 rounded-sm"
                  style={{ backgroundColor: statusConfig.color }}
                />
                <span className="flex items-center gap-1">
                  {/* {getStatusIcon(item.status)} */}
                  <span>{item.displayName}</span>
                  <span className="text-muted-foreground">({item.requests})</span>
                </span>
              </div>
            );
          })}
        </div>

        {/* Summary Stats */}
        {chartData.length > 0 && (
          <div className="flex flex-wrap gap-4 mt-3 text-xs">
            <div className="flex items-center gap-1">
              <span className="font-medium">Total Issues:</span>
              <span className="text-muted-foreground">
                {chartData.reduce((sum, item) => sum + item.requests, 0)}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="font-medium">Active:</span>
              <span className="text-muted-foreground">
                {chartData
                  .filter(item => ['pending', 'in_progress', 'escalated', 're_raised'].includes(item.status))
                  .reduce((sum, item) => sum + item.requests, 0)}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="font-medium">Completed:</span>
              <span className="text-muted-foreground">
                {chartData
                  .filter(item => ['resolved', 'closed'].includes(item.status))
                  .reduce((sum, item) => sum + item.requests, 0)}
              </span>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}