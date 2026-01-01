"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
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

// Helper functions
export const normalizeStatus = (status: string) => {
  if (status === "resolved" || status === "closed") return "resolved";
  if (status === "rejected") return "rejected";
  return "pending";
};

// Helper to format date for grouping with timezone correction
const getDayKey = (dateString: string) => {
  const date = new Date(dateString);
  // Use local date to avoid timezone issues
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().split('T')[0]; // YYYY-MM-DD
};

const getMonthKey = (dateString: string) => {
  const date = new Date(dateString);
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return `${localDate.getFullYear()}-${String(localDate.getMonth() + 1).padStart(2, '0')}`;
};

const getWeekKey = (dateString: string) => {
  const date = new Date(dateString);
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  const year = localDate.getFullYear();

  // Get week number
  const firstDayOfYear = new Date(year, 0, 1);
  const pastDaysOfYear = (localDate.getTime() - firstDayOfYear.getTime()) / 86400000;
  const weekNumber = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);

  return `${year}-W${String(weekNumber).padStart(2, '0')}`;
};

// Helper to determine optimal grouping based on date range
const determineOptimalGrouping = (dates: string[]): "day" | "week" | "month" => {
  if (dates.length === 0) return "month";

  const dateObjects = dates.map(d => new Date(d)).sort((a, b) => a.getTime() - b.getTime());
  const oldest = dateObjects[0];
  const newest = dateObjects[dateObjects.length - 1];

  const diffDays = (newest.getTime() - oldest.getTime()) / (1000 * 60 * 60 * 24);

  if (diffDays <= 30) return "day";
  if (diffDays <= 90) return "week";
  return "month";
};

// Helper to fill missing dates in the dataset
const fillMissingDates = (
  data: { date: string; pending: number; resolved: number; rejected: number }[],
  grouping: "day" | "week" | "month"
): { date: string; pending: number; resolved: number; rejected: number }[] => {
  if (data.length === 0) return [];

  const result = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const filledData = [];

  const startDate = new Date(result[0].date);
  const endDate = new Date(result[result.length - 1].date);

  let current = new Date(startDate);

  while (current <= endDate) {
    const dateStr = current.toISOString().split('T')[0];
    const monthStr = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`;

    let key: string;
    switch (grouping) {
      case "day":
        key = getDayKey(dateStr);
        break;
      case "week":
        key = getWeekKey(dateStr);
        // Move to next week
        current.setDate(current.getDate() + 7);
        break;
      case "month":
        key = monthStr;
        // Move to next month
        current.setMonth(current.getMonth() + 1);
        break;
    }

    // Find existing data for this period
    const existing = result.find(item => {
      if (grouping === "day") return getDayKey(item.date) === key;
      if (grouping === "week") return getWeekKey(item.date) === key;
      return getMonthKey(item.date) === key;
    });

    if (existing) {
      filledData.push(existing);
    } else {
      // Fill with zeros for missing periods
      filledData.push({
        date: grouping === "month" ? `${key}-01` : dateStr,
        pending: 0,
        resolved: 0,
        rejected: 0
      });
    }

    // Increment for day grouping
    if (grouping === "day") {
      current.setDate(current.getDate() + 1);
    }
  }

  return filledData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

/* =========================
   CHART CONFIG
   ========================= */
const chartConfig = {
  pending: {
    label: "Pending",
    color: "hsl(var(--chart-7))",
  },
  resolved: {
    label: "Resolved",
    color: "hsl(var(--chart-1))",
  },
  rejected: {
    label: "Rejected",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

/* =========================
   COMPONENT
   ========================= */
export function ChartAreaInteractive() {
  const { data: dashboardData, isLoading, isError } = useGetDashboardStatsQuery();

  const [selectedInstituteId, setSelectedInstituteId] = React.useState<string>("");
  const [selectedProjectId, setSelectedProjectId] = React.useState<string | null>(null);
  const [groupBy, setGroupBy] = React.useState<"day" | "week" | "month">("month");

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

    // Collect all issues with their creation dates
    const allIssues: any[] = [];
    const allDates: string[] = [];

    projects.forEach((project: any) => {
      project.issues.forEach((issue: any) => {
        allIssues.push({
          ...issue,
          normalizedStatus: normalizeStatus(issue.status)
        });
        allDates.push(issue.created_at);
      });
    });

    // Determine optimal grouping based on date range
    let optimalGrouping = determineOptimalGrouping(allDates);

    // Override with user selection if they've changed it
    const effectiveGrouping = groupBy || optimalGrouping;

    // Group issues by date
    const groupedData: Record<string, { pending: number; resolved: number; rejected: number; date: string }> = {};

    allIssues.forEach((issue) => {
      let key: string;
      let displayDate: string;

      switch (effectiveGrouping) {
        case "day":
          key = getDayKey(issue.created_at);
          displayDate = getDayKey(issue.created_at);
          break;
        case "week":
          key = getWeekKey(issue.created_at);
          // Use Monday of the week as display date
          const date = new Date(issue.created_at);
          const day = date.getDay();
          const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
          const monday = new Date(date.setDate(diff));
          displayDate = getDayKey(monday.toISOString());
          break;
        default: // month
          key = getMonthKey(issue.created_at);
          displayDate = `${key}-01`;
          break;
      }

      if (!groupedData[key]) {
        groupedData[key] = {
          pending: 0,
          resolved: 0,
          rejected: 0,
          date: displayDate
        };
      }

      if (issue.normalizedStatus === "pending") {
        groupedData[key].pending++;
      } else if (issue.normalizedStatus === "resolved") {
        groupedData[key].resolved++;
      } else if (issue.normalizedStatus === "rejected") {
        groupedData[key].rejected++;
      }
    });

    // Convert to array and sort by date
    let result = Object.values(groupedData)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Fill missing dates to ensure smooth chart
    result = fillMissingDates(result, effectiveGrouping);

    return result;
  }, [dashboardData, selectedInstituteId, selectedProjectId, groupBy]);

  // Auto-adjust grouping based on data span
  React.useEffect(() => {
    if (chartData.length > 0 && !groupBy) {
      const dates = chartData.map(item => item.date);
      const optimalGrouping = determineOptimalGrouping(dates);
      setGroupBy(optimalGrouping);
    }
  }, [chartData, groupBy]);

  const formatXAxisTick = (value: string) => {
    const date = new Date(value);

    switch (groupBy) {
      case "day":
        return `${date.getDate()} ${date.toLocaleDateString('en-US', { month: 'short' })}`;
      case "week":
        const weekEnd = new Date(date);
        weekEnd.setDate(date.getDate() + 6);
        const startDay = date.getDate();
        const endDay = weekEnd.getDate();
        const month = date.toLocaleDateString('en-US', { month: 'short' });
        return `${startDay}-${endDay} ${month}`;
      default: // month
        return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    }
  };

  const formatTooltipLabel = (value: string) => {
    const date = new Date(value);

    switch (groupBy) {
      case "day":
        return date.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      case "week":
        const weekEnd = new Date(date);
        weekEnd.setDate(date.getDate() + 6);
        return `Week of ${date.toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric'
        })} - ${weekEnd.toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric'
        })}`;
      default: // month
        return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
  };

  const exportData = React.useMemo(() => {
    if (!dashboardData || !selectedInstituteId || chartData.length === 0) {
      return [];
    }

    const institute = dashboardData.data.institutes.find(
      (i: any) => i.institute_id === selectedInstituteId
    );

    if (!institute) return [];

    const projects = selectedProjectId
      ? institute.projects.filter((p: any) => p.project_id === selectedProjectId)
      : institute.projects;

    const projectNames =
      selectedProjectId
        ? projects[0]?.name
        : "All Projects";

    return chartData.map((item) => ({
      Institute: institute.name,
      Project: projectNames,
      Period: item.date,
      Pending: item.pending,
      Resolved: item.resolved,
      Rejected: item.rejected,
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
      <div className="flex flex-col justify-start items-start 3xl:flex-row gap-4 pb-4 mb-4">
        <div className="grid flex-1 gap-1">
          <h3 className="text-lg font-semibold">
            Maintenance Support Requests
          </h3>
          <p className="text-sm text-muted-foreground">
            Pending, resolved, and rejected requests by project
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() =>
              exportToCSV(
                exportData,
                `maintenance_requests_${selectedInstituteId}_${groupBy}.csv`
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
            setGroupBy(null); // Reset grouping when institute changes
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
                setGroupBy(null); // Reset grouping when project changes
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

          {/* Group By Filter */}
          <Select value={groupBy || "auto"} onValueChange={(value: "day" | "week" | "month" | "auto") => {
            setGroupBy(value === "auto" ? null : value);
          }}>
            <SelectTrigger
              className="w-full sm:w-[140px] rounded-lg bg-white"
              aria-label="Group by"
            >
              <SelectValue placeholder="Group by" />
            </SelectTrigger>
            <SelectContent className="rounded-xl bg-white">
              <SelectItem value="auto" className="rounded-lg">Auto</SelectItem>
              <SelectItem value="day" className="rounded-lg">Daily</SelectItem>
              <SelectItem value="week" className="rounded-lg">Weekly</SelectItem>
              <SelectItem value="month" className="rounded-lg">Monthly</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 flex items-center justify-center min-h-0">
        {chartData.length > 0 ? (
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="fill-pending" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-pending)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-pending)"
                    stopOpacity={0.1}
                  />
                </linearGradient>

                <linearGradient id="fill-resolved" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-resolved)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-resolved)"
                    stopOpacity={0.1}
                  />
                </linearGradient>

                <linearGradient id="fill-rejected" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-rejected)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-rejected)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>

              <CartesianGrid vertical={false} />

              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={groupBy === "day" ? 32 : groupBy === "week" ? 24 : 8}
                tickFormatter={formatXAxisTick}
              />

              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    labelFormatter={formatTooltipLabel}
                    indicator="dot"
                  />
                }
              />

              <Area
                dataKey="pending"
                type="natural"
                fill="url(#fill-pending)"
                stroke="var(--color-pending)"
                stackId="a"
              />
              <Area
                dataKey="resolved"
                type="natural"
                fill="url(#fill-resolved)"
                stroke="var(--color-resolved)"
                stackId="a"
              />
              <Area
                dataKey="rejected"
                type="natural"
                fill="url(#fill-rejected)"
                stroke="var(--color-rejected)"
                stackId="a"
              />

              <ChartLegend
                content={(props) => (
                  <ChartLegendContent
                    payload={props.payload}
                    verticalAlign={props.verticalAlign}
                  />
                )}
              />
            </AreaChart>
          </ChartContainer>
        ) : (
          <div className="flex items-center justify-center h-64 w-full">
            <p className="text-sm text-muted-foreground">
              No data available for the selected filters
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}