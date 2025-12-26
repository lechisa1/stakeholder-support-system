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
// color_value
// : 
// "#aabbcc"
// description
// : 
// "checking"
// is_active
// : 
// false
// name
// : 
// "high"
// response_duration
// : 
// 10
// response_unit
// : 
// "hour"
export const prioritySchema = createSchema({
  name: rules.required("Priority name is required"),
  description: rules.required("Description is required"),
  response_duration: z.coerce.number({
    message: "Response time must be a number",
  }).positive("Response time must be greater than 0"),
  
  response_unit: z.enum(["hour", "day", "month"], "Response unit is required"),
  color_value: rules.colorHex("Color have to be in hex format like #aabbcc"),
  is_active: z.boolean()
});

export type PriorityFormData = z.infer<typeof prioritySchema>;

/**
 * Project Schemas
 */

export const projectSchema = z
  .object({
    name: z.string().min(1, "Project name is required"),

    description: z
      .string()
      .min(10, "Description must be at least 10 characters")
      .max(500, "Description must not exceed 500 characters"),

    is_active: z.boolean().optional(),

    maintenance_start: z.date({
      message: "Start date is required",
    }),

    maintenance_end: z.date({
      message: "End date is required",
    }),

    project_metrics_ids: z
      .array(z.string())
      .min(1, "Select at least one skill"),
  })
  .refine(
    (data) => data.maintenance_start < data.maintenance_end,
    {
      message: "End date must be in the future of start date",
      path: ["maintenance_end"],
    }
  );

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

export const createUserSchema = z
  .object({
    full_name: rules.nonEmptyString("Full name is required"),
    email: rules.email(),
    phone_number: rules.phone(),
    position: rules.optionalString,
    institute_id: rules.optionalUuid,
    user_type: z.enum(["internal_user", "external_user"], {
      message: "User type is required",
    }),
    role_ids: z.array(z.string()).min(1, "Select at least one role"),
    project_metrics_ids: z.array(z.string()).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.user_type === "external_user" && !data.institute_id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Institute is required for external users",
        path: ["institute_id"],
      });
    }

    if (
      data.user_type === "internal_user" &&
      (!data.project_metrics_ids || data.project_metrics_ids.length === 0)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Select at least one skill",
        path: ["project_metrics_ids"],
      });
    }
  });
export type CreateUserFormData = z.infer<typeof createUserSchema>;

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
  name: rules.nonEmptyString("Structure name is required"),
  description: rules.optionalString,
  project_id: rules.optionalUuid,
  is_active: rules.boolean,
});
export type HierarchyFormData = z.infer<typeof hierarchySchema>;

/**
 * Hierarchy Node Schemas
 */

export const hierarchyNodeSchema = createSchema({
  name: rules.nonEmptyString("Structure name is required"),
  parent_id: rules.optionalUuid,
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
  name: rules.nonEmptyString("Human resource name is required"),
  description: rules.optionalString,
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
  userUpdate: userUpdateSchema,
  createUser: createUserSchema,
  
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

