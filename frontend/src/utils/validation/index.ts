/**
 * Validation Utilities
 * 
 * Central export point for all validation utilities and schemas
 */

// Core validation functions
export {
  validateForm,
  getFirstValidationError,
  createDynamicSchema,
  validateField,
  type ValidationResult,
} from "./validateForm";

// Validation rules
export { rules, createSchema } from "./rules";

// All schemas
export {
  schemas,
  // Auth
  signInSchema,
  type SignInFormData,
  // Categories
  categorySchema,
  type CategoryFormData,
  // Priorities
  prioritySchema,
  type PriorityFormData,
  // Projects
  projectSchema,
  type ProjectFormData,
  // Users
  createUserSchema,
  type CreateUserFormData,
  userUpdateSchema,
  type UserUpdateFormData,
  // Issues
  issueSchema,
  type IssueFormData,
  // Organizations
  organizationSchema,
  type OrganizationFormData,
  // Institutes
  instituteSchema,
  type InstituteFormData,
  // Hierarchies
  hierarchySchema,
  hierarchyNodeSchema,
  type HierarchyFormData,
  type HierarchyNodeFormData,
  // Roles
  roleSchema,
  type RoleFormData,
  // Project Metrics
  projectMetricSchema,
  type ProjectMetricFormData,
  // Profile
  profileUpdateSchema,
  changePasswordSchema,
  type ProfileUpdateFormData,
  type ChangePasswordFormData,
} from "./schemas";

