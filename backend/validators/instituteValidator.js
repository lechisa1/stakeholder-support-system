const Joi = require("joi");

// Schema for creating a new institute
const createInstituteSchema = Joi.object({
  name: Joi.string().trim().max(255).required().messages({
    "string.empty": "Institute name is required",
    "string.max": "Name must be at most 255 characters",
  }),
  // description: Joi.string().trim().optional().messages({
  //   "string.base": "Description must be a string",
  // }),
  is_active: Joi.boolean().optional().messages({
    "boolean.base": "Is active must be a boolean",
  }),
});

// Schema for updating an institute (all optional)
const updateInstituteSchema = Joi.object({
  name: Joi.string().trim().max(255).optional(),
  description: Joi.string().trim().optional(),
  is_active: Joi.boolean().optional(),
});

// Schema for validating institute ID
const instituteIdSchema = Joi.object({
  id: Joi.string().guid({ version: "uuidv4" }).required().messages({
    "string.guid": "Institute ID must be a valid UUID",
    "string.empty": "Institute ID is required",
  }),
});

// Middleware to validate create request
exports.validateCreateInstitute = (req, res, next) => {
  const { error } = createInstituteSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });
  next();
};

// Middleware to validate update request
exports.validateUpdateInstitute = (req, res, next) => {
  const { error } = updateInstituteSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });
  next();
};

// Middleware to validate institute ID param
exports.validateInstituteId = (req, res, next) => {
  const { error } = instituteIdSchema.validate(req.params);
  if (error) return res.status(400).json({ error: error.details[0].message });
  next();
};
