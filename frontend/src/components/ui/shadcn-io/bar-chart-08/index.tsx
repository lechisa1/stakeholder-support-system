"use client";

import * as React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
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

export const description = "Requests created by priority filtered by project";

/* =========================
   DATA (PROJECT + PRIORITY) - MORE VARIED DATA
   ========================= */
const chartData = [
  // Project Alpha - High priority environment
  { project: "alpha", priority: "critical", requests: 32 },
  { project: "alpha", priority: "high", requests: 45 },
  { project: "alpha", priority: "medium", requests: 28 },
  { project: "alpha", priority: "low", requests: 12 },

  // Project Beta - Medium priority environment
  { project: "beta", priority: "critical", requests: 18 },
  { project: "beta", priority: "high", requests: 32 },
  { project: "beta", priority: "medium", requests: 42 },
  { project: "beta", priority: "low", requests: 24 },

  // Project Gamma - Low priority environment
  { project: "gamma", priority: "critical", requests: 8 },
  { project: "gamma", priority: "high", requests: 15 },
  { project: "gamma", priority: "medium", requests: 35 },
  { project: "gamma", priority: "low", requests: 28 },

  // Project Delta - Critical heavy environment
  { project: "delta", priority: "critical", requests: 48 },
  { project: "delta", priority: "high", requests: 36 },
  { project: "delta", priority: "medium", requests: 22 },
  { project: "delta", priority: "low", requests: 14 },

  // Project Epsilon - Balanced environment
  { project: "epsilon", priority: "critical", requests: 25 },
  { project: "epsilon", priority: "high", requests: 30 },
  { project: "epsilon", priority: "medium", requests: 38 },
  { project: "epsilon", priority: "low", requests: 20 },

  // Project Zeta - Low critical environment
  { project: "zeta", priority: "critical", requests: 12 },
  { project: "zeta", priority: "high", requests: 18 },
  { project: "zeta", priority: "medium", requests: 45 },
  { project: "zeta", priority: "low", requests: 32 },
];

/* =========================
   CHART CONFIG WITH DISTINCT COLORS
   ========================= */
const chartConfig = {
  requests: {
    label: "Requests",
  },
  critical: {
    label: "Critical",
    color: "hsl(0, 100%, 45%)", // Bright Red
  },
  high: {
    label: "High",
    color: "hsl(25, 100%, 50%)", // Orange
  },
  medium: {
    label: "Medium",
    color: "hsl(210, 100%, 50%)", // Blue
  },
  low: {
    label: "Low",
    color: "hsl(120, 100%, 35%)", // Green
  },
} satisfies ChartConfig;

/* =========================
   COMPONENT
   ========================= */
export function ChartBarMixed() {
  const [project, setProject] = React.useState("alpha");

  const filteredData = chartData.filter((item) => item.project === project);

  // Calculate trend based on priority distribution
  const getTrend = React.useMemo(() => {
    if (filteredData.length === 0)
      return { icon: Minus, text: "No trend data" };

    const critical =
      filteredData.find((d) => d.priority === "critical")?.requests || 0;
    const high = filteredData.find((d) => d.priority === "high")?.requests || 0;
    const medium =
      filteredData.find((d) => d.priority === "medium")?.requests || 0;
    const low = filteredData.find((d) => d.priority === "low")?.requests || 0;

    const highPriorityRatio =
      (critical + high) / (critical + high + medium + low);

    if (highPriorityRatio > 0.6) {
      return { icon: TrendingUp, text: "High priority focus" };
    } else if (highPriorityRatio > 0.4) {
      return { icon: TrendingUp, text: "Moderate high priorities" };
    } else if (highPriorityRatio > 0.2) {
      return { icon: Minus, text: "Balanced priorities" };
    } else {
      return { icon: TrendingDown, text: "Low priority focus" };
    }
  }, [filteredData]);

  // Get color for each bar based on priority
  const getBarFill = (priority: string) => {
    switch (priority) {
      case "critical":
        return "var(--color-critical)";
      case "high":
        return "var(--color-high)";
      case "medium":
        return "var(--color-medium)";
      case "low":
        return "var(--color-low)";
      default:
        return "var(--color-medium)";
    }
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-300 w-full h-full flex flex-col p-6">
      {/* Header */}
      <div className="flex items-center gap-2 pb-4 mb-4">
        <div className="grid flex-1 gap-1">
          <h3 className="text-lg font-semibold">Requests by Priority</h3>
          <p className="text-sm text-muted-foreground">
            Distribution of maintenance requests by priority level
          </p>
        </div>

        {/* Project Filter */}
        <Select value={project} onValueChange={setProject}>
          <SelectTrigger
            className="hidden w-[160px] rounded-lg sm:flex"
            aria-label="Select project"
          >
            <SelectValue placeholder="Select Project" />
          </SelectTrigger>
          <SelectContent className="rounded-xl bg-white">
            <SelectItem value="alpha">Project Alpha</SelectItem>
            <SelectItem value="beta">Project Beta</SelectItem>
            <SelectItem value="gamma">Project Gamma</SelectItem>
            <SelectItem value="delta">Project Delta</SelectItem>
            <SelectItem value="epsilon">Project Epsilon</SelectItem>
            <SelectItem value="zeta">Project Zeta</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Chart */}
      <div className="flex-1 flex items-center justify-center min-h-0">
        <ChartContainer config={chartConfig} className="h-[200px] w-full">
          <BarChart
            accessibilityLayer
            data={filteredData}
            layout="vertical"
            margin={{ left: 0 }}
          >
            <YAxis
              dataKey="priority"
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) =>
                chartConfig[value as keyof typeof chartConfig]?.label
              }
            />
            <XAxis dataKey="requests" type="number" hide />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />

            {/* <Bar dataKey="requests" radius={5} fill="var(--color-critical)" /> */}
            <Bar dataKey="requests" radius={5}>
              {filteredData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarFill(entry.priority)} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </div>

      {/* Footer with trend analysis */}
      <div className="flex flex-col items-start gap-2 text-sm pt-4 border-t">
        <div className="flex items-center gap-2 leading-none font-medium">
          {getTrend.text}
          <getTrend.icon className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none">
          {project === "alpha" &&
            "High-risk environment with many critical issues"}
          {project === "beta" &&
            "Moderate environment with focus on high/medium priorities"}
          {project === "gamma" &&
            "Stable environment with mostly low-medium priority issues"}
          {project === "delta" &&
            "Emergency situation with critical issues dominating"}
          {project === "epsilon" &&
            "Balanced priority distribution across all levels"}
          {project === "zeta" && "Minor issues dominate, few critical problems"}
        </div>

        {/* Color Legend */}
        <div className="flex flex-wrap gap-3 mt-2">
          {Object.entries(chartConfig)
            .filter(([key]) =>
              ["critical", "high", "medium", "low"].includes(key)
            )
            .map(([key, config]) => (
              <div key={key} className="flex items-center gap-1 text-xs">
                <div
                  className="w-3 h-3 rounded-sm"
                  style={{ backgroundColor: config.color }}
                />
                <span>{config.label}</span>
              </div>
            ))}
        </div>
      </div>
    </Card>
  );
}
