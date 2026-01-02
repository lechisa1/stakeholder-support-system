import type { ReactNode } from "react";

export type ButtonVariant =
  | "default"
  | "secondary"
  | "outline"
  | "destructive"
  | "ghost";
export type ButtonSize = "sm" | "md" | "lg" | "default";

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: ReactNode;
}

export interface ActionButton {
  label: string;
  icon?: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  permissions?: string[];
  allowedFor?: string[];
}

export interface FilterField {
  key: string;
  label: string;
  type: "text" | "select" | "multiselect" | "date" | "daterange";
  placeholder?: string;
  options?: Array<{ label: string; value: string }>;
  value?: any;
  onChange: (value: any) => void;
}

export interface PageLayoutProps {
  title?: string;
  description?: string;
  actions?: ActionButton[];
  toggleActions?: ActionButton[];
  filters?: FilterField[];
  children?: ReactNode;
  filterColumnsPerRow?: number;
  toggle?: string;
  showtoggle?: boolean;
  onToggle?: (value: string) => void;
}

export interface DetailPageLayoutProps {
  title: string;
  description?: string;
  backTo: string;
  actions?: ActionButton[];
  children: ReactNode;
}
