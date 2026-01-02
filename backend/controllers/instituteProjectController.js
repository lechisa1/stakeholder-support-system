const { InstituteProject, Institute, Project } = require("../models");
const { v4: uuidv4 } = require("uuid");

// Create a new institute-project association
const createInstituteProject = async (req, res) => {
  try {
    const { institute_id, project_id, is_active } = req.body;

    // Check if association exists
    const existingAssociation = await InstituteProject.findOne({
      where: { institute_id, project_id },
    });
    if (existingAssociation)
      return res.status(400).json({ message: "Association already exists." });

    const institute_project_id = uuidv4();

    // Create association
    const association = await InstituteProject.create({
      institute_project_id,
      institute_id,
      project_id,
      is_active,
    });

    res.status(201).json(association);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// Get all institute-project associations
const getInstituteProjects = async (req, res) => {
  try {
    const associations = await InstituteProject.findAll({
      include: [
        { model: Institute, as: "institute" },
        { model: Project, as: "project" },
      ],
    });
    res.status(200).json(associations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// Get association by ID
const getInstituteProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const association = await InstituteProject.findByPk(id, {
      include: [
        { model: Institute, as: "institute" },
        { model: Project, as: "project" },
      ],
    });
    if (!association) return res.status(404).json({ message: "Association not found" });
    res.status(200).json(association);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// Update association
const updateInstituteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { institute_id, project_id, is_active } = req.body;

    const association = await InstituteProject.findByPk(id);
    if (!association) return res.status(404).json({ message: "Association not found" });

    association.institute_id = institute_id || association.institute_id;
    association.project_id = project_id || association.project_id;
    if (is_active !== undefined) association.is_active = is_active;

    await association.save();
    res.status(200).json(association);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// Delete association
const deleteInstituteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const association = await InstituteProject.findByPk(id);
    if (!association) return res.status(404).json({ message: "Association not found" });

    await association.destroy();
    res.status(200).json({ message: "Association deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

module.exports = {
  createInstituteProject,
  getInstituteProjects,
  getInstituteProjectById,
  updateInstituteProject,
  deleteInstituteProject,
};
