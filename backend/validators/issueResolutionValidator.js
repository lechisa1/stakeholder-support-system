const Joi = require("joi");

const resolveIssueSchema = Joi.object({
  issue_id: Joi.string().uuid().required().messages({
    "any.required": "Issue ID is required.",
  }),
  reason: Joi.string().allow(null, "").optional(),
  resolved_by: Joi.string().uuid().required().messages({
    "any.required": "Resolved_by user ID is required.",
  }),
  attachment_ids: Joi.array().items(Joi.string().uuid()).optional(),
});

// Middleware
const validateResolveIssue = (req, res, next) => {
  const { error } = resolveIssueSchema.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    return res.status(400).json({
      errors: error.details.map((err) => err.message),
    });
  }

  next();
};

module.exports = {
  resolveIssueSchema,
  validateResolveIssue,
};
