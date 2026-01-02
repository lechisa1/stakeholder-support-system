const { validationResult } = require("express-validator");
const { IssueReportingGuideline } = require("../models");

exports.createGuideline = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const { title, description, severity_level } = req.body;
    const created_by = req.user?.user_id;

    const guideline = await IssueReportingGuideline.create({
      title,
      description,
      severity_level,
      created_by,
    });

    res.status(201).json({
      success: true,
      message: "Guideline created successfully.",
      data: guideline,
    });
  } catch (error) {
    console.error("Error creating guideline:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Internal Server Error",
        error: error.message,
      });
  }
};

exports.getAllGuidelines = async (req, res) => {
  try {
    const guidelines = await IssueReportingGuideline.findAll({
      where: { is_active: true },
      order: [["created_at", "DESC"]],
    });
    res.status(200).json({ success: true, data: guidelines });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateGuideline = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, severity_level } = req.body;

    const guideline = await IssueReportingGuideline.findByPk(id);
    if (!guideline)
      return res.status(404).json({ message: "Guideline not found." });

    await guideline.update({
      title,
      description,
      severity_level,
      updated_by: req.user?.user_id,
      updated_at: new Date(),
    });

    res.json({ success: true, message: "Guideline updated.", data: guideline });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteGuideline = async (req, res) => {
  try {
    const { id } = req.params;
    const guideline = await IssueReportingGuideline.findByPk(id);

    if (!guideline)
      return res.status(404).json({ message: "Guideline not found." });

    await guideline.update({ is_active: false });
    res.json({ success: true, message: "Guideline deactivated successfully." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
