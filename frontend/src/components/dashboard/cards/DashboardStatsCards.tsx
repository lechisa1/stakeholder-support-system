"use client";
import {
  RadialBarChart,
  RadialBar,
  PolarGrid,
  PolarRadiusAxis,
  Label,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { ChartContainer, ChartConfig } from "../../ui/chart";
// import { Badge } from "@/components/ui/badge";
import { ArrowDownRight, ArrowUpRight, MoreHorizontal } from "lucide-react";
import { Badge } from "../../ui/badge";

type StatCard = {
  id: string;
  title: string;
  value: number;
  percent: number;
  change: string;
  color: string;
  status: string;
};

const stats: StatCard[] = [
  {
    id: "1",
    title: "Total Applications",
    value: 5672,
    percent: 74,
    change: "+14%",
    color: "hsl(var(--chart-1))",
    status: "positive",
  },
  {
    id: "2",
    title: "Shortlisted Candidates",
    value: 3045,
    percent: 60,
    change: "+6%",
    color: "hsl(var(--chart-2))",
    status: "positive",
  },
  {
    id: "3",
    title: "Rejected Candidates",
    value: 1055,
    percent: 46,
    change: "+4%",
    color: "hsl(var(--chart-3))",
    status: "negative",
  },
];

export default function DashboardStatsCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {stats.map((item) => {
        const chartData = [
          { name: item.title, value: 100, fill: "hsl(var(--muted))" },
          { name: item.title, value: item.percent, fill: item.color },
        ];

        const chartConfig = {
          value: {
            label: item.title,
            color: item.color,
          },
        } satisfies ChartConfig;

        return (
          <Card
            key={item.id}
            className="shadow-lg hover:shadow-lg transition-all duration-300 hover:scale-[1.02] border-border/50"
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-secondary">
                  {item.title}
                </CardTitle>
                <MoreHorizontal className="h-4 w-4 text-secondary hover:text-foreground cursor-pointer" />
              </div>
            </CardHeader>

            <CardContent className="flex items-center justify-between">
              {/* Text Section */}
              <div className="flex flex-col space-y-4">
                <div className="text-3xl text-primary font-bold tracking-tight">
                  {item.value.toLocaleString()}
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    status="outline"
                    className={`rounded-full border-0 ${
                      item.status === "positive"
                        ? "bg-green-50 text-green-700"
                        : "bg-red-50 text-red-700"
                    }`}
                    style={{
                      backgroundColor:
                        item.status === "positive"
                          ? `${item.color
                              .replace("hsl", "hsla")
                              .replace(")", ", 0.1)")}`
                          : `${item.color
                              .replace("hsl", "hsla")
                              .replace(")", ", 0.1)")}`,
                      color: item.color,
                      borderColor: `${item.color
                        .replace("hsl", "hsla")
                        .replace(")", ", 0.2)")}`,
                    }}
                  >
                    {item.status === "positive" ? (
                      <ArrowUpRight
                        className="h-3 w-3"
                        style={{ color: item.color }}
                      />
                    ) : (
                      <ArrowDownRight
                        className="h-3 w-3"
                        style={{ color: item.color }}
                      />
                    )}
                  </Badge>
                  <span
                    className="text-sm font-medium"
                    style={{ color: item.color }}
                  >
                    {item.change}
                  </span>
                </div>
              </div>
              {/* Radial Chart */}
              <ChartContainer
                config={chartConfig}
                className="aspect-square h-[90px]"
              >
                <RadialBarChart
                  data={chartData}
                  startAngle={90}
                  endAngle={-270}
                  innerRadius={35}
                  outerRadius={45}
                >
                  <PolarGrid
                    gridType="circle"
                    radialLines={false}
                    stroke="none"
                  />
                  <RadialBar
                    dataKey="value"
                    background={{ fill: "hsl(var(--muted))" }}
                    cornerRadius={10}
                    stackId="a"
                  />
                  <PolarRadiusAxis tick={false} axisLine={false}>
                    <Label
                      content={({ viewBox }) => {
                        if (!viewBox || !("cx" in viewBox)) return null;
                        return (
                          <text
                            x={viewBox.cx}
                            y={viewBox.cy}
                            textAnchor="middle"
                            dominantBaseline="middle"
                          >
                            <tspan
                              className="text-sm font-bold"
                              style={{ fill: item.color }}
                            >
                              {item.percent}%
                            </tspan>
                          </text>
                        );
                      }}
                    />
                  </PolarRadiusAxis>
                </RadialBarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
