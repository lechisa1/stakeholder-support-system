import { z } from "zod";

/**
 * Validation result type
 */
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

/**
 * Validates form data against a Zod schema and returns errors object for inline display
 * 
 * @param data - The form data to validate
 * @param schema - The Zod schema to validate against
 * @returns Object with isValid boolean and errors record (field name -> error message)
 * 
 * @example
 * const validation = validateForm(formData, schemas.category);
 * if (!validation.isValid) {
 *   setErrors(validation.errors);
 *   return;
 * }
 */
export function validateForm<T>(
  data: T,
  schema: z.ZodSchema<T>
): ValidationResult {
  try {
    schema.parse(data);
    return { isValid: true, errors: {} };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.issues.forEach((issue) => {
        const fieldName = issue.path[0] as string;
        if (fieldName) {
          // If multiple errors for same field, keep the first one
          if (!errors[fieldName]) {
            errors[fieldName] = issue.message;
          }
        }
      });
      return { isValid: false, errors };
    }
    return { isValid: false, errors: { _general: "Validation failed" } };
  }
}

/**
 * Validates form data and returns the first error message
 * Useful for simple forms where you just want to show a toast error
 * Note: Caller should handle showing the toast (avoids circular dependencies)
 * 
 * @param data - The form data to validate
 * @param schema - The Zod schema to validate against
 * @returns Error message string if invalid, null if valid
 * 
 * @example
 * const error = validateWithToast(formData, schemas.category);
 * if (error) {
 *   toast.error(error);
 *   return;
 * }
 */
export function getFirstValidationError<T>(
  data: T,
  schema: z.ZodSchema<T>
): string | null {
  const result = validateForm(data, schema);
  if (!result.isValid) {
    const firstError = Object.values(result.errors)[0];
    return firstError || "Please check the form for errors";
  }
  return null;
}

/**
 * Creates a dynamic schema from field definitions
 * Useful for forms that use the dynamic fields pattern
 * 
 * @param fields - Array of field definitions with id, required, and label
 * @returns Zod object schema
 * 
 * @example
 * const schema = createDynamicSchema([
 *   { id: "name", required: true, label: "Name" },
 *   { id: "description", required: false, label: "Description" }
 * ]);
 */
export function createDynamicSchema(
  fields: Array<{ id: string; required?: boolean; label: string; type?: string }>
): z.ZodObject<Record<string, z.ZodTypeAny>> {
  const shape: Record<string, z.ZodTypeAny> = {};
  
  fields.forEach((field) => {
    if (field.required) {
      if (field.type === "number") {
        shape[field.id] = z.coerce.number({
          message: `${field.label} must be a number`,
        }).refine((val) => val !== undefined && val !== null, {
          message: `${field.label} is required`,
        });
      } else if (field.type === "toggle" || field.type === "checkbox") {
        shape[field.id] = z.boolean();
      } else {
        shape[field.id] = z.string().min(1, `${field.label} is required`);
      }
    } else {
      shape[field.id] = z.unknown().optional();
    }
  });
  
  return z.object(shape);
}

/**
 * Validates a specific field value against a schema
 * Useful for real-time validation on blur
 * 
 * @param fieldName - The name of the field to validate
 * @param value - The value to validate
 * @param schema - The full schema (will extract field schema)
 * @returns Error message or null if valid
 */
export function validateField<T extends z.ZodObject<Record<string, z.ZodTypeAny>>>(
  fieldName: string,
  value: unknown,
  schema: T
): string | null {
  try {
    // Create a partial schema for just this field
    const fieldSchema = schema.shape[fieldName];
    if (!fieldSchema) return null;
    
    fieldSchema.parse(value);
    return null;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return error.issues[0]?.message || null;
    }
    return "Invalid value";
  }
}

