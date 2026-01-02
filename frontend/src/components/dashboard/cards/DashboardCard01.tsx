import React from "react";
import { LucideIcon, MessageSquare, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "../../../lib/utils";
// import { cn } from "@/lib/utils";

export type ColorTheme = "orange" | "blue" | "green" | "purple" | "red" | "teal";

interface DashboardCard01Props {
  icon: LucideIcon;
  title: string;
  value: number | string;
  description: string;
  trend: {
    value: number;
    isPositive: boolean;
  };
  colorTheme: ColorTheme;
}

const colorThemes: Record<ColorTheme, { bg: string; icon: string; trend: string }> = {
  orange: {
    bg: "bg-orange-100 dark:bg-orange-950",
    icon: "text-orange-500 dark:text-orange-400",
    trend: "text-emerald-600 dark:text-emerald-400",
  },
  blue: {
    bg: "bg-blue-100 dark:bg-blue-950",
    icon: "text-blue-500 dark:text-blue-400",
    trend: "text-emerald-600 dark:text-emerald-400",
  },
  green: {
    bg: "bg-emerald-100 dark:bg-emerald-950",
    icon: "text-emerald-500 dark:text-emerald-400",
    trend: "text-emerald-600 dark:text-emerald-400",
  },
  purple: {
    bg: "bg-purple-100 dark:bg-purple-950",
    icon: "text-purple-500 dark:text-purple-400",
    trend: "text-emerald-600 dark:text-emerald-400",
  },
  red: {
    bg: "bg-red-100 dark:bg-red-950",
    icon: "text-red-500 dark:text-red-400",
    trend: "text-emerald-600 dark:text-emerald-400",
  },
  teal: {
    bg: "bg-teal-100 dark:bg-teal-950",
    icon: "text-teal-500 dark:text-teal-400",
    trend: "text-emerald-600 dark:text-emerald-400",
  },
};

const DashboardCard01 = ({
  icon: Icon = MessageSquare,
  title = "Messages",
  value = 220,
  description = "Since last month",
  trend = { value: 3.46, isPositive: true },
  colorTheme = "red",
}: DashboardCard01Props) => {
  const theme = colorThemes[colorTheme];
  const TrendIcon = trend.isPositive ? TrendingUp : TrendingDown;

  return (
    <div className="bg-card rounded-xl flex flex-col justify-between  p-6 shadow-sm border border-border">
      <div className="flex items-start gap-4">
        {/* Icon Container */}
        <div
          className={cn(
            "flex items-center justify-center w-14 h-14 rounded-full shrink-0",
            theme.bg
          )}
        >
          <Icon className={cn("w-7 h-7", theme.icon)} strokeWidth={2} />
        </div>

        {/* Content */}
        <div className="flex flex-col">
          <span className="text-3xl font-semibold text-foreground tracking-tight">
            {typeof value === "number" ? value.toLocaleString() : value}
          </span>
          <span className="text-muted-foreground text-sm font-medium mt-0.5">
            {title}
          </span>
        </div>
      </div>

      {/* Trend */}
      <div className="flex items-center gap-1.5 mt-4">
        <TrendIcon
          className={cn(
            "w-4 h-4",
            trend.isPositive
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-red-500 dark:text-red-400"
          )}
        />
        <span
          className={cn(
            "text-sm font-medium",
            trend.isPositive
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-red-500 dark:text-red-400"
          )}
        >
          {trend.value}%
        </span>
        <span className="text-muted-foreground text-sm">{description}</span>
      </div>
    </div>
  );
};

export default DashboardCard01;
