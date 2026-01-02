# Validation Utilities

This directory contains all form validation utilities and schemas for the project.

## Files Structure

### 1. `validateForm.ts`
Core validation functions:
- `validateForm()` - Validates data and returns errors object for inline display
- `getFirstValidationError()` - Returns first error message (for toast notifications)
- `createDynamicSchema()` - Creates schema from dynamic field definitions
- `validateField()` - Validates single field (for real-time validation)

### 2. `rules.ts`
Reusable validation rules:
- Common rules like `required`, `email`, `url`, `number`, etc.
- Helper function `createSchema()` for type-safe schema creation

### 3. `schemas.ts`
Pre-defined schemas for all forms:
- Authentication (signIn)
- Categories, Priorities, Projects
- Users, Issues, Organizations
- Hierarchies, Roles, Project Metrics
- Profile updates, Password changes

### 4. `index.ts`
Central export point - import everything from here

## Usage Examples

### Basic Form Validation (Inline Errors)

```typescript
import { validateForm, schemas } from "../../utils/validation";

const [errors, setErrors] = useState<Record<string, string>>({});

const handleSubmit = async () => {
  const validation = validateForm(formData, schemas.category);
  
  if (!validation.isValid) {
    setErrors(validation.errors);
    return;
  }
  
  // Clear errors and proceed
  setErrors({});
  // ... submit form
};
```

### Using with Toast (Simple Forms)

```typescript
import { getFirstValidationError, schemas } from "../../utils/validation";
import { toast } from "sonner";

const handleSubmit = async () => {
  const error = getFirstValidationError(formData, schemas.category);
  if (error) {
    toast.error(error);
    return;
  }
  
  // ... submit form
};
```

### Dynamic Field Forms

```typescript
import { createDynamicSchema, validateForm } from "../../utils/validation";

const schema = createDynamicSchema([
  { id: "name", required: true, label: "Name", type: "text" },
  { id: "description", required: false, label: "Description" },
  { id: "count", required: true, label: "Count", type: "number" },
]);

const validation = validateForm(formValues, schema);
if (!validation.isValid) {
  setErrors(validation.errors);
  return;
}
```

### Displaying Errors in Components

Your Input and TextArea components already support error display:

```tsx
<Input
  value={formData.name}
  onChange={handleChange}
  error={!!errors.name}        // Shows red border
  hint={errors.name}            // Shows error message below
/>

<TextArea
  value={formData.description}
  onChange={handleChange}
  error={!!errors.description}  // Shows red border
  hint={errors.description}      // Shows error message below
/>
```

## Available Schemas

All schemas are exported from `schemas.ts` and available via the `schemas` object:

- `schemas.signIn` - Login form
- `schemas.category` - Issue category
- `schemas.priority` - Priority level
- `schemas.project` - Project
- `schemas.user` - User creation
- `schemas.userUpdate` - User update
- `schemas.issue` - Issue creation
- `schemas.organization` - Organization
- `schemas.institute` - Institute
- `schemas.hierarchy` - Hierarchy
- `schemas.hierarchyNode` - Hierarchy node
- `schemas.role` - Role
- `schemas.projectMetric` - Project metric
- `schemas.profileUpdate` - Profile update
- `schemas.changePassword` - Password change

## Type Safety

All schemas export TypeScript types:

```typescript
import { type CategoryFormData } from "../../utils/validation";

const formData: CategoryFormData = {
  name: "My Category",
  description: "Description",
};
```

## Next Steps

1. Add validation to forms incrementally
2. Use `validateForm()` for inline error display
3. Use `getFirstValidationError()` for toast notifications
4. Use `createDynamicSchema()` for dynamic field-based forms

