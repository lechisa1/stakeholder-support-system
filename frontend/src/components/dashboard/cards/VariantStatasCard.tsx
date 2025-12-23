"use client";
import {
  RadialBarChart,
  RadialBar,
  PolarGrid,
  PolarRadiusAxis,
  Label,
} from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";

import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { ChartContainer, ChartConfig } from "../../ui/chart";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Badge } from "../../ui/badge";
import React from "react";

type StatCard = {
  id: string;
  title: string;
  value: number;
  percent: number;
  change: string;
  color: string;
  status: string;
};

const woredaStatistics: StatCard[] = [
  {
    id: "1",
    title: "Resloved Requests",
    value: 4236,
    percent: 68,
    change: "+12%",
    color: "hsl(var(--chart-1))",
    status: "positive",
  },
  {
    id: "2",
    title: "Pending Requests",
    value: 2845,
    percent: 72,
    change: "+8%",
    color: "hsl(var(--chart-2))",
    status: "positive",
  },
  {
    id: "3",
    title: "Rejected Requests",
    value: 876,
    percent: 38,
    change: "-2%",
    color: "hsl(var(--chart-3))",
    status: "negative",
  },
];

const cityStatistics: StatCard[] = [
  {
    id: "1",
    title: "Resloved Requests",
    value: 8924,
    percent: 82,
    change: "+18%",
    color: "hsl(var(--chart-1))",
    status: "positive",
  },
  {
    id: "2",
    title: "Pending Requests",
    value: 5347,
    percent: 78,
    change: "+12%",
    color: "hsl(var(--chart-2))",
    status: "positive",
  },
  {
    id: "3",
    title: "Rejected Requests",
    value: 2156,
    percent: 52,
    change: "+5%",
    color: "hsl(var(--chart-3))",
    status: "negative",
  },
];

const subcityStatistics: StatCard[] = [
  {
    id: "1",
    title: "Resloved Requests",
    value: 3268,
    percent: 61,
    change: "+9%",
    color: "hsl(var(--chart-1))",
    status: "positive",
  },
  {
    id: "2",
    title: "Pending Requests",
    value: 1843,
    percent: 55,
    change: "+4%",
    color: "hsl(var(--chart-2))",
    status: "positive",
  },
  {
    id: "3",
    title: "Rejected Requests",
    value: 892,
    percent: 42,
    change: "+1%",
    color: "hsl(var(--chart-3))",
    status: "negative",
  },
];

// Add different data for time ranges
const getDataByTimeRange = (timeRange: string, type: string) => {
  const baseData =
    type === "woreda"
      ? woredaStatistics
      : type === "city"
      ? cityStatistics
      : subcityStatistics;

  if (timeRange === "30d") {
    // Reduce values for 30 days (about 1/3 of 90 days)
    return baseData.map((item) => ({
      ...item,
      value: Math.floor(item.value * 0.33),
      percent: Math.floor(item.percent * 0.9),
      change: item.status === "positive" ? "+5%" : "-1%",
    }));
  } else if (timeRange === "7d") {
    // Reduce values for 7 days (about 1/13 of 90 days)
    return baseData.map((item) => ({
      ...item,
      value: Math.floor(item.value * 0.08),
      percent: Math.floor(item.percent * 0.8),
      change: item.status === "positive" ? "+2%" : "0%",
    }));
  }
  return baseData;
};

export default function VariantStatasCard() {
  const [timeRange, setTimeRange] = React.useState("90d");
  const [selectedType, setSelectedType] = React.useState<
    "woreda" | "city" | "subcity"
  >("woreda");

  const getCurrentStatistics = () => {
    return getDataByTimeRange(timeRange, selectedType);
  };

  const getTitleByType = () => {
    switch (selectedType) {
      case "woreda":
        return "Woreda Statistics";
      case "city":
        return "City Statistics";
      case "subcity":
        return "Subcity Statistics";
      default:
        return "Statistics";
    }
  };

  const currentStats = getCurrentStatistics();

  return (
    <Card className="hover:shadow-lg transition-all duration-300 border-border/50 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <CardTitle className="text-lg font-semibold">
          {getTitleByType()}
        </CardTitle>
        <div className="flex flex-col sm:flex-row gap-3">
          <Select
            value={selectedType}
            onValueChange={(value: "woreda" | "city" | "subcity") =>
              setSelectedType(value)
            }
          >
            <SelectTrigger
              className="w-full sm:w-[180px] rounded-lg bg-white"
              aria-label="Select statistics type"
            >
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent className="rounded-xl bg-white">
              <SelectItem value="woreda" className="rounded-lg">
                Woreda Statistics
              </SelectItem>
              <SelectItem value="subcity" className="rounded-lg">
                Subcity Statistics
              </SelectItem>
              <SelectItem value="city" className="rounded-lg">
                City Statistics
              </SelectItem>
            </SelectContent>
          </Select>

          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="w-full sm:w-[160px] rounded-lg"
              aria-label="Select time range"
            >
              <SelectValue placeholder="Last 3 months" />
            </SelectTrigger>
            <SelectContent className="rounded-xl bg-white">
              <SelectItem value="90d" className="rounded-lg">
                Last 3 months
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                Last 30 days
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                Last 7 days
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 relative">
        {currentStats.map((item, index) => {
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
            <React.Fragment key={item.id}>
              <div className="relative">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-secondary">
                      {item.title}
                    </CardTitle>
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
              </div>

              {/* Vertical line separator between cards on desktop */}
              {index < currentStats.length - 1 && (
                <>
                  {/* For lg screens: after 1st and 2nd items in a 3-column layout */}
                  <div
                    className={`hidden lg:block absolute top-1/2 transform -translate-y-1/2 w-[1px] h-4/5 bg-gray-300`}
                    style={{
                      left: `${((index + 1) / currentStats.length) * 100}%`,
                    }}
                  ></div>

                  {/* For md/sm screens: after 1st item in a 2-column layout */}
                  {index === 0 && currentStats.length > 1 && (
                    <div className="hidden sm:block lg:hidden absolute top-1/2 left-1/2 transform -translate-y-1/2 w-[1px] h-4/5 bg-gray-300"></div>
                  )}
                </>
              )}

              {/* Horizontal line separator between cards on mobile */}
              {index < currentStats.length - 1 && (
                <div className="block sm:hidden w-full h-[1px] bg-gray-300 my-4"></div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </Card>
  );
}
