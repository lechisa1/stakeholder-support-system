const { HierarchyNodeOrganization, HierarchyNode, Institute } = require("../models");
const { v4: uuidv4 } = require("uuid");

// Create a new hierarchy node organization association
const createHierarchyNodeOrganization = async (req, res) => {
  try {
    const { hierarchy_node_id, institute_id, is_active } = req.body;

    // Check if hierarchy node exists
    const hierarchyNode = await HierarchyNode.findByPk(hierarchy_node_id);
    if (!hierarchyNode) {
      return res.status(404).json({ message: "Hierarchy node not found" });
    }

    // Check if institute exists
    const institute = await Institute.findByPk(institute_id);
    if (!institute) {
      return res.status(404).json({ message: "Institute not found" });
    }

    // Check if association already exists
    const existingAssociation = await HierarchyNodeOrganization.findOne({
      where: { hierarchy_node_id, institute_id },
    });
    if (existingAssociation) {
      return res.status(400).json({
        message: "Association between this hierarchy node and institute already exists",
      });
    }

    const hierarchy_node_organization_id = uuidv4();

    // Create association
    const association = await HierarchyNodeOrganization.create({
      hierarchy_node_organization_id,
      hierarchy_node_id,
      institute_id,
      is_active,
    });

    res.status(201).json(association);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// Get all hierarchy node organization associations
const getHierarchyNodeOrganizations = async (req, res) => {
  try {
    const associations = await HierarchyNodeOrganization.findAll({
      include: [
        {
          model: HierarchyNode,
          as: "hierarchyNode",
          include: [{ model: HierarchyNode, as: "parent" }],
        },
        { model: Institute, as: "institute" },
      ],
    });
    res.status(200).json(associations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// Get hierarchy node organization association by ID
const getHierarchyNodeOrganizationById = async (req, res) => {
  try {
    const { id } = req.params;
    const association = await HierarchyNodeOrganization.findByPk(id, {
      include: [
        {
          model: HierarchyNode,
          as: "hierarchyNode",
          include: [{ model: HierarchyNode, as: "parent" }],
        },
        { model: Institute, as: "institute" },
      ],
    });
    if (!association) {
      return res.status(404).json({ message: "Hierarchy node organization association not found" });
    }
    res.status(200).json(association);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// Update hierarchy node organization association
const updateHierarchyNodeOrganization = async (req, res) => {
  try {
    const { id } = req.params;
    const { hierarchy_node_id, institute_id, is_active } = req.body;

    const association = await HierarchyNodeOrganization.findByPk(id);
    if (!association) {
      return res.status(404).json({ message: "Hierarchy node organization association not found" });
    }

    // If updating hierarchy_node_id or institute_id, check for conflicts
    if (hierarchy_node_id && hierarchy_node_id !== association.hierarchy_node_id) {
      const hierarchyNode = await HierarchyNode.findByPk(hierarchy_node_id);
      if (!hierarchyNode) {
        return res.status(404).json({ message: "Hierarchy node not found" });
      }
    }

    if (institute_id && institute_id !== association.institute_id) {
      const institute = await Institute.findByPk(institute_id);
      if (!institute) {
        return res.status(404).json({ message: "Institute not found" });
      }

      // Check if new association would create a duplicate
      const existingAssociation = await HierarchyNodeOrganization.findOne({
        where: { hierarchy_node_id: hierarchy_node_id || association.hierarchy_node_id, institute_id },
      });
      if (existingAssociation && existingAssociation.hierarchy_node_organization_id !== id) {
        return res.status(400).json({
          message: "Association between this hierarchy node and institute already exists",
        });
      }
    }

    association.hierarchy_node_id = hierarchy_node_id || association.hierarchy_node_id;
    association.institute_id = institute_id || association.institute_id;
    if (is_active !== undefined) association.is_active = is_active;

    await association.save();
    res.status(200).json(association);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// Delete hierarchy node organization association
const deleteHierarchyNodeOrganization = async (req, res) => {
  try {
    const { id } = req.params;
    const association = await HierarchyNodeOrganization.findByPk(id);
    if (!association) {
      return res.status(404).json({ message: "Hierarchy node organization association not found" });
    }

    await association.destroy();
    res.status(200).json({ message: "Hierarchy node organization association deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

module.exports = {
  createHierarchyNodeOrganization,
  getHierarchyNodeOrganizations,
  getHierarchyNodeOrganizationById,
  updateHierarchyNodeOrganization,
  deleteHierarchyNodeOrganization,
};
