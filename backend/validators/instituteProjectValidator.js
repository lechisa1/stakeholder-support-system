const Joi = require("joi");

// Schema for creating/updating an institute-project association
const instituteProjectSchema = Joi.object({
  institute_id: Joi.string().guid({ version: "uuidv4" }).required().messages({
    "string.guid": "Institute ID must be a valid UUID",
    "string.empty": "Institute ID is required",
  }),
  project_id: Joi.string().guid({ version: "uuidv4" }).required().messages({
    "string.guid": "Project ID must be a valid UUID",
    "string.empty": "Project ID is required",
  }),
  is_active: Joi.boolean().optional().messages({
    "boolean.base": "Is active must be a boolean",
  }),
});

// Schema for validating institute-project ID in params
const instituteProjectIdSchema = Joi.object({
  id: Joi.string().guid({ version: "uuidv4" }).required().messages({
    "string.guid": "Institute Project ID must be a valid UUID",
    "string.empty": "Institute Project ID is required",
  }),
});

// Middleware to validate create/update request
exports.validateInstituteProject = (req, res, next) => {
  const { error } = instituteProjectSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });
  next();
};

// Middleware to validate institute-project ID param
exports.validateInstituteProjectId = (req, res, next) => {
  const { error } = instituteProjectIdSchema.validate(req.params);
  if (error) return res.status(400).json({ error: error.details[0].message });
  next();
};
