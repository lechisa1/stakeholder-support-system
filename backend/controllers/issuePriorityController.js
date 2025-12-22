const { v4: uuidv4 } = require("uuid");
const { IssuePriority } = require("../models");

const { Op } = require("sequelize");
const {
  prioritySchema,
  idParamSchema,
} = require("../validators/issuePriorityValidator");

//======Create Priority==============
// exports.createPriority = async (req, res) => {
//   try {
//     const { error, value } = prioritySchema.validate(req.body, {
//       abortEarly: false,
//     });
//     if (error) {
//       return res.status(400).json({
//         message: "Validation failed",
//         errors: error.details.map((d) => d.message),
//       });
//     }

//     // =========Check for duplicate name========
//     const exists = await IssuePriority.findOne({ where: { name: value.name } });
//     if (exists) {
//       return res.status(409).json({ message: "Priority name already exists" });
//     }

//     const priority = await IssuePriority.create({
//       priority_id: uuidv4(),
//       ...value,
//       created_at: new Date(),
//       updated_at: new Date(),
//     });

//     return res.status(201).json({
//       message: "Priority created successfully",
//       data: priority,
//     });
//   } catch (err) {
//     return res.status(500).json({
//       message: "Internal server error while creating priority",
//       error: err.message,
//     });
//   }
// };

exports.createPriority = async (req, res) => {
  try {
    // Validate request body
    const { error, value } = prioritySchema.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      return res.status(400).json({
        message: "Validation failed",
        errors: error.details.map((d) => d.message),
      });
    }

    // Check for duplicate priority name
    const exists = await IssuePriority.findOne({ where: { name: value.name } });
    if (exists) {
      return res.status(409).json({ message: "Priority name already exists" });
    }

    // Create priority
    const priority = await IssuePriority.create({
      priority_id: uuidv4(),
      name: value.name,
      description: value.description,
      color_value: value.color_value,
      response_duration: value.response_duration,
      response_unit: value.response_unit,
      is_active: value.is_active !== undefined ? value.is_active : true,
      created_at: new Date(),
      updated_at: new Date(),
    });

    return res.status(201).json({
      message: "Priority created successfully",
      data: priority,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Internal server error while creating priority",
      error: err.message,
    });
  }
};
// ==========Get All Priorities =========
exports.getAllPriorities = async (req, res) => {
  try {
    const priorities = await IssuePriority.findAll({
      order: [["created_at", "DESC"]],
    });

    return res.status(200).json({
      message: "Priorities retrieved successfully",
      data: priorities,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Internal server error while fetching priorities",
      error: err.message,
    });
  }
};

// ========Get Priority by ID==============
exports.getPriorityById = async (req, res) => {
  try {
    const { error } = idParamSchema.validate(req.params);
    if (error) {
      return res.status(400).json({
        message: "Invalid ID parameter",
        errors: error.details.map((d) => d.message),
      });
    }

    const { id } = req.params;
    const priority = await IssuePriority.findOne({
      where: { priority_id: id },
    });
    if (!priority) {
      return res.status(404).json({ message: "Priority not found" });
    }

    return res.status(200).json({
      message: "Priority retrieved successfully",
      data: priority,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Internal server error while retrieving priority",
      error: err.message,
    });
  }
};

// ===========Update Priority===============
exports.updatePriority = async (req, res) => {
  try {
    const { error: idError } = idParamSchema.validate(req.params);
    if (idError) {
      return res.status(400).json({
        message: "Invalid ID parameter",
        errors: idError.details.map((d) => d.message),
      });
    }

    // Validate body
    const { error: bodyError, value } = prioritySchema.validate(req.body, {
      abortEarly: false,
    });
    if (bodyError) {
      return res.status(400).json({
        message: "Validation failed",
        errors: bodyError.details.map((d) => d.message),
      });
    }

    const { id } = req.params;

    const priority = await IssuePriority.findOne({
      where: { priority_id: id },
    });
    if (!priority) {
      return res.status(404).json({ message: "Priority not found" });
    }

    const nameExists = await IssuePriority.findOne({
      where: {
        name: value.name,
        priority_id: { [Op.ne]: id },
      },
    });

    if (nameExists) {
      return res
        .status(409)
        .json({ message: "Another priority with this name already exists" });
    }

    await priority.update({
      name: value.name,
      description: value.description,
      color_value: value.color_value,
      response_time: value.response_time,
      response_duration: value.response_duration,
      response_unit: value.response_unit,
      updated_at: new Date(),
    });

    return res.status(200).json({
      message: "Priority updated successfully",
      data: priority,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Internal server error while updating priority",
      error: err.message,
    });
  }
};

//========== Delete Priority============
exports.deletePriority = async (req, res) => {
  try {
    // Validate ID param
    const { error } = idParamSchema.validate(req.params);
    if (error) {
      return res.status(400).json({
        message: "Invalid ID parameter",
        errors: error.details.map((d) => d.message),
      });
    }

    const { id } = req.params;
    const priority = await IssuePriority.findOne({
      where: { priority_id: id },
    });
    if (!priority) {
      return res.status(404).json({ message: "Priority not found" });
    }

    await priority.destroy();

    return res.status(200).json({
      message: "Priority deleted successfully",
    });
  } catch (err) {
    return res.status(500).json({
      message: "Internal server error while deleting priority",
      error: err.message,
    });
  }
};
