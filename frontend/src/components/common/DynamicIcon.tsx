import React from "react";
import {
  Home,
  Users,
  Building2,
  Landmark,
  Database,
  FileWarning,
  ClipboardList,
  ClipboardCheck,
  ChartPieIcon,
  PlugIcon,
  ChevronDownIcon,
  HelpCircle,
} from "lucide-react";

// Map icon names to actual components
const iconMap: Record<string, React.ElementType> = {
  Home,
  Users,
  Building2,
  Landmark,
  Database,
  FileWarning,
  ClipboardList,
  ClipboardCheck,
  ChartPieIcon,
  PlugIcon,
  ChevronDownIcon,
};

type DynamicIconProps = {
  name: string;
  className?: string;
  size?: number;
  color?: string;
};

const DynamicIcon: React.FC<DynamicIconProps> = ({
  name,
  className,
  size = 20,
  color = "currentColor",
}) => {
  const IconComponent = iconMap[name];

  if (!IconComponent) {
    return <HelpCircle />;
  }

  return <IconComponent className={className} size={size} color={color} />;
};

export default DynamicIcon;
