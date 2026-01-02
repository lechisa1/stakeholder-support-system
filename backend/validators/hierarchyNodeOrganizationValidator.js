const Joi = require("joi");

// Schema for creating/updating a hierarchy node - institute association
const hierarchyNodeOrganizationSchema = Joi.object({
  hierarchy_node_id: Joi.string()
    .guid({ version: "uuidv4" })
    .required()
    .messages({
      "string.guid": "Hierarchy node ID must be a valid UUID",
      "string.empty": "Hierarchy node ID is required",
    }),
  institute_id: Joi.string().guid({ version: "uuidv4" }).required().messages({
    "string.guid": "Institute ID must be a valid UUID",
    "string.empty": "Institute ID is required",
  }),
  is_active: Joi.boolean().optional().messages({
    "boolean.base": "is_active must be a boolean value",
  }),
});

// Schema for hierarchy node organization ID param
const hierarchyNodeOrganizationIdSchema = Joi.object({
  id: Joi.string().guid({ version: "uuidv4" }).required().messages({
    "string.guid": "Hierarchy node organization ID must be a valid UUID",
    "string.empty": "Hierarchy node organization ID is required",
  }),
});

// Middleware to validate create/update request
exports.validateHierarchyNodeOrganization = (req, res, next) => {
  const { error } = hierarchyNodeOrganizationSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });
  next();
};

// Middleware to validate ID param
exports.validateHierarchyNodeOrganizationId = (req, res, next) => {
  const { error } = hierarchyNodeOrganizationIdSchema.validate(req.params);
  if (error) return res.status(400).json({ error: error.details[0].message });
  next();
};
