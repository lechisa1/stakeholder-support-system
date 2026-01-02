import { z } from "zod";

/**
 * Common reusable validation rules
 * These can be used to build schemas consistently across forms
 */
export const rules = {
  /**
   * Required string field
   */
  required: (message?: string) => z.string().min(1, message || "This field is required"),

  /**
   * Optional string field
   */
  optionalString: z.string().optional(),

    /**
   * Optional textarea field
   */
    optionalTextarea: z.string().optional(),

    /**
     * Required textarea with predefined min (10) and max (500) characters
     */
    textarea: z.string()
      
      .min(10, "Description must be at least 10 characters")
      .max(500, "Description must not exceed 500 characters"),
  

  /**
   * Email validation
   */
  email: (message?: string) => 
    z.string().min(1, "Email is required").email(message || "Invalid email address"),

  /**
   * Optional email (can be empty or valid email)
   */
  optionalEmail: z.string().email("Invalid email address").optional().or(z.literal("")),

  /**
   * URL validation (optional)
   */
  url: (message?: string) => 
    z.string().url(message || "Invalid URL").optional().or(z.literal("")),

  /**
   * Required URL
   */
  requiredUrl: (message?: string) => 
    z.string().url(message || "Invalid URL").min(1, "URL is required"),

  /**
   * Number validation (coerces string to number)
   */
  number: (message?: string) => 
    z.coerce.number({
      message: message || "Must be a number",
    }),

  /**
   * Positive number (greater than 0)
   */
  positiveNumber: (message?: string) => 
    z.coerce.number({
      message: "Must be a number",
    }).positive(message || "Must be greater than 0"),

  /**
   * Optional number
   */
  optionalNumber: z.coerce.number().optional(),

  /**
   * Date string validation
   */
  date: (message?: string) => z.string().min(1, message || "Date is required"),

  /**
   * DateTime string validation
   */
  dateTime: (message?: string) => z.string().min(1, message || "Date and time is required"),

  /**
   * Optional date
   */
  optionalDate: z.string().optional(),

  /**
   * Boolean field
   */
  boolean: z.boolean().optional(),

  /**
   * Required boolean
   */
  requiredBoolean: z.boolean(),

  /**
   * String with minimum length
   */
  minLength: (min: number, message?: string) => 
    z.string().min(min, message || `Must be at least ${min} characters`),

  /**
   * String with maximum length
   */
  maxLength: (max: number, message?: string) => 
    z.string().max(max, message || `Must be at most ${max} characters`),

  /**
   * UUID string validation
   */
  uuid: (message?: string) => 
    z.string().uuid(message || "Invalid ID format").min(1, message || "This field is required"),

  /**
   * Optional UUID
   */
  optionalUuid: z.string().uuid("Invalid ID format").optional(),

  /**
   * Array of UUIDs
   */
  uuidArray: z.array(z.string().uuid()).optional(),

  /**
   * Required array (non-empty)
   */
  requiredArray: <T extends z.ZodTypeAny>(itemSchema: T, message?: string) =>
    z.array(itemSchema).min(1, message || "At least one item is required"),

  /**
   * Optional array
   */
  optionalArray: <T extends z.ZodTypeAny>(itemSchema: T) =>
    z.array(itemSchema).optional(),

  /**
   * Phone number validation (basic)
   */
  phone: (message?: string) => 
    z.string().regex(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/, 
      message || "Invalid phone number").optional(),

  /**
   * Color hex code validation
   */
  colorHex: (message?: string) => 
    z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 
      message || "Invalid color format (use hex code like #FF5733)").optional(),

  /**
   * Non-empty string (trimmed)
   */
  nonEmptyString: (message?: string) => 
    z.string().trim().min(1, message || "This field cannot be empty"),
};

/**
 * Helper to create a schema from an object shape
 * Provides type inference for the schema
 */
export function createSchema<T extends z.ZodRawShape>(shape: T) {
  return z.object(shape);
}

