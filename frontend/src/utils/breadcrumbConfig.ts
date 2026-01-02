export interface BreadcrumbItem {
  title: string;
  path: string;
}

export const breadcrumbConfig: Record<string, BreadcrumbItem[]> = {
  // ================================================
  // dashboard routes
  // ================================================
  "/dashboard": [{ title: "Dashboard", path: "/dashboard" }],
  // ================================================
  // users-management routes
  // ================================================
  "/users": [{ title: "Users", path: "/users" }],
  "/users/:id": [
    { title: "Users", path: "/users" },
    { title: "User Details", path: "" },
  ],
  "/users/:id/profile": [
    { title: "Users", path: "/users" },
    { title: "User Details", path: "/users/:id" },
    { title: "Profile", path: "" },
  ],
  "/role": [
    { title: "Users", path: "/users" },
    { title: "Roles", path: "/role" },
  ],
  "/role/:id": [
    { title: "Users", path: "/users" },
    { title: "Roles", path: "/role" },
    { title: "Role Details", path: "" },
  ],
  "/role/create": [
    { title: "Users", path: "/users" },
    { title: "Roles", path: "/role" },
    { title: "Create Role", path: "" },
  ],
  "/permission": [
    { title: "Users", path: "/users" },
    { title: "Permissions", path: "/permission" },
  ],

  // ================================================
  // basedata routes
  // ================================================
  "/basedata": [{ title: "Base Data", path: "/basedata" }],
  "/issue_category": [
    { title: "Base Data", path: "/basedata" },
    { title: "Request Category", path: "/issue_category" },
  ],
  "/issue_category/:id": [
    { title: "Base Data", path: "/basedata" },
    { title: "Request Categories", path: "/issue_category" },
    { title: "Category Details", path: "" },
  ],

  "/issue_configuration": [
    { title: "Base Data", path: "/basedata" },
    { title: "Issue Configuration", path: "/issue_configuration" },
  ],

  "/issue_configuration/:id": [
    { title: "Base Data", path: "/basedata" },
    { title: "Issue Configuration", path: "/issue_configuration" },
    { title: "Configuration Details", path: "" },
  ],
  "/priority_level": [
    { title: "Base Data", path: "/basedata" },
    { title: "Priority Level", path: "/priority_level" },
  ],
  "/priority_level/:id": [
    { title: "Base Data", path: "/basedata" },
    { title: "Priority Level", path: "/priority_level" },
    { title: "Priority Details", path: "" },
  ],
  "/human_resource": [
    { title: "Base Data", path: "/basedata" },
    { title: "Human Resource", path: "/human_resource" },
  ],
  "/human_resource/:id": [
    { title: "Base Data", path: "/basedata" },
    { title: "Human Resource", path: "/human_resource" },
    { title: "Human Resource Details", path: "" },
  ],
  // ================================================

  
  "/project": [{ title: "Projects", path: "/project" }],
  "/project/:id": [
    { title: "Projects", path: "/project" },
    { title: "Project Details", path: "" },
  ],
  "/organization": [{ title: "Organizations", path: "/organization" }],
  "/organization/:id": [
    { title: "Organizations", path: "/organization" },
    { title: "Organization Details", path: "" },
  ],
  // ================================================
  // internal institutes routes
  // ================================================
  "/inistitutes": [{ title: "Institutes", path: "/inistitutes" }],
  "/inistitutes/:id": [
    { title: "Institutes", path: "/inistitutes" },
    { title: "Institute Details", path: "" },
  ],
  "/inistitutes/:id/projects": [
    { title: "Institutes", path: "/inistitutes" },
    { title: "Institute Details", path: "/inistitutes/:id" },
    { title: "Projects", path: "" },
  ],
  "/inistitutes/:instituteId/projects/:id": [
    { title: "Institutes", path: "/inistitutes" },
    { title: "Institute Details", path: "/inistitutes/:instituteId" },
    { title: "Projects", path: "" },
    { title: "Project Details", path: "" },
  ],
  // Backward compatibility - also support the old pattern
  "/inistitutes/:id/projects/:projectId": [
    { title: "Institutes", path: "/inistitutes" },
    { title: "Institute Details", path: "/inistitutes/:id" },
    { title: "Projects", path: "/inistitutes/:id/projects" },
    { title: "Project Details", path: "" },
  ],
  // Backward compatibility for existing route structure
  // Note: This route doesn't have institute ID in URL, so we can't link to institute detail
  // The institute ID would need to come from project data
 

  "/my_requests": [{ title: "My Requests", path: "/my_requests" }],
  "/add_issue": [
    { title: "My Requests", path: "/my_requests" },
    { title: "Create Request", path: "" },
  ],
  "/issue/:id": [
    { title: "My Requests", path: "/my_requests" },
    { title: "Request Details", path: "" },
  ],
  "/task": [{ title: "Tasks", path: "/task" }],
  "/task/:id": [
    { title: "Tasks", path: "/task" },
    { title: "Task Details", path: "" },
  ],
  "/task_list": [{ title: "Task List", path: "/task_list" }],
  "/task_list/:id": [
    { title: "Task List", path: "/task_list" },
    { title: "Task Details", path: "" },
  ],

  "/org_structure": [
    { title: "Organization Structure", path: "/org_structure" },
  ],
  "/org_structure/:id": [
    { title: "Organization Structure", path: "/org_structure" },
    { title: "Structure Details", path: "" },
  ],

  "/organization_profile": [
    { title: "Organization Profile", path: "/organization_profile" },
  ],

  "/issue_flow/:id": [{ title: "Issue Flow", path: "" }],
  "/profile": [
    { title: "Profile", path: "/profile" },
  ],
};
