const Joi = require("joi");

const escalateIssueSchema = Joi.object({
  issue_id: Joi.string().uuid().required().messages({
    "any.required": "Issue ID is required.",
  }),
  from_tier: Joi.string().required().messages({
    "any.required": "From tier is required.",
  }),
  to_tier: Joi.string().allow(null, "").optional(),
  reason: Joi.string().allow(null, "").optional(),
  escalated_by: Joi.string().uuid().required().messages({
    "any.required": "Escalated_by user ID is required.",
  }),
  attachment_ids: Joi.array().items(Joi.string().uuid()).optional(),
});

// ✅ Middleware for validation
const validateEscalateIssue = (req, res, next) => {
  const { error } = escalateIssueSchema.validate(req.body, {
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
  escalateIssueSchema,
  validateEscalateIssue,
};
