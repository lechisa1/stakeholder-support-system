const Joi = require("joi");

// ✅ Schema for creating a new issue
const createIssueSchema = Joi.object({
  project_id: Joi.string().uuid().allow(null).optional().messages({
    "string.guid": "Invalid  project ID format",
    "any.required": "project ID is required",
  }),
  title: Joi.string().min(3).max(255).required().messages({
    "string.empty": "Title is required",
    "string.min": "Title must be at least 3 characters long",
    "string.max": "Title cannot exceed 255 characters",
  }),
  description: Joi.string().min(5).optional().allow(null, "").messages({
    "string.min": "Description must be at least 5 characters long",
  }),
  issue_description: Joi.string().max(255).optional().allow(null, "").messages({
    "string.max": "Issue description cannot exceed 255 characters",
  }),
  issue_category_id: Joi.string().uuid().allow(null).optional().messages({
    "string.guid": "Invalid issue category ID format",
  }),
  hierarchy_node_id: Joi.string().uuid().allow(null).optional().messages({
    "string.guid": "Invalid hierarchy node ID format",
  }),
  priority_id: Joi.string().uuid().allow(null).optional().messages({
    "string.guid": "Invalid priority ID format",
  }),
  reported_by: Joi.string().uuid().required().messages({
    "string.guid": "Invalid reporter ID format",
    "any.required": "Reported_by is required",
  }),
  assigned_to: Joi.string().uuid().allow(null).optional().messages({
    "string.guid": "Invalid assignee ID format",
  }),
  action_taken: Joi.string().max(255).optional().allow(null, "").messages({
    "string.max": "Action taken cannot exceed 255 characters",
  }),
  url_path: Joi.string().max(255).optional().allow(null, "").messages({
    "string.max": "URL path cannot exceed 255 characters",
  }),
  attachment_ids: Joi.array()
    .items(
      Joi.string().uuid().messages({
        "string.guid": "Invalid attachment ID format",
      })
    )
    .optional()
    .messages({
      "array.base": "Attachment IDs must be an array",
    }),

  issue_occured_time: Joi.date().optional().allow(null),
});

// ✅ Schema for updating an existing issue
const updateIssueSchema = Joi.object({
  institute_project_id: Joi.string().uuid().allow(null).optional().messages({
    "string.guid": "Invalid institute project ID format",
  }),
  title: Joi.string().min(3).max(255).optional().messages({
    "string.min": "Title must be at least 3 characters long",
    "string.max": "Title cannot exceed 255 characters",
  }),
  description: Joi.string().min(5).optional().allow(null, "").messages({
    "string.min": "Description must be at least 5 characters long",
  }),
  issue_description: Joi.string().max(255).optional().allow(null, "").messages({
    "string.max": "Issue description cannot exceed 255 characters",
  }),
  issue_category_id: Joi.string().uuid().allow(null).optional(),
  hierarchy_node_id: Joi.string().uuid().allow(null).optional(),
  priority_id: Joi.string().uuid().allow(null).optional(),
  status: Joi.string()
    .valid("pending", "in_progress", "resolved", "closed", "reopened")
    .optional()
    .messages({
      "any.only":
        "Status must be one of ['pending', 'in_progress', 'resolved', 'closed', 'reopened']",
    }),
  assigned_to: Joi.string().uuid().allow(null).optional(),
  action_taken: Joi.string().max(255).optional().allow(null, "").messages({
    "string.max": "Action taken cannot exceed 255 characters",
  }),
  url_path: Joi.string().max(255).optional().allow(null, "").messages({
    "string.max": "URL path cannot exceed 255 characters",
  }),
  issue_occured_time: Joi.date().optional().allow(null),
  status_change_reason: Joi.string().allow(null, "").optional(),
});

// ✅ Schema for query parameters (get issues)
const getIssuesQuerySchema = Joi.object({
  institute_project_id: Joi.string().uuid().optional().messages({
    "string.guid": "Invalid institute project ID format",
  }),
  status: Joi.string()
    .valid("pending", "in_progress", "resolved", "closed", "reopened")
    .optional()
    .messages({
      "any.only":
        "Status must be one of ['pending', 'in_progress', 'resolved', 'closed', 'reopened']",
    }),
  priority_id: Joi.string().uuid().optional().messages({
    "string.guid": "Invalid priority ID format",
  }),
  category_id: Joi.string().uuid().optional().messages({
    "string.guid": "Invalid category ID format",
  }),
  hierarchy_node_id: Joi.string().uuid().optional().messages({
    "string.guid": "Invalid hierarchy node ID format",
  }),
  assigned_to: Joi.string().uuid().optional().messages({
    "string.guid": "Invalid assignee ID format",
  }),
  reported_by: Joi.string().uuid().optional().messages({
    "string.guid": "Invalid reporter ID format",
  }),
  page: Joi.number().integer().min(1).optional().messages({
    "number.min": "Page must be at least 1",
  }),
  limit: Joi.number().integer().min(1).max(100).optional().messages({
    "number.min": "Limit must be at least 1",
    "number.max": "Limit cannot exceed 100",
  }),
});

// ✅ Schema for hierarchy_node_id parameter
const hierarchyNodeIdParamSchema = Joi.object({
  hierarchy_node_id: Joi.string().uuid().required().messages({
    "string.guid": "Invalid hierarchy node ID format",
    "any.required": "Hierarchy node ID is required",
  }),
});

// ✅ Schema for issue ID parameter
const issueIdParamSchema = Joi.object({
  id: Joi.string().uuid().required().messages({
    "string.guid": "Invalid issue ID format",
    "any.required": "Issue ID is required",
  }),
});

// ✅ Middleware for validation
const validateCreateIssue = (req, res, next) => {
  const { error } = createIssueSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({
      message: "Validation failed",
      errors: error.details.map((err) => err.message),
    });
  }
  next();
};

const validateUpdateIssue = (req, res, next) => {
  const { error } = updateIssueSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({
      message: "Validation failed",
      errors: error.details.map((err) => err.message),
    });
  }
  next();
};

const validateGetIssuesQuery = (req, res, next) => {
  const { error } = getIssuesQuerySchema.validate(req.query, {
    abortEarly: false,
  });
  if (error) {
    return res.status(400).json({
      message: "Query validation failed",
      errors: error.details.map((err) => err.message),
    });
  }
  next();
};

const validateIssueIdParam = (req, res, next) => {
  const { error } = issueIdParamSchema.validate(req.params, {
    abortEarly: false,
  });
  if (error) {
    return res.status(400).json({
      message: "Parameter validation failed",
      errors: error.details.map((err) => err.message),
    });
  }
  next();
};

const validateHierarchyNodeIdParam = (req, res, next) => {
  const { error } = hierarchyNodeIdParamSchema.validate(req.params, {
    abortEarly: false,
  });

  if (error) {
    return res.status(400).json({
      message: "Parameter validation failed",
      errors: error.details.map((err) => err.message),
    });
  }

  next();
};

module.exports = {
  validateCreateIssue,
  validateUpdateIssue,
  validateGetIssuesQuery,
  validateIssueIdParam,
  validateHierarchyNodeIdParam,
};
