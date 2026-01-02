const Joi = require("joi");

const rejectIssueSchema = Joi.object({
  issue_id: Joi.string().uuid().required().messages({
    "any.required": "Issue ID is required.",
    "string.uuid": "Issue ID must be a valid UUID.",
  }),

  reason: Joi.string().allow(null, "").optional(),

  rejected_by: Joi.string().uuid().required().messages({
    "any.required": "Rejected by user ID is required.",
    "string.uuid": "Rejected by must be a valid UUID.",
  }),

  attachment_ids: Joi.array().items(Joi.string().uuid()).optional().messages({
    "array.base": "Attachment IDs must be an array of UUIDs.",
  }),
});

// Middleware
const validateRejectIssue = (req, res, next) => {
  const { error } = rejectIssueSchema.validate(req.body, { abortEarly: false });

  if (error) {
    return res.status(400).json({
      errors: error.details.map((err) => err.message),
    });
  }

  next();
};

module.exports = {
  rejectIssueSchema,
  validateRejectIssue,
};
