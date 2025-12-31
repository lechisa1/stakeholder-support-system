export interface DashboardIssue {
  issue_id: string;
  ticket_number: string;
  status: string;
  created_at: string;
}

export interface DashboardProject {
  project_id: string;
  name: string;
  is_active: boolean;
  total_issues: number;
  issues: DashboardIssue[];
}

export interface DashboardInstitute {
  institute_id: string;
  name: string;
  is_active: boolean;
  total_projects: number;
  projects: DashboardProject[];
}

export interface DashboardSummary {
  total_institutes: number;
  total_projects: number;
  total_issues: number;
}

export interface DashboardResponse {
  success: boolean;
  message: string;
  data: {
    summary: DashboardSummary;
    institutes: DashboardInstitute[];
  };
}

export interface DashboardQueryParams {
  // Add any query params you might need in the future
  // e.g., date_range, status_filter, etc.
  start_date?: string;
  end_date?: string;
  status?: string;
  institute_id?: string;
  project_id?: string;
}
