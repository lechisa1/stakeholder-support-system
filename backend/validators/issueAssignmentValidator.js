const Joi = require("joi");

// UUID validation helper
const uuidSchema = Joi.string().guid({ version: "uuidv4" }).messages({
  "string.guid": "{{#label}} must be a valid UUID",
});

// Assignment status enum
const assignmentStatus = ["pending", "accepted", "rejected", "completed"];

// Create Assignment Schema
const createAssignmentSchema = Joi.object({
  issue_id: uuidSchema.required().messages({
    "any.required": "Issue ID is required",
  }),
  assignee_id: uuidSchema.required().messages({
    "any.required": "Assignee ID is required",
  }),
  assigned_by: uuidSchema.required().messages({
    "any.required": "Assigned by user ID is required",
  }),
  remarks: Joi.string().allow("", null).optional().messages({
    "string.base": "Remarks must be a string",
  }),
  attachment_ids: Joi.array().items(uuidSchema).optional().messages({
    "array.base": "Attachment IDs must be an array",
    "array.includes": "Each attachment ID must be a valid UUID",
  }),
});

// Update Assignment Status Schema
const updateAssignmentStatusSchema = Joi.object({
  status: Joi.string()
    .valid(...assignmentStatus)
    .optional()
    .messages({
      "any.only": `Status must be one of: ${assignmentStatus.join(", ")}`,
    }),
  remarks: Joi.string().allow("", null).optional().messages({
    "string.base": "Remarks must be a string",
  }),
});

// Remove Assignment Schema (by assignment_id)
const removeAssignmentSchema = Joi.object({
  removed_by: uuidSchema.required().messages({
    "any.required": "Removed by user ID is required",
  }),
  reason: Joi.string().optional().allow("", null).messages({
    "string.base": "Reason must be a string",
  }),
});

// Remove Assignment by Assignee and Issue Schema (body)
const removeAssignmentByAssigneeSchema = Joi.object({
  removed_by: uuidSchema.required().messages({
    "any.required": "Removed by user ID is required",
  }),
  reason: Joi.string().optional().allow("", null).messages({
    "string.base": "Reason must be a string",
  }),
});

// Issue and Assignee ID Params Schema
const issueAssigneeParamsSchema = Joi.object({
  issue_id: uuidSchema.required().messages({
    "any.required": "Issue ID is required",
  }),
  assignee_id: uuidSchema.required().messages({
    "any.required": "Assignee ID is required",
  }),
});

// Assignment ID Param Schema
const assignmentIdParamSchema = Joi.object({
  assignment_id: uuidSchema.required().messages({
    "any.required": "Assignment ID is required",
  }),
});

// Issue ID Param Schema
const issueIdParamSchema = Joi.object({
  issue_id: uuidSchema.required().messages({
    "any.required": "Issue ID is required",
  }),
});

// User ID Param Schema
const userIdParamSchema = Joi.object({
  user_id: uuidSchema.required().messages({
    "any.required": "User ID is required",
  }),
});

// -------------------------
// Validation middleware
// -------------------------

exports.validateAssignIssue = (req, res, next) => {
  const { error } = createAssignmentSchema.validate(req.body, {
    abortEarly: false,
  });
  if (error) {
    return res.status(400).json({
      message: "Validation failed",
      errors: error.details.map((err) => err.message),
    });
  }
  next();
};

exports.validateUpdateAssignmentStatus = (req, res, next) => {
  // Validate params first
  const paramValidation = assignmentIdParamSchema.validate(req.params);
  if (paramValidation.error) {
    return res.status(400).json({
      message: "Validation failed",
      errors: paramValidation.error.details.map((err) => err.message),
    });
  }

  // Validate body
  const bodyValidation = updateAssignmentStatusSchema.validate(req.body, {
    abortEarly: false,
  });
  if (bodyValidation.error) {
    return res.status(400).json({
      message: "Validation failed",
      errors: bodyValidation.error.details.map((err) => err.message),
    });
  }
  next();
};

// Validate removal by assignment_id (DELETE /:assignment_id)
exports.validateRemoveAssignment = (req, res, next) => {
  // Validate params first
  const paramValidation = assignmentIdParamSchema.validate(req.params);
  if (paramValidation.error) {
    return res.status(400).json({
      message: "Validation failed",
      errors: paramValidation.error.details.map((err) => err.message),
    });
  }

  // Validate body
  const bodyValidation = removeAssignmentSchema.validate(req.body, {
    abortEarly: false,
  });
  if (bodyValidation.error) {
    return res.status(400).json({
      message: "Validation failed",
      errors: bodyValidation.error.details.map((err) => err.message),
    });
  }

  next();
};

// Validate removal by issue_id + assignee_id (DELETE /issue/:issue_id/assignee/:assignee_id)
exports.validateRemoveAssignmentByAssignee = (req, res, next) => {
  // Validate route params first
  const paramValidation = issueAssigneeParamsSchema.validate(req.params);
  if (paramValidation.error) {
    return res.status(400).json({
      message: "Validation failed",
      errors: paramValidation.error.details.map((err) => err.message),
    });
  }

  // Validate body
  const bodyValidation = removeAssignmentByAssigneeSchema.validate(req.body, {
    abortEarly: false,
  });
  if (bodyValidation.error) {
    return res.status(400).json({
      message: "Validation failed",
      errors: bodyValidation.error.details.map((err) => err.message),
    });
  }

  next();
};

exports.validateAssignmentId = (req, res, next) => {
  const { error } = assignmentIdParamSchema.validate(req.params);
  if (error) {
    return res.status(400).json({
      message: "Validation failed",
      errors: error.details.map((err) => err.message),
    });
  }
  next();
};

exports.validateIssueId = (req, res, next) => {
  const { error } = issueIdParamSchema.validate(req.params);
  if (error) {
    return res.status(400).json({
      message: "Validation failed",
      errors: error.details.map((err) => err.message),
    });
  }
  next();
};

exports.validateUserId = (req, res, next) => {
  const { error } = userIdParamSchema.validate(req.params);
  if (error) {
    return res.status(400).json({
      message: "Validation failed",
      errors: error.details.map((err) => err.message),
    });
  }
  next();
};

// Export schemas for testing if needed
exports.schemas = {
  createAssignmentSchema,
  updateAssignmentStatusSchema,
  removeAssignmentSchema,
  removeAssignmentByAssigneeSchema,
  issueAssigneeParamsSchema,
  assignmentIdParamSchema,
  issueIdParamSchema,
  userIdParamSchema,
};
