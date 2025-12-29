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

export const description =
  "Raised maintenance requests by status filtered by project";

/* =========================
   DATA PER PROJECT
   ========================= */
const projectData = {
  alpha: [
    { status: "created", value: 24 },
    { status: "inprogress", value: 18 },
    { status: "resolved", value: 32 },
    { status: "rejected", value: 6 },
    { status: "reraised", value: 9 },
    { status: "closed", value: 21 },
  ],
  beta: [
    { status: "created", value: 18 },
    { status: "inprogress", value: 22 },
    { status: "resolved", value: 28 },
    { status: "rejected", value: 4 },
    { status: "reraised", value: 7 },
    { status: "closed", value: 19 },
  ],
  gamma: [
    { status: "created", value: 12 },
    { status: "inprogress", value: 14 },
    { status: "resolved", value: 36 },
    { status: "rejected", value: 3 },
    { status: "reraised", value: 5 },
    { status: "closed", value: 27 },
  ],
};

/* =========================
   CHART CONFIG
   ========================= */
const chartConfig = {
  value: {
    label: "Requests",
  },
  created: {
    label: "Created",
    color: "hsl(var(--chart-1))",
  },
  inprogress: {
    label: "In Progress",
    color: "hsl(var(--chart-2))",
  },
  resolved: {
    label: "Resolved",
    color: "hsl(var(--chart-3))",
  },
  rejected: {
    label: "Rejected",
    color: "hsl(var(--chart-4))",
  },
  reraised: {
    label: "Re-Raised",
    color: "hsl(var(--chart-5))",
  },
  closed: {
    label: "Closed",
    color: "hsl(var(--chart-6))",
  },
} satisfies ChartConfig;

/* =========================
   COMPONENT
   ========================= */
export function ChartPieInteractive() {
  const id = "pie-project-status";
  const [project, setProject] =
    React.useState<keyof typeof projectData>("alpha");

  const data = projectData[project];

  const totalRaised = React.useMemo(
    () => data.reduce((sum, item) => sum + item.value, 0),
    [data]
  );

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
            Raised requests by status
          </p>
        </div>

        {/* Project Dropdown */}
        <Select value={project} onValueChange={setProject}>
          <SelectTrigger
            className="h-7 w-[160px] rounded-lg pl-2.5"
            aria-label="Select project"
          >
            <SelectValue placeholder="Select project" />
          </SelectTrigger>
          <SelectContent align="end" className="rounded-xl bg-white">
            <SelectItem value="alpha">Project Alpha</SelectItem>
            <SelectItem value="beta">Project Beta</SelectItem>
            <SelectItem value="gamma">Project Gamma</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Chart + Status */}
      <div className="flex justify-center items-center space-x-2">
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
              data={data}
              dataKey="value"
              nameKey="status"
              innerRadius={60}
              strokeWidth={5}
            >
              {data.map((entry) => {
                const config =
                  chartConfig[entry.status as keyof typeof chartConfig];

                return <Cell key={entry.status} fill={config.color} />;
              })}

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
                          Total Raised
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>

        {/* Status Legend */}
        <div className="mx-auto aspect-square w-full max-w-[300px] flex items-center">
          <div className="rounded-xl">
            {data.map((item) => {
              const config =
                chartConfig[item.status as keyof typeof chartConfig];

              return (
                <div
                  key={item.status}
                  className="rounded-lg [&_span]:flex mt-4"
                >
                  <div className="flex items-center gap-2 text-xs">
                    <span
                      className="flex h-3 w-3 shrink-0 rounded-xs"
                      style={{ backgroundColor: config.color }}
                    />
                    {config.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Card>
  );
}
