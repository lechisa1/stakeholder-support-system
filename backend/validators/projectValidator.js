const Joi = require("joi");

// Schema for creating a project
const createProjectSchema = Joi.object({
  name: Joi.string().trim().max(255).required().messages({
    "string.empty": "Project name is required",
    "string.max": "Project name must be at most 255 characters",
  }),
  description: Joi.string().trim().optional().messages({
    "string.base": "Description must be a string",
  }),

  is_active: Joi.boolean().optional(),
  institute_id: Joi.string().guid({ version: "uuidv4" }).optional().messages({
    "string.guid": "Institute ID must be a valid UUID",
  }),
  project_metrics_ids: Joi.array()
    .items(Joi.string().uuid())
    .optional()
    .messages({
      "array.base": "metrics IDs must be an array",
      "string.guid": "Each metrics ID must be a valid UUID",
    }),
  maintenance_start: Joi.date().optional().allow(null),
  maintenance_end: Joi.date().optional().allow(null),
}).custom((value, helpers) => {
  const { maintenance_start, maintenance_end } = value;
  if (
    maintenance_start &&
    maintenance_end &&
    maintenance_start > maintenance_end
  ) {
    return helpers.message(
      "Maintenance start must be before or equal to maintenance end"
    );
  }
  return value;
});
// ===============================
exports.validateAssignUserToProject = (req, res, next) => {
  const schema = Joi.object({
    project_id: Joi.string().guid({ version: "uuidv4" }).required(),
    user_id: Joi.string().guid({ version: "uuidv4" }).required(),
    role_id: Joi.string().guid({ version: "uuidv4" }).required(),
    sub_role_id: Joi.string()
      .guid({ version: "uuidv4" })
      .optional()
      .allow(null),
    project_metric_id: Joi.string()
      .guid({ version: "uuidv4" })
      .required()
      .messages({
        "any.required": "Project metric ID is required.",
        "string.guid": "Project metric ID must be a valid UUIDv4.",
      }),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res
      .status(400)
      .json({ success: false, message: error.details[0].message });
  }
  next();
};
// Schema for updating a project
const updateProjectSchema = Joi.object({
  name: Joi.string().trim().max(255).optional(),
  description: Joi.string().trim().optional(),
  is_active: Joi.boolean().optional(),
  project_metrics_ids: Joi.array().items(Joi.string().uuid()).optional(),
  maintenance_start: Joi.date().optional(),
  maintenance_end: Joi.date().optional(),
});

// Schema for project ID param
const projectIdSchema = Joi.object({
  id: Joi.string().guid({ version: "uuidv4" }).required().messages({
    "string.guid": "Project ID must be a valid UUID",
    "string.empty": "Project ID is required",
  }),
});

// Middleware to validate creation
exports.validateCreateProject = (req, res, next) => {
  const { error } = createProjectSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });
  next();
};

// Middleware to validate update
exports.validateUpdateProject = (req, res, next) => {
  const { error } = updateProjectSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });
  next();
};

// Middleware to validate project ID in params
exports.validateProjectId = (req, res, next) => {
  const { error } = projectIdSchema.validate(req.params);
  if (error) return res.status(400).json({ error: error.details[0].message });
  next();
};
