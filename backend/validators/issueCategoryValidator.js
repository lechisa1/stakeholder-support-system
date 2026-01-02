const Joi = require("joi");

exports.categorySchema = Joi.object({
  name: Joi.string().max(100).required(),
  description: Joi.string().allow(null, ""),
});

exports.prioritySchema = Joi.object({
  name: Joi.string().max(50).required(),
  description: Joi.string().allow(null, ""),
});