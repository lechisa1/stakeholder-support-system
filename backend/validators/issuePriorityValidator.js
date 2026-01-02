const Joi = require("joi");
exports.prioritySchema = Joi.object({
  name: Joi.string().trim().min(2).max(50).required().messages({
    "string.base": "Priority name must be a string",
    "string.empty": "Priority name is required",
    "string.min": "Priority name must be at least 2 characters long",
    "string.max": "Priority name must not exceed 50 characters",
    "any.required": "Priority name is required",
  }),

  description: Joi.string().trim().max(255).allow("", null).messages({
    "string.max": "Description must not exceed 255 characters",
  }),

  color_value: Joi.string().trim().max(100).allow("", null).messages({
    "string.max": "Color value must not exceed 100 characters",
  }),
  response_duration: Joi.number().integer().positive().required().messages({
    "number.base": "Response duration must be a number",
    "number.integer": "Response duration must be an integer value",
    "number.positive": "Response duration must be a positive number",
    "any.required": "Response duration is required",
  }),

  response_unit: Joi.string()
    .valid("hour", "day", "month")
    .required()
    .messages({
      "any.only": "Response unit must be one of: hour, day, month",
      "any.required": "Response unit is required",
    }),
  is_active: Joi.boolean().required().messages({
    "boolean.base": "is_active must be a boolean value",
    "any.required": "is_active is required",
  }),
});

// Schema for validating UUID in route params
exports.idParamSchema = Joi.object({
  id: Joi.string()
    .guid({ version: ["uuidv4", "uuidv5"] })
    .required()
    .messages({
      "string.guid": "Invalid UUID format",
      "any.required": "ID parameter is required",
    }),
});
