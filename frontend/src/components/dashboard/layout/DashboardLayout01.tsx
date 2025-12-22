import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
// import { Progress } from "@/components/ui/progress";
import {
  ArrowUpRight,
  ArrowDownRight,
  Users,
  FileText,
  XCircle,
  Clock,
  Calendar,
  TrendingUp,
  TrendingDown,
  MoreVertical,
  Download,
  User,
  Briefcase,
  Bell,
} from "lucide-react";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "../../ui/chart";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Label,
  Pie,
  PieChart,
  PolarGrid,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
  XAxis,
  YAxis,
} from "recharts";
import { DataCardItem } from "../../../types/dashboard";

// Week data for statistics chart
const weekData = [
  { day: "Mon", value: 80, fill: "hsl(var(--chart-1))" },
  { day: "Tue", value: 65, fill: "hsl(var(--chart-1))" },
  { day: "Wed", value: 90, fill: "hsl(var(--chart-1))" },
  { day: "Thu", value: 70, fill: "hsl(var(--chart-1))" },
  { day: "Fri", value: 85, fill: "hsl(var(--chart-1))" },
  { day: "Sat", value: 60, fill: "hsl(var(--chart-2))" },
  { day: "Sun", value: 40, fill: "hsl(var(--chart-2))" },
];

// Time data for applications received
const timeData = [
  { hour: "8 AM", value: 25 },
  { hour: "10 AM", value: 70 },
  { hour: "12 PM", value: 95 },
  { hour: "2 PM", value: 85 },
  { hour: "4 PM", value: 60 },
  { hour: "6 PM", value: 40 },
  { hour: "8 PM", value: 20 },
];

// Applications status data
const applicationsData = [
  { name: "Shortlisted", value: 40, color: "hsl(var(--chart-1))" },
  { name: "Rejected", value: 25, color: "hsl(var(--chart-2))" },
  { name: "On Hold", value: 35, color: "hsl(var(--chart-3))" },
];

// Chart configurations
const chartConfig = {
  value: {
    label: "Value",
  },
  day: {
    label: "Day",
  },
  hour: {
    label: "Hour",
  },
  applications: {
    label: "Applications",
  },
} satisfies ChartConfig;

const dataItems: DataCardItem[] = [
  {
    id: "1",
    title: "Total Applications",
    subtitle: "+14% vs last month",
    value: "5,672",
    change: "+14%",
    icon: <FileText className="h-5 w-5" />,
    color: "bg-blue-100 text-blue-600",
    viewLabel: "View All",
    status: "positive",
  },
  {
    id: "2",
    title: "Shortlisted",
    subtitle: "Selected candidates",
    value: "1,055",
    change: "+44%",
    icon: <Users className="h-5 w-5" />,
    color: "bg-green-100 text-green-600",
    viewLabel: "View Shortlisted",
    status: "positive",
  },
  {
    id: "3",
    title: "Rejected",
    subtitle: "Not selected",
    value: "1,432",
    change: "+94%",
    icon: <XCircle className="h-5 w-5" />,
    color: "bg-red-100 text-red-600",
    viewLabel: "View Rejected",
    status: "negative",
  },
];

function DashboardLayout01() {
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">13 Dec 2025</h1>
          <p className="text-muted-foreground">Saturday, Good morning!</p>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            Export Report
          </Button>
          <Button size="sm">+ New Application</Button>
        </div>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dataItems.map((item) => (
          <Card key={item.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className={`p-3 rounded-lg ${item.color} bg-opacity-20`}>
                  {item.icon}
                </div>
                <Badge
                  status="outline"
                  className={`
                    ${
                      item.status === "positive"
                        ? "border-green-200 bg-green-50 text-green-700"
                        : ""
                    }
                    ${
                      item.status === "negative"
                        ? "border-red-200 bg-red-50 text-red-700"
                        : ""
                    }
                  `}
                >
                  {item.status === "positive" ? (
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 mr-1" />
                  )}
                  {item.change}
                </Badge>
              </div>

              <div className="mt-4">
                <div className="text-3xl font-bold">{item.value}</div>
                <p className="text-sm text-muted-foreground mt-1">
                  {item.title}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  {item.subtitle}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* On Hold Card */}
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="p-3 rounded-lg bg-amber-100 text-amber-600">
                <Clock className="h-5 w-5" />
              </div>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>

            <div className="mt-4">
              <div className="text-3xl font-bold">894</div>
              <p className="text-sm text-muted-foreground mt-1">On Hold</p>
              <p className="text-xs text-muted-foreground mt-2">
                Pending review
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Statistics */}
        <div className="lg:col-span-2 space-y-6">
          {/* Statistics of Active Applications */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Statistics of Active Applications</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-64">
                <BarChart data={weekData}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="day"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    domain={[0, 100]}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {weekData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Applications Received Time */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Applications Received Time</CardTitle>
              <p className="text-sm text-muted-foreground">Today</p>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-64">
                <BarChart data={timeData}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="hour"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    domain={[0, 100]}
                  />
                  <Bar
                    dataKey="value"
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Applications & Jobs */}
        <div className="space-y-6">
          {/* Applications Status Pie Chart */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Applications</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <ChartContainer config={chartConfig} className="h-48 w-48">
                <PieChart>
                  <Pie
                    data={applicationsData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={60}
                    paddingAngle={2}
                  >
                    {applicationsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ChartContainer>
              <div className="grid grid-cols-3 gap-4 mt-4 w-full">
                {applicationsData.map((item, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div className="text-lg font-semibold">{item.value}%</div>
                    <div className="text-xs text-muted-foreground">
                      {item.name}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Jobs Posted */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Jobs Posted</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                    <Briefcase className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium">Android Developer</p>
                    <p className="text-sm text-muted-foreground">
                      95 Total Applications
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold">95</div>
                  <Badge
                    status="outline"
                    className="border-green-200 text-green-700"
                  >
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +12%
                  </Badge>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                    <Briefcase className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium">UX/UI Designer</p>
                    <p className="text-sm text-muted-foreground">
                      30 Total Applications
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold">30</div>
                  <Badge
                    status="outline"
                    className="border-red-200 text-red-700"
                  >
                    <TrendingDown className="h-3 w-3 mr-1" />
                    -5%
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reminders */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Reminders</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg">
                <Bell className="h-5 w-5 text-amber-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    Your subscription expires Today
                  </p>
                  <p className="text-xs text-muted-foreground">Renew Now</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    There are 4 new iOS Developer applications
                  </p>
                  <p className="text-xs text-muted-foreground">Review now</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <User className="h-5 w-5 text-green-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    You have cleared Design Lead interview
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Schedule next round
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                <Briefcase className="h-5 w-5 text-purple-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    You have drafted Web Developer job post
                  </p>
                  <p className="text-xs text-muted-foreground">Publish now</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default DashboardLayout01;
