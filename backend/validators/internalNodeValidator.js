const Joi = require("joi");

// Schema for creating an internal node
const createInternalNodeSchema = Joi.object({
  name: Joi.string().trim().max(255).required().messages({
    "string.empty": "Internal node name is required",
    "string.max": "Name must be at most 255 characters",
  }),

  parent_id: Joi.string()
    .guid({ version: "uuidv4" })
    .allow(null)
    .optional()
    .messages({
      "string.guid": "Parent ID must be a valid UUID",
    }),

  description: Joi.string().trim().optional().allow(null).messages({
    "string.base": "Description must be a string",
  }),

  is_active: Joi.boolean().optional().messages({
    "boolean.base": "Is active must be a boolean",
  }),
});

// Schema for updating an internal node
const updateInternalNodeSchema = Joi.object({
  name: Joi.string().trim().max(255).optional(),
  parent_id: Joi.string().guid({ version: "uuidv4" }).allow(null).optional(),
  description: Joi.string().trim().optional().allow(null),
  is_active: Joi.boolean().optional(),
});

// Validate create request
exports.validateCreateInternalNode = (req, res, next) => {
  const { error } = createInternalNodeSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });
  next();
};

// Validate update request
exports.validateUpdateInternalNode = (req, res, next) => {
  const { error } = updateInternalNodeSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });
  next();
};

// Validate internal node ID param
exports.validateInternalNodeId = (req, res, next) => {
  const schema = Joi.object({
    id: Joi.string().guid({ version: "uuidv4" }).required().messages({
      "string.guid": "Internal node ID must be a valid UUID",
      "string.empty": "Internal node ID is required",
    }),
  });

  const { error } = schema.validate(req.params);
  if (error) return res.status(400).json({ error: error.details[0].message });
  next();
};
