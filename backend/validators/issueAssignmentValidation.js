const Joi = require("joi");

// ✅ Schema for assigning an issue
const assignIssueSchema = Joi.object({
  issue_id: Joi.string().uuid().required().messages({
    "string.guid": "Invalid issue ID format",
    "any.required": "Issue ID is required",
  }),
  assignee_id: Joi.string().uuid().required().messages({
    "string.guid": "Invalid assignee ID format",
    "any.required": "Assignee ID is required",
  }),
  assigned_by: Joi.string().uuid().required().messages({
    "string.guid": "Invalid assigned_by ID format",
    "any.required": "Assigned_by ID is required",
  }),
  remarks: Joi.string().allow(null, "").optional(),
});

// ✅ Schema for updating assignment status
const updateAssignmentStatusSchema = Joi.object({
  status: Joi.string()
    .valid("pending", "in_progress", "completed", "rejected")
    .optional()
    .messages({
      "any.only":
        "Status must be one of ['pending', 'in_progress', 'completed', 'rejected']",
    }),
  remarks: Joi.string().allow(null, "").optional(),
});

// ✅ Validation middleware
exports.validateAssignIssue = (req, res, next) => {
  const { error } = assignIssueSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({
      errors: error.details.map((err) => err.message),
    });
  }
  next();
};

exports.validateUpdateAssignmentStatus = (req, res, next) => {
  const { error } = updateAssignmentStatusSchema.validate(req.body, {
    abortEarly: false,
  });
  if (error) {
    return res.status(400).json({
      errors: error.details.map((err) => err.message),
    });
  }
  next();
};
