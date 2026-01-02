const Joi = require("joi");

// Schema for creating a hierarchy node
const hierarchyNodeSchema = Joi.object({
  project_id: Joi.string().guid({ version: "uuidv4" }).required().messages({
    "string.guid": "Project ID must be a valid UUID",
    "any.required": "Project ID is required",
  }),
  parent_id: Joi.string()
    .guid({ version: "uuidv4" })
    .allow(null)
    .optional()
    .messages({
      "string.guid": "Parent ID must be a valid UUID",
    }),
  name: Joi.string().trim().max(255).required().messages({
    "string.empty": "Node name is required",
    "string.max": "Node name must be at most 255 characters",
  }),
  description: Joi.string().trim().allow(null, "").optional(),
  is_active: Joi.boolean().optional(),
});

// Schema for updating a hierarchy node
const updateHierarchyNodeSchema = Joi.object({
  project_id: Joi.string().guid({ version: "uuidv4" }).optional(),
  parent_id: Joi.string().guid({ version: "uuidv4" }).allow(null).optional(),
  name: Joi.string().trim().max(255).optional(),
  description: Joi.string().trim().allow(null, "").optional(),
  is_active: Joi.boolean().optional(),
});

// Validate create (supports both single and array input)
exports.validateCreateHierarchyNode = (req, res, next) => {
  const input = req.body;
  const schema = Array.isArray(input)
    ? Joi.array().items(hierarchyNodeSchema)
    : hierarchyNodeSchema;

  const { error } = schema.validate(input, { allowUnknown: false });
  if (error) return res.status(400).json({ error: error.details[0].message });
  next();
};

// Validate update
exports.validateUpdateHierarchyNode = (req, res, next) => {
  const { error } = updateHierarchyNodeSchema.validate(req.body, {
    allowUnknown: false,
  });
  if (error) return res.status(400).json({ error: error.details[0].message });
  next();
};

// Validate hierarchy node ID param
exports.validateHierarchyNodeId = (req, res, next) => {
  const schema = Joi.object({
    id: Joi.string().guid({ version: "uuidv4" }).required().messages({
      "string.guid": "Hierarchy Node ID must be a valid UUID",
      "any.required": "Hierarchy Node ID is required",
    }),
  });

  const { error } = schema.validate(req.params, { allowUnknown: false });
  if (error) return res.status(400).json({ error: error.details[0].message });
  next();
};

// Validate parent nodes query (by project_id param)
exports.validateParentNodesQuery = (req, res, next) => {
  const schema = Joi.object({
    project_id: Joi.string()
      .guid({ version: ["uuidv4", "uuidv5"] })
      .required()
      .messages({
        "string.guid": "Project ID must be a valid UUID",
        "any.required": "Project ID is required",
      }),
  });

  const { error } = schema.validate(req.params, { allowUnknown: false });
  if (error) return res.status(400).json({ error: error.details[0].message });
  next();
};
