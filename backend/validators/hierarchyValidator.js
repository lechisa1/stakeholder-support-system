const Joi = require("joi");

// Schema for creating a hierarchy
const createHierarchySchema = Joi.object({
  name: Joi.string().trim().max(255).required().messages({
    "string.empty": "Hierarchy name is required",
    "string.max": "Name must be at most 255 characters",
  }),

  project_id: Joi.string().guid({ version: "uuidv4" }).required().messages({
    "string.guid": "Project ID must be a valid UUID",
    "string.empty": "Project ID is required",
  }),

  description: Joi.string().trim().optional().messages({
    "string.base": "Description must be a string",
  }),

  is_active: Joi.boolean().optional().messages({
    "boolean.base": "Is active must be a boolean",
  }),
});

// Schema for updating a hierarchy
const updateHierarchySchema = Joi.object({
  name: Joi.string().trim().max(255).optional(),
  project_id: Joi.string().guid({ version: "uuidv4" }).optional(),
  description: Joi.string().trim().optional(),
  is_active: Joi.boolean().optional(),
});

// Validate create request
exports.validateCreateHierarchy = (req, res, next) => {
  const { error } = createHierarchySchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });
  next();
};

// Validate update request
exports.validateUpdateHierarchy = (req, res, next) => {
  const { error } = updateHierarchySchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });
  next();
};

// Validate hierarchy ID param
exports.validateHierarchyId = (req, res, next) => {
  const schema = Joi.object({
    id: Joi.string().guid({ version: "uuidv4" }).required().messages({
      "string.guid": "Hierarchy ID must be a valid UUID",
      "string.empty": "Hierarchy ID is required",
    }),
  });

  const { error } = schema.validate(req.params);
  if (error) return res.status(400).json({ error: error.details[0].message });
  next();
};
