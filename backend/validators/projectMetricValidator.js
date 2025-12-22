const Joi = require("joi");

// Base project metric schema
const projectMetricBaseSchema = {
  name: Joi.string().max(150).required().messages({
    "string.empty": "Project metric name is required",
    "string.max": "Project metric name must not exceed 150 characters",
    "any.required": "Project metric name is required",
  }),
  description: Joi.string().allow("", null).optional(),
  weight: Joi.number().min(0).max(1).precision(2).optional().messages({
    "number.min": "Weight must be between 0 and 1",
    "number.max": "Weight must be between 0 and 1",
    "number.precision": "Weight can have up to 2 decimal places",
  }),
  is_active: Joi.boolean().optional(),
  user_ids: Joi.array().items(Joi.string().uuid()).optional().messages({
    "array.base": "User IDs must be an array",
    "string.guid": "Each user ID must be a valid UUID",
  }),
  project_ids: Joi.array().items(Joi.string().uuid()).optional().messages({
    "array.base": "Project IDs must be an array",
    "string.guid": "Each project ID must be a valid UUID",
  }),
};

// Create project metric validator
const validateCreateProjectMetric = (req, res, next) => {
  const schema = Joi.object({
    ...projectMetricBaseSchema,
  });

  const { error } = schema.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    return res.status(400).json({
      message: "Validation error",
      errors: error.details.map((detail) => detail.message),
    });
  }
  next();
};

// Update project metric validator
const validateUpdateProjectMetric = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().max(150).optional().messages({
      "string.max": "Project metric name must not exceed 150 characters",
    }),
    description: Joi.string().allow("", null).optional(),
    weight: Joi.number().min(0).max(1).precision(2).optional().messages({
      "number.min": "Weight must be between 0 and 1",
      "number.max": "Weight must be between 0 and 1",
      "number.precision": "Weight can have up to 2 decimal places",
    }),
    is_active: Joi.boolean().optional(),
    user_ids: Joi.array().items(Joi.string().uuid()).optional().messages({
      "array.base": "User IDs must be an array",
      "string.guid": "Each user ID must be a valid UUID",
    }),
    project_ids: Joi.array().items(Joi.string().uuid()).optional().messages({
      "array.base": "Project IDs must be an array",
      "string.guid": "Each project ID must be a valid UUID",
    }),
  })
    .min(1)
    .messages({
      "object.min": "At least one field is required for update",
    });

  const { error } = schema.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    return res.status(400).json({
      message: "Validation error",
      errors: error.details.map((detail) => detail.message),
    });
  }
  next();
};

// Assign metrics to user validator
const validateAssignMetricsToUser = (req, res, next) => {
  const schema = Joi.object({
    metric_ids: Joi.array()
      .items(Joi.string().uuid())
      .min(1)
      .required()
      .messages({
        "array.base": "Metric IDs must be an array",
        "array.min": "At least one metric ID is required",
        "any.required": "Metric IDs are required",
        "string.guid": "Each metric ID must be a valid UUID",
      }),
    values: Joi.array()
      .items(Joi.number().min(0).precision(2))
      .optional()
      .messages({
        "array.base": "Values must be an array",
        "number.min": "Value must be a positive number",
        "number.precision": "Value can have up to 2 decimal places",
      }),
  });

  const { error } = schema.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    return res.status(400).json({
      message: "Validation error",
      errors: error.details.map((detail) => detail.message),
    });
  }
  next();
};

// Assign metrics to project validator
const validateAssignMetricsToProject = (req, res, next) => {
  const schema = Joi.object({
    metric_ids: Joi.array()
      .items(Joi.string().uuid())
      .min(1)
      .required()
      .messages({
        "array.base": "Metric IDs must be an array",
        "array.min": "At least one metric ID is required",
        "any.required": "Metric IDs are required",
        "string.guid": "Each metric ID must be a valid UUID",
      }),
  });

  const { error } = schema.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    return res.status(400).json({
      message: "Validation error",
      errors: error.details.map((detail) => detail.message),
    });
  }
  next();
};

// Remove metrics from user/project validator
const validateRemoveMetrics = (req, res, next) => {
  const schema = Joi.object({
    metric_ids: Joi.array()
      .items(Joi.string().uuid())
      .min(1)
      .required()
      .messages({
        "array.base": "Metric IDs must be an array",
        "array.min": "At least one metric ID is required",
        "any.required": "Metric IDs are required",
        "string.guid": "Each metric ID must be a valid UUID",
      }),
  });

  const { error } = schema.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    return res.status(400).json({
      message: "Validation error",
      errors: error.details.map((detail) => detail.message),
    });
  }
  next();
};

// Update user metric value validator
const validateUpdateUserMetricValue = (req, res, next) => {
  const schema = Joi.object({
    value: Joi.number().min(0).precision(2).allow(null).optional().messages({
      "number.min": "Value must be a positive number",
      "number.precision": "Value can have up to 2 decimal places",
    }),
  });

  const { error } = schema.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    return res.status(400).json({
      message: "Validation error",
      errors: error.details.map((detail) => detail.message),
    });
  }
  next();
};

// UUID parameter validator
const validateUUIDParam = (req, res, next) => {
  const schema = Joi.object({
    id: Joi.string().uuid().required().messages({
      "string.guid": "Invalid UUID format",
      "any.required": "ID parameter is required",
    }),
  });

  const { error } = schema.validate(req.params, {
    abortEarly: false,
  });

  if (error) {
    return res.status(400).json({
      message: "Validation error",
      errors: error.details.map((detail) => detail.message),
    });
  }
  next();
};

// User ID parameter validator
const validateUserIDParam = (req, res, next) => {
  const schema = Joi.object({
    user_id: Joi.string().uuid().required().messages({
      "string.guid": "Invalid user UUID format",
      "any.required": "User ID parameter is required",
    }),
  });

  const { error } = schema.validate(req.params, {
    abortEarly: false,
  });

  if (error) {
    return res.status(400).json({
      message: "Validation error",
      errors: error.details.map((detail) => detail.message),
    });
  }
  next();
};

// Project ID parameter validator
const validateProjectIDParam = (req, res, next) => {
  const schema = Joi.object({
    project_id: Joi.string().uuid().required().messages({
      "string.guid": "Invalid project UUID format",
      "any.required": "Project ID parameter is required",
    }),
  });

  const { error } = schema.validate(req.params, {
    abortEarly: false,
  });

  if (error) {
    return res.status(400).json({
      message: "Validation error",
      errors: error.details.map((detail) => detail.message),
    });
  }
  next();
};

// User ID and Metric ID parameters validator
const validateUserMetricParams = (req, res, next) => {
  const schema = Joi.object({
    user_id: Joi.string().uuid().required().messages({
      "string.guid": "Invalid user UUID format",
      "any.required": "User ID parameter is required",
    }),
    metric_id: Joi.string().uuid().required().messages({
      "string.guid": "Invalid metric UUID format",
      "any.required": "Metric ID parameter is required",
    }),
  });

  const { error } = schema.validate(req.params, {
    abortEarly: false,
  });

  if (error) {
    return res.status(400).json({
      message: "Validation error",
      errors: error.details.map((detail) => detail.message),
    });
  }
  next();
};

module.exports = {
  validateCreateProjectMetric,
  validateUpdateProjectMetric,
  validateAssignMetricsToUser,
  validateAssignMetricsToProject,
  validateRemoveMetrics,
  validateUpdateUserMetricValue,
  validateUUIDParam,
  validateUserIDParam,
  validateProjectIDParam,
  validateUserMetricParams,
};
