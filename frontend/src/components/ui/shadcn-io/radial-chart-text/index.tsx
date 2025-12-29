"use client";

import * as React from "react";
import { TrendingUp } from "lucide-react";
import {
  Label,
  PolarGrid,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../card";
import { ChartConfig, ChartContainer } from "../../chart";

export const description = "User statistics throughout the year";

const userData = {
  internal: [
    { month: "Jan", users: 800, fill: "hsl(0, 80%, 60%)" },
    { month: "Feb", users: 950, fill: "hsl(30, 80%, 60%)" },
    { month: "Mar", users: 1100, fill: "hsl(60, 80%, 60%)" },
    { month: "Apr", users: 900, fill: "hsl(90, 80%, 60%)" },
    { month: "May", users: 1200, fill: "hsl(120, 80%, 60%)" },
    { month: "Jun", users: 1000, fill: "hsl(150, 80%, 60%)" },
    { month: "Jul", users: 1250, fill: "hsl(180, 80%, 60%)" },
    { month: "Aug", users: 1300, fill: "hsl(210, 80%, 60%)" },
    { month: "Sep", users: 1150, fill: "hsl(240, 80%, 60%)" },
    { month: "Oct", users: 1050, fill: "hsl(270, 80%, 60%)" },
    { month: "Nov", users: 980, fill: "hsl(300, 80%, 60%)" },
    { month: "Dec", users: 1100, fill: "hsl(330, 80%, 60%)" },
  ],
  external: [
    { month: "Jan", users: 400, fill: "hsl(0, 50%, 60%)" },
    { month: "Feb", users: 500, fill: "hsl(30, 50%, 60%)" },
    { month: "Mar", users: 650, fill: "hsl(60, 50%, 60%)" },
    { month: "Apr", users: 550, fill: "hsl(90, 50%, 60%)" },
    { month: "May", users: 700, fill: "hsl(120, 50%, 60%)" },
    { month: "Jun", users: 600, fill: "hsl(150, 50%, 60%)" },
    { month: "Jul", users: 750, fill: "hsl(180, 50%, 60%)" },
    { month: "Aug", users: 800, fill: "hsl(210, 50%, 60%)" },
    { month: "Sep", users: 650, fill: "hsl(240, 50%, 60%)" },
    { month: "Oct", users: 600, fill: "hsl(270, 50%, 60%)" },
    { month: "Nov", users: 580, fill: "hsl(300, 50%, 60%)" },
    { month: "Dec", users: 700, fill: "hsl(330, 50%, 60%)" },
  ],
};

const chartConfig = {
  users: { label: "Users" },
  Jan: { label: "January" },
  Feb: { label: "February" },
  Mar: { label: "March" },
  Apr: { label: "April" },
  May: { label: "May" },
  Jun: { label: "June" },
  Jul: { label: "July" },
  Aug: { label: "August" },
  Sep: { label: "September" },
  Oct: { label: "October" },
  Nov: { label: "November" },
  Dec: { label: "December" },
} satisfies ChartConfig;

export function ChartRadialUsers() {
  const [userType, setUserType] =
    React.useState<keyof typeof userData>("internal");

  const data = userData[userType];
  const totalUsers = React.useMemo(
    () => data.reduce((sum, item) => sum + item.users, 0),
    [data]
  );

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>User Statistics - 2024</CardTitle>
        <CardDescription>Monthly user registrations</CardDescription>
      </CardHeader>

      <CardContent className="flex-1 pb-0">
        {/* Filter Dropdown */}
        <div className="mb-4 flex justify-end">
          <select
            value={userType}
            onChange={(e) =>
              setUserType(e.target.value as keyof typeof userData)
            }
            className="rounded-lg border px-3 py-1 text-sm"
          >
            <option value="internal">Internal Users</option>
            <option value="external">External Users</option>
          </select>
        </div>

        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[300px]"
        >
          <RadialBarChart
            data={data}
            startAngle={90}
            endAngle={450}
            innerRadius={50}
            outerRadius={120}
            barSize={12}
          >
            <PolarGrid radialLines={false} />
            <RadialBar
              dataKey="users"
              cornerRadius={6}
              background
              fill="#8884d8"
            />
            {data.map((entry) => (
              <RadialBar key={entry.month} dataKey="users" fill={entry.fill} />
            ))}
            <PolarRadiusAxis tick={false} axisLine={false}>
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
                          {totalUsers.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground text-sm"
                        >
                          Total Users
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </PolarRadiusAxis>
          </RadialBarChart>
        </ChartContainer>
      </CardContent>

      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 leading-none font-medium">
          Users growing this year <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none">
          Monthly breakdown of user registrations
        </div>
      </CardFooter>
    </Card>
  );
}
