// controllers/issueResponseTimeController.js
const { v4: uuidv4 } = require("uuid");
const { IssueResponseTime } = require("../models");
const {
  responseTimeSchema,
  idParamSchema,
} = require("../validators/issueResponseTimeValidator");
const { Op } = require("sequelize");

// ====== Create Response Time ======
exports.createResponseTime = async (req, res) => {
  try {
    const { error, value } = responseTimeSchema.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      return res.status(400).json({
        message: "Validation failed",
        errors: error.details.map((d) => d.message),
      });
    }

    const responseTime = await IssueResponseTime.create({
      response_time_id: uuidv4(),
      ...value,
      created_at: new Date(),
      updated_at: new Date(),
    });

    return res.status(201).json({
      message: "Response time created successfully",
      data: responseTime,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Internal server error while creating response time",
      error: err.message,
    });
  }
};

// ====== Get All Response Times ======
exports.getAllResponseTimes = async (req, res) => {
  try {
    const responseTimes = await IssueResponseTime.findAll({
      order: [["created_at", "DESC"]],
    });

    return res.status(200).json({
      message: "Response times retrieved successfully",
      data: responseTimes,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Internal server error while fetching response times",
      error: err.message,
    });
  }
};

// ====== Get Response Time by ID ======
exports.getResponseTimeById = async (req, res) => {
  try {
    const { error } = idParamSchema.validate(req.params);
    if (error) {
      return res.status(400).json({
        message: "Invalid ID parameter",
        errors: error.details.map((d) => d.message),
      });
    }

    const { id } = req.params;
    const responseTime = await IssueResponseTime.findOne({
      where: { response_time_id: id },
    });

    if (!responseTime) {
      return res.status(404).json({ message: "Response time not found" });
    }

    return res.status(200).json({
      message: "Response time retrieved successfully",
      data: responseTime,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Internal server error while retrieving response time",
      error: err.message,
    });
  }
};

// ====== Update Response Time ======
exports.updateResponseTime = async (req, res) => {
  try {
    const { error: idError } = idParamSchema.validate(req.params);
    if (idError) {
      return res.status(400).json({
        message: "Invalid ID parameter",
        errors: idError.details.map((d) => d.message),
      });
    }

    const { error: bodyError, value } = responseTimeSchema.validate(req.body, {
      abortEarly: false,
    });
    if (bodyError) {
      return res.status(400).json({
        message: "Validation failed",
        errors: bodyError.details.map((d) => d.message),
      });
    }

    const { id } = req.params;
    const responseTime = await IssueResponseTime.findOne({
      where: { response_time_id: id },
    });
    if (!responseTime) {
      return res.status(404).json({ message: "Response time not found" });
    }

    await responseTime.update({
      duration: value.duration,
      unit: value.unit,
      updated_at: new Date(),
    });

    return res.status(200).json({
      message: "Response time updated successfully",
      data: responseTime,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Internal server error while updating response time",
      error: err.message,
    });
  }
};

// ====== Delete Response Time ======
exports.deleteResponseTime = async (req, res) => {
  try {
    const { error } = idParamSchema.validate(req.params);
    if (error) {
      return res.status(400).json({
        message: "Invalid ID parameter",
        errors: error.details.map((d) => d.message),
      });
    }

    const { id } = req.params;
    const responseTime = await IssueResponseTime.findOne({
      where: { response_time_id: id },
    });
    if (!responseTime) {
      return res.status(404).json({ message: "Response time not found" });
    }

    await responseTime.destroy();

    return res.status(200).json({
      message: "Response time deleted successfully",
    });
  } catch (err) {
    return res.status(500).json({
      message: "Internal server error while deleting response time",
      error: err.message,
    });
  }
};
