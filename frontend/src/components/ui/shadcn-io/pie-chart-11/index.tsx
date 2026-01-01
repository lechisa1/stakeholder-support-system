"use client";

import * as React from "react";
import { Pie, PieChart, Label, Cell } from "recharts";

import {
  ChartConfig,
  ChartContainer,
  ChartStyle,
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

export const description =
  "Raised maintenance requests by priority filtered by project";

/* =========================
   COMPONENT
   ========================= */
export function ChartPieInteractive() {
  const id = "pie-project-priority";

  // Get dashboard data
  const { data: dashboardData, isLoading, isError } = useGetDashboardStatsQuery();

  // State for filters
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

  // Transform data for chart - Group by priority
  const { chartData, chartConfig, totalRaised } = React.useMemo(() => {
    if (!dashboardData || !selectedInstituteId) {
      return { chartData: [], chartConfig: {}, totalRaised: 0 };
    }

    // Get selected institute
    const selectedInstitute = dashboardData.data.institutes.find(
      (inst: any) => inst.institute_id === selectedInstituteId
    );

    if (!selectedInstitute) {
      return { chartData: [], chartConfig: {}, totalRaised: 0 };
    }

    // Get projects based on filter
    const projects = selectedProjectId
      ? selectedInstitute.projects.filter((p: any) => p.project_id === selectedProjectId)
      : selectedInstitute.projects;

    // Collect all issues and group by priority
    const priorityMap = new Map();

    projects.forEach((project: any) => {
      project.issues.forEach((issue: any) => {
        if (!issue.priority) return; // Skip issues without priority

        const priorityId = issue.priority_id;
        const priorityName = issue.priority.name;
        const priorityColor = issue.priority.color_value || "#cccccc"; // Default gray

        if (!priorityMap.has(priorityId)) {
          priorityMap.set(priorityId, {
            priorityId,
            name: priorityName,
            value: 0,
            color: priorityColor,
            description: issue.priority.description || ""
          });
        }

        priorityMap.get(priorityId).value += 1;
      });
    });

    // Convert map to array and sort by count descending
    const chartDataArray = Array.from(priorityMap.values())
      .map(item => ({
        ...item,
        status: item.name.toLowerCase().replace(/\s+/g, '_') // Create a status key from priority name
      }))
      .sort((a, b) => b.value - a.value);

    // Create dynamic chart config based on priorities
    const dynamicChartConfig: ChartConfig = {
      value: {
        label: "Requests",
      },
    };

    // Add each priority to chart config
    chartDataArray.forEach(item => {
      dynamicChartConfig[item.status] = {
        label: item.name,
        color: item.color,
      };
    });

    // Calculate total
    const total = chartDataArray.reduce((sum, item) => sum + item.value, 0);

    return {
      chartData: chartDataArray,
      chartConfig: dynamicChartConfig,
      totalRaised: total,
    };
  }, [dashboardData, selectedInstituteId, selectedProjectId]);

  // Get available projects for the selected institute
  const availableProjects = React.useMemo(() => {
    if (!dashboardData || !selectedInstituteId) return [];

    const institute = dashboardData.data.institutes.find(
      (inst: any) => inst.institute_id === selectedInstituteId
    );

    return institute?.projects || [];
  }, [dashboardData, selectedInstituteId]);

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
      Priority: item.name,
      Requests: item.value,
    }));
  }, [dashboardData, selectedInstituteId, selectedProjectId, chartData]);


  if (isLoading) {
    return (
      <Card
        data-chart={id}
        className="hover:shadow-lg transition-all duration-300 w-full h-full flex flex-col space-y-4 p-6"
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Loading priority data...</p>
          </div>
        </div>
      </Card>
    );
  }

  if (isError || !dashboardData?.data?.institutes?.length) {
    return (
      <Card
        data-chart={id}
        className="hover:shadow-lg transition-all duration-300 w-full h-full flex flex-col space-y-4 p-6"
      >
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

  return (
    <Card
      data-chart={id}
      className="hover:shadow-lg transition-all duration-300 w-full h-full flex flex-col space-y-4 p-6"
    >
      <ChartStyle id={id} config={chartConfig} />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="grid gap-1">
          <h3 className="text-lg font-semibold">
            Maintenance Support Requests
          </h3>
          <p className="text-sm text-muted-foreground">
            Raised requests by priority
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() =>
              exportToCSV(
                exportData,
                `requests_by_priority_${selectedInstituteId}.csv`
              )
            }
            disabled={!exportData.length}
            className="h-7 rounded-lg border px-3 text-xs font-medium
             hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Export CSV
          </Button>

          {/* Institute Filter */}
          <Select
            value={selectedInstituteId}
            onValueChange={(value) => {
              setSelectedInstituteId(value);
              setSelectedProjectId(null);
            }}
          >
            <SelectTrigger
              className="h-7 w-[160px] rounded-lg pl-2.5 bg-white"
              aria-label="Select organization"
            >
              <SelectValue placeholder="Select organization" />
            </SelectTrigger>
            <SelectContent align="end" className="rounded-xl bg-white">
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
                className="h-7 w-[160px] rounded-lg pl-2.5 bg-white"
                aria-label="Select project"
              >
                <SelectValue placeholder="Select project" />
              </SelectTrigger>
              <SelectContent align="end" className="rounded-xl bg-white">
                <SelectItem value="all" className="rounded-lg">
                  All Projects
                </SelectItem>
                {availableProjects.map((project: any) => (
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

      {/* Chart + Priority Legend */}
      <div className="flex justify-center items-center space-x-2">
        {chartData.length > 0 ? (
          <>
            <ChartContainer
              id={id}
              config={chartConfig}
              className="mx-auto aspect-square w-full max-w-[300px]"
            >
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  strokeWidth={5}
                >
                  {chartData.map((entry) => (
                    <Cell
                      key={entry.priorityId}
                      fill={entry.color}
                    />
                  ))}

                  <Label
                    content={({ viewBox }) => {
                      if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                        return (
                          <text
                            x={viewBox.cx}
                            y={viewBox.cy}
                            textAnchor="middle"
                            dominantBaseline="middle"
                          >
                            <tspan
                              x={viewBox.cx}
                              y={viewBox.cy}
                              className="fill-foreground text-3xl font-bold"
                            >
                              {totalRaised}
                            </tspan>
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy || 0) + 24}
                              className="fill-muted-foreground"
                            >
                              Total Issues
                            </tspan>
                          </text>
                        );
                      }
                    }}
                  />
                </Pie>
              </PieChart>
            </ChartContainer>

            {/* Priority Legend */}
            <div className="mx-auto aspect-square w-full max-w-[300px] flex items-center">
              <div className="rounded-xl">
                {chartData.map((item) => (
                  <div
                    key={item.priorityId}
                    className="rounded-lg [&_span]:flex mt-4"
                  >
                    <div className="flex items-center gap-2 text-xs">
                      <span
                        className="flex h-3 w-3 shrink-0 rounded-xs"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="font-medium">{item.name}</span>
                      <span className="text-muted-foreground ml-1">
                        ({item.value})
                      </span>
                    </div>

                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center w-full h-64">
            <p className="text-sm text-muted-foreground">
              No priority data available for selected filters
            </p>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      {chartData.length > 0 && (
        <div className="flex flex-wrap gap-4 mt-3 text-xs justify-center">
          <div className="flex items-center gap-1">
            <span className="font-medium">Total Issues:</span>
            <span className="text-muted-foreground">{totalRaised}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="font-medium">Priorities:</span>
            <span className="text-muted-foreground">{chartData.length}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="font-medium">Top Priority:</span>
            <span className="text-muted-foreground">
              {chartData.length > 0 ? chartData[0].name : "None"}
            </span>
          </div>
        </div>
      )}
    </Card>
  );
}