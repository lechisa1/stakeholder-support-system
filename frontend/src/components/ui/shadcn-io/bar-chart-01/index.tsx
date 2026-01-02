"use client";

import * as React from "react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

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

export const description = "Organization project counts";

/* =========================
   COMPONENT
   ========================= */
export function ChartBarInteractive() {
  const { data: dashboardData, isLoading, isError } = useGetDashboardStatsQuery();

  // State for selected year
  const [selectedYear, setSelectedYear] = React.useState<string>("all");

  // Generate year options from organization creation dates
  const yearOptions = React.useMemo(() => {
    if (!dashboardData?.data?.institutes) return [{ value: "all", label: "All Years" }];

    const years = new Set<number>();

    // Collect all years from organization creation dates
    dashboardData.data.institutes.forEach((institute: any) => {
      if (institute.created_at) {
        const year = new Date(institute.created_at).getFullYear();
        years.add(year);
      }
    });

    // Convert to array and sort
    const yearsArray = Array.from(years).sort();

    // If no years found, use current year
    if (yearsArray.length === 0) {
      const currentYear = new Date().getFullYear();
      yearsArray.push(currentYear);
    }

    // Add "all" option
    const options = [
      { value: "all", label: "All Years" }
    ];

    // Add years from earliest to most recent
    yearsArray.forEach(year => {
      options.push({ value: year.toString(), label: year.toString() });
    });

    // Add future years (up to 5 years from the latest)
    const latestYear = Math.max(...yearsArray);
    for (let i = 1; i <= 5; i++) {
      const futureYear = latestYear + i;
      options.push({
        value: futureYear.toString(),
        label: futureYear.toString()
      });
    }

    return options;
  }, [dashboardData]);

  // Transform data for chart - Filter organizations by creation year
  const chartData = React.useMemo(() => {
    if (!dashboardData?.data?.institutes) return [];

    return dashboardData.data.institutes
      .map((institute: any) => {
        const orgYear = institute.created_at
          ? new Date(institute.created_at).getFullYear()
          : null;

        // Check if organization should be included based on year filter
        const shouldInclude = selectedYear === "all" ||
          (orgYear && orgYear === parseInt(selectedYear));

        return {
          name: institute.name,
          projects: institute.projects?.length || 0,
          instituteId: institute.institute_id,
          createdYear: orgYear,
          createdDate: institute.created_at,
          shouldInclude,
        };
      })
      .filter(org => org.projects > 0 && org.shouldInclude) // Only show orgs with projects and matching year
      .sort((a, b) => b.projects - a.projects); // Sort by project count descending
  }, [dashboardData, selectedYear]);

  // Calculate totals for the select dropdown
  const totals = React.useMemo(() => {
    const totalProjects = chartData.reduce((sum, org) => sum + org.projects, 0);
    const totalOrganizations = chartData.length;

    return {
      totalProjects,
      totalOrganizations,
    };
  }, [chartData]);

  // Calculate total organizations for "All Years" option
  const totalAllOrganizations = React.useMemo(() => {
    if (!dashboardData?.data?.institutes) return 0;

    return dashboardData.data.institutes
      .filter((institute: any) => institute.projects?.length > 0)
      .length;
  }, [dashboardData]);

  // Calculate total projects for "All Years" option
  const totalAllProjects = React.useMemo(() => {
    if (!dashboardData?.data?.institutes) return 0;

    return dashboardData.data.institutes.reduce((sum: number, institute: any) => {
      return sum + (institute.projects?.length || 0);
    }, 0);
  }, [dashboardData]);

  // Chart configuration
  const chartConfig = {
    projects: {
      label: "Number of Projects",
      color: "hsl(var(--chart-1))",
    },
  } satisfies ChartConfig;

  const exportData = React.useMemo(() => {
    if (!chartData.length) return [];

    return chartData.map((org) => ({
      Organization: org.name,
      "Created Year": org.createdYear ?? "N/A",
      "Created Date": org.createdDate
        ? new Date(org.createdDate).toLocaleDateString()
        : "N/A",
      "Project Count": org.projects,
    }));
  }, [chartData]);


  if (isLoading) {
    return (
      <Card className="hover:shadow-lg transition-all duration-300 w-full h-full flex flex-col p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Loading organization data...</p>
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
            <p className="text-sm text-muted-foreground">No organization data available</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-lg transition-all duration-300 w-full h-full flex flex-col p-6">
      {/* Header */}
      <div className="flex flex-col items-stretch border-b pb-4 mb-4 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1">
          <h3 className="text-lg font-semibold">Organization Projects</h3>
          <p className="text-sm text-muted-foreground">
            {selectedYear === "all"
              ? "Number of projects across all organizations"
              : `Organizations created in ${selectedYear} and their projects`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() =>
              exportToCSV(
                exportData,
                `organizations_projects_${selectedYear}.csv`
              )
            }
            disabled={!exportData.length}
            className="h-8 rounded-lg border px-3 text-xs font-medium
             hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Export CSV
          </Button>

          {/* Year Filter - Now enabled with organization creation dates */}
          <Select
            value={selectedYear}
            onValueChange={setSelectedYear}
          >
            <SelectTrigger className="w-[180px] rounded-lg bg-white">
              <SelectValue placeholder="Select Year" />
            </SelectTrigger>

            <SelectContent className="rounded-xl bg-white">
              {yearOptions.map((yearOption) => {
                // Calculate totals for each year option
                let yearTotalProjects = 0;
                let yearTotalOrgs = 0;

                if (yearOption.value === "all") {
                  yearTotalProjects = totalAllProjects;
                  yearTotalOrgs = totalAllOrganizations;
                } else {
                  const year = parseInt(yearOption.value);
                  dashboardData.data.institutes.forEach((institute: any) => {
                    if (institute.created_at) {
                      const orgYear = new Date(institute.created_at).getFullYear();
                      if (orgYear === year) {
                        yearTotalOrgs++;
                        yearTotalProjects += institute.projects?.length || 0;
                      }
                    }
                  });
                }

                return (
                  <SelectItem
                    key={yearOption.value}
                    value={yearOption.value}
                    className="rounded-lg"
                  >
                    <div className="flex flex-col">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          {yearOption.label}
                        </span>
                      </div>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select></div>
      </div>

      {/* Chart */}
      <div className="flex-1 flex items-center justify-center min-h-0">
        {chartData.length > 0 ? (
          <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <BarChart
              accessibilityLayer
              data={chartData}
              margin={{
                left: 12,
                right: 12,
                top: 12,
                bottom: 12,
              }}
            >
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={10}
                interval={0}
                angle={-45}
                textAnchor="end"
                height={60}
                tickFormatter={(value) => {
                  // Truncate long organization names
                  if (value.length > 10) {
                    return value.substring(0, 10) + '...';
                  }
                  return value;
                }}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    className="w-[200px]"
                    nameKey="projects"
                    labelFormatter={(value) => {
                      const org = chartData.find(org => org.name === value);
                      return org?.name || value;
                    }}
                    formatter={(value, name) => [
                      `${value} project${value === 1 ? '' : 's'}`,
                      'Project Count'
                    ]}
                    labelClassName="font-semibold"
                    indicator="dot"
                  />
                }
              />
              <Bar
                dataKey="projects"
                fill={`var(--color-projects)`}
                radius={[4, 4, 0, 0]}
                barSize={40}
              />
            </BarChart>
          </ChartContainer>
        ) : (
          <div className="flex items-center justify-center h-64 w-full">
            <p className="text-sm text-muted-foreground">
              {selectedYear === "all"
                ? "No projects found for any organization"
                : `No organizations created in ${selectedYear} have projects`}
            </p>
          </div>
        )}
      </div>

      {/* Footer with summary stats */}
      {chartData.length > 0 && (
        <div className="flex flex-col items-start gap-2 text-sm pt-4 border-t">
          <div className="flex items-center gap-2 leading-none font-medium">
            <span>
              {selectedYear === "all"
                ? "All Organizations Summary"
                : `Organizations Created in ${selectedYear}`}
            </span>
          </div>

          {/* Summary Stats */}
          <div className="flex flex-wrap gap-4 mt-1 text-xs">
            <div className="flex items-center gap-1">
              <span className="font-medium">Organizations:</span>
              <span className="text-muted-foreground">{totals.totalOrganizations}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="font-medium">Total Projects:</span>
              <span className="text-muted-foreground">{totals.totalProjects}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="font-medium">Avg Projects/Org:</span>
              <span className="text-muted-foreground">
                {totals.totalOrganizations > 0
                  ? (totals.totalProjects / totals.totalOrganizations).toFixed(1)
                  : "0.0"}
              </span>
            </div>
            {selectedYear !== "all" && chartData[0]?.createdDate && (
              <div className="flex items-center gap-1">
                <span className="font-medium">Earliest Created:</span>
                <span className="text-muted-foreground">
                  {new Date(chartData[chartData.length - 1].createdDate).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}