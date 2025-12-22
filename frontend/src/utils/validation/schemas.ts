import { z } from "zod";
import { rules, createSchema } from "./rules";

/**
 * Authentication Schemas
 */

// Login schema (already exists, re-exported for consistency)
export const signInSchema = z.object({
  email: rules.email(),
  password: z.string().min(3, "Password must be at least 3 characters"),
});
export type SignInFormData = z.infer<typeof signInSchema>;

/**
 * Category Schemas
 */

export const categorySchema = createSchema({
  name: rules.nonEmptyString("Category name is required"),
  description: rules.textarea,
});
export type CategoryFormData = z.infer<typeof categorySchema>;

/**
 * Priority Schemas
 */

export const prioritySchema = createSchema({
  name: rules.nonEmptyString("Priority name is required"),
  description: rules.optionalString,
  response_duration: rules.optionalNumber,
  response_time: rules.positiveNumber("Please enter a valid response time").optional(),
  response_unit: z.enum(["hour", "day", "month"]).optional(),
  color_value: rules.colorHex(),
  color: rules.colorHex(),
  escalate: rules.boolean,
  is_active: rules.boolean,
});
export type PriorityFormData = z.infer<typeof prioritySchema>;

/**
 * Project Schemas
 */

export const projectSchema = createSchema({
  name: rules.nonEmptyString("Project name is required"),
  description: rules.optionalString,
  is_active: rules.boolean,
  institute_id: rules.optionalUuid,
  project_metrics_ids: rules.uuidArray,
  maintenance_start: rules.optionalDate,
  maintenance_end: rules.optionalDate,
});
export type ProjectFormData = z.infer<typeof projectSchema>;

/**
 * User Schemas
 */

export const userSchema = createSchema({
  full_name: rules.nonEmptyString("Full name is required"),
  email: rules.email(),
  phone_number: rules.phone(),
  user_type_id: rules.uuid("User type is required"),
  user_position_id: rules.optionalUuid,
  institute_id: rules.optionalUuid,
  role_ids: rules.uuidArray,
  hierarchy_node_id: rules.optionalUuid,
  branch_id: rules.optionalUuid,
  project_metrics_ids: rules.uuidArray,
  position: rules.optionalString,
  organization_name: rules.optionalString,
  user_type: z.enum(["internal_user", "external_user"]).optional(),
});
export type UserFormData = z.infer<typeof userSchema>;

// User update schema (all fields optional except at least one required)
export const userUpdateSchema = createSchema({
  full_name: rules.optionalString,
  email: rules.optionalEmail,
  phone_number: rules.phone(),
  position: rules.optionalString,
  user_type_id: rules.optionalUuid,
  institute_id: rules.optionalUuid,
  hierarchy_node_id: rules.optionalUuid,
  is_active: rules.boolean,
  role_ids: rules.uuidArray,
  project_metrics_ids: rules.uuidArray,
});
export type UserUpdateFormData = z.infer<typeof userUpdateSchema>;

/**
 * Issue Schemas
 */

export const issueSchema = createSchema({
  title: rules.nonEmptyString("Title is required"),
  project_id: rules.uuid("Project is required"),
  hierarchy_node_id: rules.optionalUuid,
  issue_category_id: rules.uuid("Category is required"),
  priority_id: rules.uuid("Priority is required"),
  description: rules.required("Description is required"),
  issue_description: rules.optionalString,
  issue_occured_time: rules.dateTime("Date and time is required"),
  url_path: rules.url(),
  action_taken: rules.optionalString,
  reported_by: rules.uuid("Reporter is required"),
  assigned_to: rules.optionalUuid,
  attachment_ids: rules.uuidArray,
  status: z.enum(["pending", "in_progress", "resolved", "closed"]).optional(),
});
export type IssueFormData = z.infer<typeof issueSchema>;

/**
 * Organization Schemas
 */

export const organizationSchema = createSchema({
  name: rules.nonEmptyString("Organization name is required"),
  description: rules.optionalString,
  is_active: rules.boolean,
});
export type OrganizationFormData = z.infer<typeof organizationSchema>;

/**
 * Institute Schemas
 */

export const instituteSchema = createSchema({
  name: rules.nonEmptyString("Institute name is required"),
  description: rules.optionalString,
  is_active: rules.boolean,
});
export type InstituteFormData = z.infer<typeof instituteSchema>;

/**
 * Hierarchy Schemas
 */

export const hierarchySchema = createSchema({
  name: rules.nonEmptyString("Hierarchy name is required"),
  description: rules.optionalString,
  project_id: rules.optionalUuid,
  is_active: rules.boolean,
});
export type HierarchyFormData = z.infer<typeof hierarchySchema>;

/**
 * Hierarchy Node Schemas
 */

export const hierarchyNodeSchema = createSchema({
  name: rules.nonEmptyString("Hierarchy node name is required"),
  description: rules.optionalString,
  parent_hierarchy_node_id: rules.optionalUuid,
  hierarchy_id: rules.optionalUuid,
  is_active: rules.boolean,
});
export type HierarchyNodeFormData = z.infer<typeof hierarchyNodeSchema>;

/**
 * Role Schemas
 */

export const roleSchema = createSchema({
  name: rules.nonEmptyString("Role name is required"),
  description: rules.optionalString,
  permission_ids: rules.uuidArray,
  is_active: rules.boolean,
});
export type RoleFormData = z.infer<typeof roleSchema>;

/**
 * Project Metric Schemas
 */

export const projectMetricSchema = createSchema({
  name: rules.nonEmptyString("Metric name is required"),
  description: rules.optionalString,
  weight: rules.optionalNumber,
  is_active: rules.boolean,
});
export type ProjectMetricFormData = z.infer<typeof projectMetricSchema>;

/**
 * Profile Schemas
 */

export const profileUpdateSchema = createSchema({
  full_name: rules.nonEmptyString("Full name is required"),
  email: rules.email(),
  phone_number: rules.phone(),
  position: rules.optionalString,
});
export type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>;

export const changePasswordSchema = createSchema({
  currentPassword: rules.required("Current password is required"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: rules.required("Please confirm your password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

/**
 * Export all schemas as a single object for easy access
 */
export const schemas = {
  // Auth
  signIn: signInSchema,
  
  // Categories
  category: categorySchema,
  
  // Priorities
  priority: prioritySchema,
  
  // Projects
  project: projectSchema,
  
  // Users
  user: userSchema,
  userUpdate: userUpdateSchema,
  
  // Issues
  issue: issueSchema,
  
  // Organizations
  organization: organizationSchema,
  
  // Institutes
  institute: instituteSchema,
  
  // Hierarchies
  hierarchy: hierarchySchema,
  hierarchyNode: hierarchyNodeSchema,
  
  // Roles
  role: roleSchema,
  
  // Project Metrics
  projectMetric: projectMetricSchema,
  
  // Profile
  profileUpdate: profileUpdateSchema,
  changePassword: changePasswordSchema,
};

