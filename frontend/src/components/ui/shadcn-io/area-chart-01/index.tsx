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

export const description = "Maintenance support requests by project and status";

/* =========================
   DATA (3 PROJECTS - FULL YEAR 2024)
   ========================= */
const chartData = [
  // Project Alpha - January to December 2024
  {
    date: "2024-01-01",
    project: "alpha",
    pending: 15,
    resolved: 25,
    rejected: 4,
  },
  {
    date: "2024-01-15",
    project: "alpha",
    pending: 18,
    resolved: 30,
    rejected: 3,
  },
  {
    date: "2024-02-01",
    project: "alpha",
    pending: 22,
    resolved: 28,
    rejected: 6,
  },
  {
    date: "2024-02-15",
    project: "alpha",
    pending: 20,
    resolved: 32,
    rejected: 5,
  },
  {
    date: "2024-03-01",
    project: "alpha",
    pending: 25,
    resolved: 35,
    rejected: 7,
  },
  {
    date: "2024-03-15",
    project: "alpha",
    pending: 28,
    resolved: 40,
    rejected: 8,
  },
  {
    date: "2024-04-01",
    project: "alpha",
    pending: 30,
    resolved: 42,
    rejected: 10,
  },
  {
    date: "2024-04-15",
    project: "alpha",
    pending: 32,
    resolved: 45,
    rejected: 9,
  },
  {
    date: "2024-05-01",
    project: "alpha",
    pending: 35,
    resolved: 50,
    rejected: 12,
  },
  {
    date: "2024-05-15",
    project: "alpha",
    pending: 38,
    resolved: 52,
    rejected: 11,
  },
  {
    date: "2024-06-01",
    project: "alpha",
    pending: 40,
    resolved: 55,
    rejected: 13,
  },
  {
    date: "2024-06-15",
    project: "alpha",
    pending: 42,
    resolved: 58,
    rejected: 14,
  },
  {
    date: "2024-07-01",
    project: "alpha",
    pending: 45,
    resolved: 60,
    rejected: 15,
  },
  {
    date: "2024-07-15",
    project: "alpha",
    pending: 48,
    resolved: 62,
    rejected: 16,
  },
  {
    date: "2024-08-01",
    project: "alpha",
    pending: 50,
    resolved: 65,
    rejected: 18,
  },
  {
    date: "2024-08-15",
    project: "alpha",
    pending: 52,
    resolved: 68,
    rejected: 17,
  },
  {
    date: "2024-09-01",
    project: "alpha",
    pending: 55,
    resolved: 70,
    rejected: 20,
  },
  {
    date: "2024-09-15",
    project: "alpha",
    pending: 58,
    resolved: 72,
    rejected: 19,
  },
  {
    date: "2024-10-01",
    project: "alpha",
    pending: 60,
    resolved: 75,
    rejected: 22,
  },
  {
    date: "2024-10-15",
    project: "alpha",
    pending: 62,
    resolved: 78,
    rejected: 21,
  },
  {
    date: "2024-11-01",
    project: "alpha",
    pending: 65,
    resolved: 80,
    rejected: 24,
  },
  {
    date: "2024-11-15",
    project: "alpha",
    pending: 68,
    resolved: 82,
    rejected: 23,
  },
  {
    date: "2024-12-01",
    project: "alpha",
    pending: 70,
    resolved: 85,
    rejected: 25,
  },
  {
    date: "2024-12-15",
    project: "alpha",
    pending: 72,
    resolved: 88,
    rejected: 26,
  },

  // Project Beta - January to December 2024
  {
    date: "2024-01-01",
    project: "beta",
    pending: 20,
    resolved: 18,
    rejected: 5,
  },
  {
    date: "2024-01-15",
    project: "beta",
    pending: 22,
    resolved: 20,
    rejected: 6,
  },
  {
    date: "2024-02-01",
    project: "beta",
    pending: 25,
    resolved: 22,
    rejected: 7,
  },
  {
    date: "2024-02-15",
    project: "beta",
    pending: 28,
    resolved: 25,
    rejected: 8,
  },
  {
    date: "2024-03-01",
    project: "beta",
    pending: 30,
    resolved: 28,
    rejected: 9,
  },
  {
    date: "2024-03-15",
    project: "beta",
    pending: 32,
    resolved: 30,
    rejected: 10,
  },
  {
    date: "2024-04-01",
    project: "beta",
    pending: 35,
    resolved: 32,
    rejected: 11,
  },
  {
    date: "2024-04-15",
    project: "beta",
    pending: 38,
    resolved: 35,
    rejected: 12,
  },
  {
    date: "2024-05-01",
    project: "beta",
    pending: 40,
    resolved: 38,
    rejected: 13,
  },
  {
    date: "2024-05-15",
    project: "beta",
    pending: 42,
    resolved: 40,
    rejected: 14,
  },
  {
    date: "2024-06-01",
    project: "beta",
    pending: 45,
    resolved: 42,
    rejected: 15,
  },
  {
    date: "2024-06-15",
    project: "beta",
    pending: 48,
    resolved: 45,
    rejected: 16,
  },
  {
    date: "2024-07-01",
    project: "beta",
    pending: 50,
    resolved: 48,
    rejected: 17,
  },
  {
    date: "2024-07-15",
    project: "beta",
    pending: 52,
    resolved: 50,
    rejected: 18,
  },
  {
    date: "2024-08-01",
    project: "beta",
    pending: 55,
    resolved: 52,
    rejected: 19,
  },
  {
    date: "2024-08-15",
    project: "beta",
    pending: 58,
    resolved: 55,
    rejected: 20,
  },
  {
    date: "2024-09-01",
    project: "beta",
    pending: 60,
    resolved: 58,
    rejected: 21,
  },
  {
    date: "2024-09-15",
    project: "beta",
    pending: 62,
    resolved: 60,
    rejected: 22,
  },
  {
    date: "2024-10-01",
    project: "beta",
    pending: 65,
    resolved: 62,
    rejected: 23,
  },
  {
    date: "2024-10-15",
    project: "beta",
    pending: 68,
    resolved: 65,
    rejected: 24,
  },
  {
    date: "2024-11-01",
    project: "beta",
    pending: 70,
    resolved: 68,
    rejected: 25,
  },
  {
    date: "2024-11-15",
    project: "beta",
    pending: 72,
    resolved: 70,
    rejected: 26,
  },
  {
    date: "2024-12-01",
    project: "beta",
    pending: 75,
    resolved: 72,
    rejected: 27,
  },
  {
    date: "2024-12-15",
    project: "beta",
    pending: 78,
    resolved: 75,
    rejected: 28,
  },

  // Project Gamma - January to December 2024
  {
    date: "2024-01-01",
    project: "gamma",
    pending: 10,
    resolved: 35,
    rejected: 2,
  },
  {
    date: "2024-01-15",
    project: "gamma",
    pending: 12,
    resolved: 38,
    rejected: 3,
  },
  {
    date: "2024-02-01",
    project: "gamma",
    pending: 15,
    resolved: 40,
    rejected: 4,
  },
  {
    date: "2024-02-15",
    project: "gamma",
    pending: 18,
    resolved: 42,
    rejected: 5,
  },
  {
    date: "2024-03-01",
    project: "gamma",
    pending: 20,
    resolved: 45,
    rejected: 6,
  },
  {
    date: "2024-03-15",
    project: "gamma",
    pending: 22,
    resolved: 48,
    rejected: 7,
  },
  {
    date: "2024-04-01",
    project: "gamma",
    pending: 25,
    resolved: 50,
    rejected: 8,
  },
  {
    date: "2024-04-15",
    project: "gamma",
    pending: 28,
    resolved: 52,
    rejected: 9,
  },
  {
    date: "2024-05-01",
    project: "gamma",
    pending: 30,
    resolved: 55,
    rejected: 10,
  },
  {
    date: "2024-05-15",
    project: "gamma",
    pending: 32,
    resolved: 58,
    rejected: 11,
  },
  {
    date: "2024-06-01",
    project: "gamma",
    pending: 35,
    resolved: 60,
    rejected: 12,
  },
  {
    date: "2024-06-15",
    project: "gamma",
    pending: 38,
    resolved: 62,
    rejected: 13,
  },
  {
    date: "2024-07-01",
    project: "gamma",
    pending: 40,
    resolved: 65,
    rejected: 14,
  },
  {
    date: "2024-07-15",
    project: "gamma",
    pending: 42,
    resolved: 68,
    rejected: 15,
  },
  {
    date: "2024-08-01",
    project: "gamma",
    pending: 45,
    resolved: 70,
    rejected: 16,
  },
  {
    date: "2024-08-15",
    project: "gamma",
    pending: 48,
    resolved: 72,
    rejected: 17,
  },
  {
    date: "2024-09-01",
    project: "gamma",
    pending: 50,
    resolved: 75,
    rejected: 18,
  },
  {
    date: "2024-09-15",
    project: "gamma",
    pending: 52,
    resolved: 78,
    rejected: 19,
  },
  {
    date: "2024-10-01",
    project: "gamma",
    pending: 55,
    resolved: 80,
    rejected: 20,
  },
  {
    date: "2024-10-15",
    project: "gamma",
    pending: 58,
    resolved: 82,
    rejected: 21,
  },
  {
    date: "2024-11-01",
    project: "gamma",
    pending: 60,
    resolved: 85,
    rejected: 22,
  },
  {
    date: "2024-11-15",
    project: "gamma",
    pending: 62,
    resolved: 88,
    rejected: 23,
  },
  {
    date: "2024-12-01",
    project: "gamma",
    pending: 65,
    resolved: 90,
    rejected: 24,
  },
  {
    date: "2024-12-15",
    project: "gamma",
    pending: 68,
    resolved: 92,
    rejected: 25,
  },
];

/* =========================
   CHART CONFIG
   ========================= */
const chartConfig = {
  pending: {
    label: "Pending",
    color: "hsl(var(--chart-1))",
  },
  resolved: {
    label: "Resolved",
    color: "hsl(var(--chart-2))",
  },
  rejected: {
    label: "Rejected",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig;

/* =========================
   COMPONENT
   ========================= */
export function ChartAreaInteractive() {
  const [project, setProject] = React.useState("alpha");
  const [timeRange, setTimeRange] = React.useState("1y");

  const filteredData = React.useMemo(() => {
    // First filter by project
    let data = chartData.filter((item) => item.project === project);

    // Then filter by time range
    const referenceDate = new Date("2024-12-15");
    let daysToSubtract = 365; // 1 year default

    if (timeRange === "6m") {
      daysToSubtract = 180;
    } else if (timeRange === "3m") {
      daysToSubtract = 90;
    } else if (timeRange === "1m") {
      daysToSubtract = 30;
    }

    const startDate = new Date(referenceDate);
    startDate.setDate(startDate.getDate() - daysToSubtract);

    return data.filter((item) => {
      const date = new Date(item.date);
      return date >= startDate;
    });
  }, [project, timeRange]);

  return (
    <Card className="hover:shadow-lg transition-all duration-300 w-full h-full flex flex-col p-6">
      {/* Header */}
      <div className="flex items-center gap-2 pb-4 mb-4 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <h3 className="text-lg font-semibold">
            Maintenance Support Requests
          </h3>
          <p className="text-sm text-muted-foreground">
            Pending, resolved, and rejected requests by project
          </p>
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          {/* Project Filter */}
          <Select value={project} onValueChange={setProject}>
            <SelectTrigger
              className="w-[140px] rounded-lg sm:flex"
              aria-label="Select project"
            >
              <SelectValue placeholder="Select Project" />
            </SelectTrigger>
            <SelectContent className="rounded-xl bg-white">
              <SelectItem value="alpha" className="rounded-lg">
                Project Alpha
              </SelectItem>
              <SelectItem value="beta" className="rounded-lg">
                Project Beta
              </SelectItem>
              <SelectItem value="gamma" className="rounded-lg">
                Project Gamma
              </SelectItem>
            </SelectContent>
          </Select>

          {/* Time Range Filter */}
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="w-[120px] rounded-lg sm:flex"
              aria-label="Select time range"
            >
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent className="rounded-xl bg-white">
              <SelectItem value="1m" className="rounded-lg">
                Last Month
              </SelectItem>
              <SelectItem value="3m" className="rounded-lg">
                Last 3 Months
              </SelectItem>
              <SelectItem value="6m" className="rounded-lg">
                Last 6 Months
              </SelectItem>
              <SelectItem value="1y" className="rounded-lg">
                Last Year
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 flex items-center justify-center min-h-0">
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <AreaChart data={filteredData}>
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
              minTickGap={32}
              tickFormatter={(value) =>
                new Date(value).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }
            />

            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) =>
                    new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  }
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
      </div>
    </Card>
  );
}
