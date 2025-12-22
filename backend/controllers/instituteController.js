const { Institute, Project, InstituteAttachment } = require("../models");
const { v4: uuidv4 } = require("uuid");

// Create a new institute
const createInstitute = async (req, res) => {
  try {
    let { name, description, is_active, attachments } = req.body;

    // Normalize name to JSON
    // if (typeof name === "string") {
    //   name = { en: name };
    // } else if (typeof name !== "object" || name === null) {
    //   return res.status(400).json({ message: "Invalid name format" });
    // }

    // Check if institute exists
    const existingInstitute = await Institute.findOne({
      where: { name },
    });
    if (existingInstitute)
      return res
        .status(400)
        .json({ message: "Institute with this name already exists." });

    const institute_id = uuidv4();

    // Create institute
    const institute = await Institute.create({
      institute_id,
      name,
      description,
      is_active,
    });

    // If attachments are provided, create InstituteAttachment records
    if (Array.isArray(attachments) && attachments.length > 0) {
      const attachmentRecords = attachments.map((att) => ({
        institute_attachment_id: uuidv4(),
        institute_id,
        attachment_id: att.attachment_id,
        type: att.type || "other", // default to 'other' if not provided
      }));

      await InstituteAttachment.bulkCreate(attachmentRecords);
    }

    // Fetch the created institute along with attachments
    const createdInstitute = await Institute.findByPk(institute_id, {
      include: [{ model: InstituteAttachment, as: "attachments" }],
    });

    res.status(201).json(createdInstitute);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Get all institutes
const getInstitutes = async (req, res) => {
  try {
    const { is_active } = req.query;

    // Build where clause for filtering
    const whereClause = {};
    if (is_active !== undefined) {
      whereClause.is_active = is_active === "true";
    }

    const institutes = await Institute.findAll({
      where: whereClause,
      include: [
        {
          model: Project,
          as: "projects",
          through: { attributes: ["is_active"] },
        },
      ],
    });
    res.status(200).json(institutes);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Get institute by ID
const getInstituteById = async (req, res) => {
  try {
    const { id } = req.params;
    const institute = await Institute.findByPk(id, {
      include: [
        {
          model: Project,
          as: "projects",
          through: { attributes: ["is_active"] },
        },
        {
          model: InstituteAttachment,
          as: "attachments",
          attributes: [
            "institute_attachment_id",
            "attachment_id",
            "type",
            "created_at",
          ],
        },
      ],
    });
    if (!institute)
      return res.status(404).json({ message: "Institute not found" });
    res.status(200).json(institute);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Update institute
const updateInstitute = async (req, res) => {
  try {
    const { id } = req.params;
    let { name, description, is_active, attachments } = req.body;

    const institute = await Institute.findByPk(id);
    if (!institute)
      return res.status(404).json({ message: "Institute not found" });

    // // Normalize name to JSON if provided
    // if (name) {
    //   if (typeof name === "string") {
    //     name = { en: name };
    //   } else if (typeof name !== "object" || name === null) {
    //     return res.status(400).json({ message: "Invalid name format" });
    //   }

    //   institute.name = name;
    // }
    if (name) {
      institute.name = name;
    }
    institute.description = description || institute.description;
    if (is_active !== undefined) institute.is_active = is_active;

    await institute.save();

    // Handle attachments if provided
    if (Array.isArray(attachments)) {
      for (const att of attachments) {
        if (att.type === "logo") {
          // Remove any existing logo
          await InstituteAttachment.destroy({
            where: { institute_id: id, type: "logo" },
          });
        }

        // Create the new attachment
        await InstituteAttachment.create({
          institute_attachment_id: uuidv4(),
          institute_id: id,
          attachment_id: att.attachment_id,
          type: att.type || "other",
        });
      }
    }

    // Fetch updated institute with attachments
    const updatedInstitute = await Institute.findByPk(id, {
      include: [{ model: InstituteAttachment, as: "attachments" }],
    });

    res.status(200).json(updatedInstitute);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Delete institute
const deleteInstitute = async (req, res) => {
  try {
    const { id } = req.params;
    const institute = await Institute.findByPk(id);
    if (!institute)
      return res.status(404).json({ message: "Institute not found" });

    await institute.destroy();
    res.status(200).json({ message: "Institute deleted successfully" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

module.exports = {
  createInstitute,
  getInstitutes,
  getInstituteById,
  updateInstitute,
  deleteInstitute,
};
