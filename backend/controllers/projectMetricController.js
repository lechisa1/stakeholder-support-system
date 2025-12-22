"use strict";
const {
  ProjectMetric,
  Project,
  User,
  ProjectMetricUser,
  ProjectMetricProject,
} = require("../models");
const { v4: uuidv4 } = require("uuid");
const { Op } = require("sequelize");

// -----------------------------------------------------
// CREATE ProjectMetric
// -----------------------------------------------------
const createProjectMetric = async (req, res) => {
  try {
    const { name, description, weight, is_active, user_ids, project_ids } =
      req.body;

    // Check duplicate name
    const existing = await ProjectMetric.findOne({ where: { name } });
    if (existing)
      return res
        .status(400)
        .json({ message: "Project metric with this name already exists." });

    const project_metric_id = uuidv4();

    const metric = await ProjectMetric.create({
      project_metric_id,
      name,
      description,
      weight,
      is_active,
    });

    // Assign users if provided
    if (user_ids && Array.isArray(user_ids) && user_ids.length > 0) {
      const userAssignments = user_ids.map((user_id) => ({
        id: uuidv4(),
        user_id,
        project_metric_id: metric.project_metric_id,
      }));
      await ProjectMetricUser.bulkCreate(userAssignments);
    }

    // Assign projects if provided
    if (project_ids && Array.isArray(project_ids) && project_ids.length > 0) {
      const projectAssignments = project_ids.map((project_id) => ({
        id: uuidv4(),
        project_id,
        project_metric_id: metric.project_metric_id,
      }));
      await ProjectMetricProject.bulkCreate(projectAssignments);
    }

    // Fetch the complete metric with associations
    const completeMetric = await ProjectMetric.findByPk(
      metric.project_metric_id,
      {
        include: [
          { model: User, as: "users" },
          { model: Project, as: "projects" },
        ],
      }
    );

    res.status(201).json(completeMetric);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

// -----------------------------------------------------
// GET ALL ProjectMetrics
// -----------------------------------------------------
const getProjectMetrics = async (req, res) => {
  try {
    const { is_active } = req.query;

    const whereClause = {};
    if (is_active !== undefined) {
      whereClause.is_active = is_active === "true";
    }

    const metrics = await ProjectMetric.findAll({
      where: whereClause,
      include: [
        {
          model: Project,
          as: "projects",
          through: { attributes: [] }, // Exclude junction table attributes
        },
        {
          model: User,
          as: "users",
          through: { attributes: ["value"] }, // Include value from junction table
        },
      ],
    });

    res.status(200).json(metrics);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

// -----------------------------------------------------
// GET ProjectMetric BY ID
// -----------------------------------------------------
const getProjectMetricById = async (req, res) => {
  try {
    const { id } = req.params;

    const metric = await ProjectMetric.findByPk(id, {
      include: [
        {
          model: Project,
          as: "projects",
          through: { attributes: [] },
        },
        {
          model: User,
          as: "users",
          through: { attributes: ["value"] },
        },
      ],
    });

    if (!metric)
      return res.status(404).json({ message: "Project metric not found." });

    res.status(200).json(metric);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

// -----------------------------------------------------
// UPDATE ProjectMetric
// -----------------------------------------------------
const updateProjectMetric = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, weight, is_active, user_ids, project_ids } =
      req.body;

    const metric = await ProjectMetric.findByPk(id);

    if (!metric)
      return res.status(404).json({ message: "Project metric not found." });

    // Check for duplicate name if name is being updated
    if (name && name !== metric.name) {
      const existing = await ProjectMetric.findOne({ where: { name } });
      if (existing)
        return res
          .status(400)
          .json({ message: "Project metric with this name already exists." });
    }

    // Update fields only if provided
    metric.name = name || metric.name;
    metric.description = description || metric.description;
    metric.weight = weight !== undefined ? weight : metric.weight;
    if (is_active !== undefined) metric.is_active = is_active;

    await metric.save();

    res.status(200).json(metric);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

// -----------------------------------------------------
// DELETE ProjectMetric
// -----------------------------------------------------
const deleteProjectMetric = async (req, res) => {
  try {
    const { id } = req.params;

    const metric = await ProjectMetric.findByPk(id);

    if (!metric)
      return res.status(404).json({ message: "Project metric not found." });

    // Delete associated records from junction tables
    await ProjectMetricUser.destroy({ where: { project_metric_id: id } });
    await ProjectMetricProject.destroy({ where: { project_metric_id: id } });

    await metric.destroy();

    res.status(200).json({
      message: "Project metric deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

// -----------------------------------------------------
// ASSIGN METRICS TO USER (Multiple metrics to one user)
// -----------------------------------------------------
const assignMetricsToUser = async (req, res) => {
  try {
    const { user_id } = req.params;
    const { metric_ids, values } = req.body;

    if (!metric_ids || !Array.isArray(metric_ids) || metric_ids.length === 0) {
      return res.status(400).json({ message: "metric_ids array is required" });
    }

    // Check if user exists
    const user = await User.findByPk(user_id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Check if all metrics exist
    const metrics = await ProjectMetric.findAll({
      where: { project_metric_id: { [Op.in]: metric_ids } },
    });
    if (metrics.length !== metric_ids.length) {
      return res
        .status(404)
        .json({ message: "One or more metrics not found." });
    }

    // Prepare assignments
    const assignments = metric_ids.map((metric_id, index) => ({
      id: uuidv4(),
      user_id,
      project_metric_id: metric_id,
      value: values && values[index] !== undefined ? values[index] : null,
    }));

    // Remove existing assignments for these metrics
    await ProjectMetricUser.destroy({
      where: {
        user_id,
        project_metric_id: { [Op.in]: metric_ids },
      },
    });

    // Create new assignments
    await ProjectMetricUser.bulkCreate(assignments);

    // Fetch updated user with metrics
    const updatedUser = await User.findByPk(user_id, {
      include: [
        {
          model: ProjectMetric,
          as: "project_metrics",
          through: { attributes: ["value"] },
        },
      ],
    });

    res.status(200).json({
      message: "Metrics assigned to user successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

// -----------------------------------------------------
// ASSIGN METRICS TO PROJECT (Multiple metrics to one project)
// -----------------------------------------------------
const assignMetricsToProject = async (req, res) => {
  try {
    const { project_id } = req.params;
    const { metric_ids } = req.body;

    if (!metric_ids || !Array.isArray(metric_ids) || metric_ids.length === 0) {
      return res.status(400).json({ message: "metric_ids array is required" });
    }

    // Check if project exists
    const project = await Project.findByPk(project_id);
    if (!project) {
      return res.status(404).json({ message: "Project not found." });
    }

    // Check if all metrics exist
    const metrics = await ProjectMetric.findAll({
      where: { project_metric_id: { [Op.in]: metric_ids } },
    });
    if (metrics.length !== metric_ids.length) {
      return res
        .status(404)
        .json({ message: "One or more metrics not found." });
    }

    // Prepare assignments
    const assignments = metric_ids.map((metric_id) => ({
      id: uuidv4(),
      project_id,
      project_metric_id: metric_id,
    }));

    // Remove existing assignments for these metrics
    await ProjectMetricProject.destroy({
      where: {
        project_id,
        project_metric_id: { [Op.in]: metric_ids },
      },
    });

    // Create new assignments
    await ProjectMetricProject.bulkCreate(assignments);

    // Fetch updated project with metrics
    const updatedProject = await Project.findByPk(project_id, {
      include: [
        {
          model: ProjectMetric,
          as: "project_metrics",
          through: { attributes: [] },
        },
      ],
    });

    res.status(200).json({
      message: "Metrics assigned to project successfully",
      data: updatedProject,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

// -----------------------------------------------------
// REMOVE METRICS FROM USER
// -----------------------------------------------------
const removeMetricsFromUser = async (req, res) => {
  try {
    const { user_id } = req.params;
    const { metric_ids } = req.body;

    if (!metric_ids || !Array.isArray(metric_ids) || metric_ids.length === 0) {
      return res.status(400).json({ message: "metric_ids array is required" });
    }

    await ProjectMetricUser.destroy({
      where: {
        user_id,
        project_metric_id: { [Op.in]: metric_ids },
      },
    });

    res.status(200).json({
      message: "Metrics removed from user successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

// -----------------------------------------------------
// REMOVE METRICS FROM PROJECT
// -----------------------------------------------------
const removeMetricsFromProject = async (req, res) => {
  try {
    const { project_id } = req.params;
    const { metric_ids } = req.body;

    if (!metric_ids || !Array.isArray(metric_ids) || metric_ids.length === 0) {
      return res.status(400).json({ message: "metric_ids array is required" });
    }

    await ProjectMetricProject.destroy({
      where: {
        project_id,
        project_metric_id: { [Op.in]: metric_ids },
      },
    });

    res.status(200).json({
      message: "Metrics removed from project successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

// -----------------------------------------------------
// GET USERS ASSIGNED TO A SPECIFIC METRIC
// -----------------------------------------------------
const getUsersByMetricId = async (req, res) => {
  try {
    const { metric_id } = req.params;
    console.log("metric_id:", metric_id);
    console.log("req.params:", req.params);

    const metric = await ProjectMetric.findByPk(metric_id, {
      include: [
        {
          model: User,
          as: "users",
          through: { attributes: ["value"] }, // include metric value
        },
      ],
    });

    if (!metric) {
      return res.status(404).json({ message: "Metric not found." });
    }

    return res.status(200).json({
      metric_id: metric.project_metric_id,
      metric_name: metric.name,
      assigned_users: metric.users,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

// -----------------------------------------------------
// GET USER METRICS (All metrics assigned to a user)
// -----------------------------------------------------
const getUserMetrics = async (req, res) => {
  try {
    const { user_id } = req.params;

    const user = await User.findByPk(user_id, {
      include: [
        {
          model: ProjectMetric,
          as: "project_metrics",
          through: { attributes: ["value"] },
        },
      ],
    });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json({
      user_id: user.user_id,
      metrics: user.project_metrics,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

// -----------------------------------------------------
// GET PROJECT METRICS (All metrics assigned to a project)
// -----------------------------------------------------
// -----------------------------------------------------
// GET PROJECT METRICS (All metrics assigned to a project)
// -----------------------------------------------------
const getProjectProjectMetrics = async (req, res) => {
  try {
    const { project_id } = req.params;

    const project = await Project.findByPk(project_id, {
      include: [
        {
          model: ProjectMetric,
          as: "metrics",
          attributes: [
            "project_metric_id",
            "name",
            "description",
            "weight",
            "is_active",
            "created_at",
            "updated_at",
          ],
          through: { attributes: [] }, // hide pivot table fields
        },
      ],
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found." });
    }

    return res.status(200).json({
      project_id: project.project_id,
      metrics: project.metrics, // <-- FIXED
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

// -----------------------------------------------------
// UPDATE USER METRIC VALUE (Specific metric for a user)
// -----------------------------------------------------
const updateUserMetricValue = async (req, res) => {
  try {
    const { user_id, metric_id } = req.params;
    const { value } = req.body;

    const assignment = await ProjectMetricUser.findOne({
      where: {
        user_id,
        project_metric_id: metric_id,
      },
    });

    if (!assignment) {
      return res
        .status(404)
        .json({ message: "Metric assignment not found for this user" });
    }

    assignment.value = value !== undefined ? value : null;
    await assignment.save();

    res.status(200).json({
      message: "User metric value updated successfully",
      data: assignment,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

module.exports = {
  createProjectMetric,
  getProjectMetrics,
  getProjectMetricById,
  updateProjectMetric,
  deleteProjectMetric,

  // Reverse assignment operations (Metrics to Users/Projects)
  assignMetricsToUser,
  assignMetricsToProject,
  removeMetricsFromUser,
  removeMetricsFromProject,

  // Get operations for specific entities
  getUserMetrics, // Get all metrics for a specific user
  getUsersByMetricId, // Get all users assigned to a specific metric
  getProjectProjectMetrics, // Get all metrics for a specific project

  // Value management
  updateUserMetricValue,
};
