const Joi = require("joi");

const reRaiseIssueSchema = Joi.object({
  issue_id: Joi.string().uuid().required().messages({
    "any.required": "Issue ID is required.",
    "string.uuid": "Issue ID must be a valid UUID.",
  }),

  reason: Joi.string().allow(null, "").optional(),

  re_raised_by: Joi.string().uuid().required().messages({
    "any.required": "Re-raised by user ID is required.",
    "string.uuid": "Re-raised by must be a valid UUID.",
  }),

  re_raised_at: Joi.date().iso().required().messages({
    "any.required": "Re-raised date is required.",
    "date.base": "Re-raised date must be a valid date.",
    "date.format": "Re-raised date must be in ISO format.",
  }),

  attachment_ids: Joi.array().items(Joi.string().uuid()).optional().messages({
    "array.base": "Attachment IDs must be an array of UUIDs.",
  }),
});

// Middleware
const validateReRaiseIssue = (req, res, next) => {
  const { error } = reRaiseIssueSchema.validate(req.body, {
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
  reRaiseIssueSchema,
  validateReRaiseIssue,
};
