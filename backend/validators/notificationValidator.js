const Joi = require("joi");

// Schema for marking notification as read
const markAsReadSchema = Joi.object({
  notification_id: Joi.string().uuid().required().messages({
    "any.required": "Notification ID is required.",
    "string.guid": "Notification ID must be a valid UUID.",
  }),
});

// Schema for sending notification to parent hierarchy users
const sendToParentHierarchySchema = Joi.object({
  sender_id: Joi.string().uuid().required().messages({
    "any.required": "Sender ID is required.",
  }),
  project_id: Joi.string().uuid().required().messages({
    "any.required": "Project ID is required.",
  }),
  issue_id: Joi.string().uuid().optional(),
  hierarchy_node_id: Joi.string().uuid().optional(),
  message: Joi.string().min(1).max(500).optional(),
  title: Joi.string().min(1).max(100).optional(),
});

// Schema for immediate parent notification
const sendToImmediateParentSchema = Joi.object({
  sender_id: Joi.string().uuid().required().messages({
    "any.required": "Sender ID is required.",
  }),
  project_id: Joi.string().uuid().required().messages({
    "any.required": "Project ID is required.",
  }),
  issue_id: Joi.string().uuid().optional(),
  hierarchy_node_id: Joi.string().uuid().optional(),
  message: Joi.string().min(1).max(500).optional(),
  title: Joi.string().min(1).max(100).optional(),
});

// Schema for notifying issue creator when solved
const notifyIssueCreatorSchema = Joi.object({
  issue_id: Joi.string().uuid().required().messages({
    "any.required": "Issue ID is required.",
  }),
  resolver_id: Joi.string().uuid().required().messages({
    "any.required": "Resolver ID is required.",
  }),
  solution_details: Joi.string().allow(null, "").optional(),
});

// Schema for notifying solver on confirmation/rejection
const notifySolverSchema = Joi.object({
  issue_id: Joi.string().uuid().required().messages({
    "any.required": "Issue ID is required.",
  }),
  creator_id: Joi.string().uuid().required().messages({
    "any.required": "Creator ID is required.",
  }),
  is_confirmed: Joi.boolean().required().messages({
    "any.required": "Confirmation status is required.",
  }),
  rejection_reason: Joi.string().allow(null, "").optional(),
});

// Schema for sending general notification
const sendGeneralNotificationSchema = Joi.object({
  sender_id: Joi.string().uuid().allow(null).optional(),
  receiver_ids: Joi.array()
    .items(Joi.string().uuid())
    .min(1)
    .required()
    .messages({
      "any.required": "Receiver IDs are required.",
      "array.min": "At least one receiver ID is required.",
    }),
  type: Joi.string()
    .valid(
      "ISSUE_CREATED",
      "ISSUE_ASSIGNED",
      "ISSUE_RESOLVED",
      "ISSUE_CONFIRMED",
      "ISSUE_REJECTED",
      "ISSUE_REOPENED",
      "ISSUE_ESCALATED",
      "ISSUE_COMMENTED",
      "PASSWORD_UPDATED",
      "LOGIN_ALERT",
      "USER_DEACTIVATED",
      "USER_REACTIVATED",
      "PROFILE_UPDATED",
      "SYSTEM_ALERT",
      "BROADCAST_MESSAGE"
    )
    .optional(),
  title: Joi.string().min(1).max(100).required().messages({
    "any.required": "Title is required.",
    "string.min": "Title must be at least 1 character.",
    "string.max": "Title cannot exceed 100 characters.",
  }),
  message: Joi.string().min(1).max(1000).required().messages({
    "any.required": "Message is required.",
    "string.min": "Message must be at least 1 character.",
    "string.max": "Message cannot exceed 1000 characters.",
  }),
  priority: Joi.string()
    .valid("LOW", "MEDIUM", "HIGH", "URGENT")
    .default("MEDIUM"),
  channel: Joi.string()
    .valid("IN_APP", "EMAIL", "SMS", "PUSH", "ALL")
    .default("IN_APP"),
  data: Joi.object().optional(),
  expires_at: Joi.date().optional(),
});

// Schema for pagination and filters
const notificationsQuerySchema = Joi.object({
  is_read: Joi.string().valid("true", "false").optional(),
  type: Joi.string().optional(),
  page: Joi.number().integer().min(1).default(1),
  pageSize: Joi.number().integer().min(1).max(100).default(20),
  search: Joi.string().max(100).optional(),
});

// Middleware functions
const validateMarkAsRead = (req, res, next) => {
  const { error } = markAsReadSchema.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    return res.status(400).json({
      success: false,
      errors: error.details.map((err) => err.message),
    });
  }

  next();
};

const validateSendToParentHierarchy = (req, res, next) => {
  const { error } = sendToParentHierarchySchema.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    return res.status(400).json({
      success: false,
      errors: error.details.map((err) => err.message),
    });
  }

  next();
};

const validateSendToImmediateParent = (req, res, next) => {
  const { error } = sendToImmediateParentSchema.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    return res.status(400).json({
      success: false,
      errors: error.details.map((err) => err.message),
    });
  }

  next();
};

const validateNotifyIssueCreator = (req, res, next) => {
  const { error } = notifyIssueCreatorSchema.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    return res.status(400).json({
      success: false,
      errors: error.details.map((err) => err.message),
    });
  }

  next();
};

const validateNotifySolver = (req, res, next) => {
  const { error } = notifySolverSchema.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    return res.status(400).json({
      success: false,
      errors: error.details.map((err) => err.message),
    });
  }

  next();
};

const validateSendGeneralNotification = (req, res, next) => {
  const { error } = sendGeneralNotificationSchema.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    return res.status(400).json({
      success: false,
      errors: error.details.map((err) => err.message),
    });
  }

  next();
};

const validateNotificationsQuery = (req, res, next) => {
  const { error } = notificationsQuerySchema.validate(req.query, {
    abortEarly: false,
  });

  if (error) {
    return res.status(400).json({
      success: false,
      errors: error.details.map((err) => err.message),
    });
  }

  next();
};

module.exports = {
  markAsReadSchema,
  sendToParentHierarchySchema,
  sendToImmediateParentSchema,
  notifyIssueCreatorSchema,
  notifySolverSchema,
  sendGeneralNotificationSchema,
  notificationsQuerySchema,
  validateMarkAsRead,
  validateSendToParentHierarchy,
  validateSendToImmediateParent,
  validateNotifyIssueCreator,
  validateNotifySolver,
  validateSendGeneralNotification,
  validateNotificationsQuery,
};
