// validators/issueResponseTimeValidator.js
const Joi = require("joi");

// Validator for creating/updating response time
const responseTimeSchema = Joi.object({
  duration: Joi.number().integer().min(1).required().messages({
    "number.base": "Duration must be a number",
    "number.min": "Duration must be at least 1",
    "any.required": "Duration is required",
  }),
  unit: Joi.string().valid("hour", "day", "month").required().messages({
    "any.only": "Unit must be one of 'hour', 'day', or 'month'",
    "any.required": "Unit is required",
  }),
});

// Validator for ID parameters in routes
const idParamSchema = Joi.object({
  id: Joi.string()
    .guid({ version: ["uuidv4"] })
    .required()
    .messages({
      "string.guid": "ID must be a valid UUID",
      "any.required": "ID parameter is required",
    }),
});

module.exports = {
  responseTimeSchema,
  idParamSchema,
};
