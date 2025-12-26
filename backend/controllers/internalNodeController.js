const {
  InternalNode,
  InternalProjectUserRole,
  Role,
  User,
} = require("../models");
const { v4: uuidv4 } = require("uuid");

// Create Internal Node
const createInternalNode = async (req, res) => {
  try {
    const { parent_id, name, description, is_active } = req.body;

    // Duplicate name check (global unique)
    const existing = await InternalNode.findOne({ where: { name } });
    if (existing) {
      return res.status(400).json({
        message: `Internal node with name '${name}' already exists.`,
      });
    }

    let level = 1;
    if (parent_id) {
      const parent = await InternalNode.findByPk(parent_id);
      if (!parent)
        return res.status(404).json({ message: "Parent node not found." });

      level = parent.level + 1;
    }

    const node = await InternalNode.create({
      internal_node_id: uuidv4(),
      parent_id,
      name,
      description,
      level,
      is_active,
    });

    res.status(201).json(node);
  } catch (error) {
    console.error("Error creating internal node:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get ALL nodes
const getInternalNodes = async (req, res) => {
  try {
    const nodes = await InternalNode.findAll({
      include: [
        { model: InternalNode, as: "parent" },
        { model: InternalNode, as: "children" },
      ],
      order: [["created_at", "ASC"]],
    });

    res.status(200).json(nodes);
  } catch (error) {
    console.error("Error fetching internal nodes:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get node by ID
const getInternalNodeById = async (req, res) => {
  try {
    const { id } = req.params;

    const node = await InternalNode.findByPk(id, {
      include: [
        { model: InternalNode, as: "parent" },
        { model: InternalNode, as: "children" },
      ],
    });

    if (!node)
      return res.status(404).json({ message: "Internal node not found." });

    res.status(200).json(node);
  } catch (error) {
    console.error("Error fetching internal node:", error);
    res.status(500).json({ message: error.message });
  }
};

// Update Internal Node
const updateInternalNode = async (req, res) => {
  try {
    const { id } = req.params;
    const { parent_id, name, description, is_active } = req.body;

    const node = await InternalNode.findByPk(id);
    if (!node)
      return res.status(404).json({ message: "Internal node not found." });

    // Validate name uniqueness
    if (name && name !== node.name) {
      const existing = await InternalNode.findOne({ where: { name } });
      if (existing) {
        return res.status(400).json({
          message: `Internal node with name '${name}' already exists.`,
        });
      }
    }

    // Update level if parent changes
    let level = node.level;
    if (parent_id !== undefined && parent_id !== node.parent_id) {
      if (parent_id) {
        const parent = await InternalNode.findByPk(parent_id);
        if (!parent)
          return res.status(404).json({ message: "Parent node not found." });

        level = parent.level + 1;
      } else {
        level = 1;
      }
    }

    node.parent_id = parent_id ?? node.parent_id;
    node.name = name ?? node.name;
    node.description = description ?? node.description;
    node.level = level;
    node.is_active = is_active ?? node.is_active;

    await node.save();
    res.status(200).json(node);
  } catch (error) {
    console.error("Error updating internal node:", error);
    res.status(500).json({ message: error.message });
  }
};

// Delete Internal Node
const deleteInternalNode = async (req, res) => {
  try {
    const { id } = req.params;
    const node = await InternalNode.findByPk(id);
    if (!node)
      return res.status(404).json({ message: "Internal node not found." });

    await node.destroy();
    res.status(200).json({ message: "Internal node deleted successfully." });
  } catch (error) {
    console.error("Error deleting internal node:", error);
    res.status(500).json({ message: error.message });
  }
};

// Build full tree
const getInternalTree = async (req, res) => {
  try {
    const allNodes = await InternalNode.findAll({
      order: [["level", "ASC"]],
    });

    const plain = allNodes.map((n) => n.get({ plain: true }));
    const map = new Map();

    plain.forEach((node) =>
      map.set(node.internal_node_id, { ...node, children: [] })
    );

    const roots = [];

    map.forEach((node) => {
      if (node.parent_id) {
        const parent = map.get(node.parent_id);
        if (parent) parent.children.push(node);
      } else {
        roots.push(node);
      }
    });

    res.status(200).json({
      success: true,
      count: roots.length,
      nodes: roots,
    });
  } catch (error) {
    console.error("Error building internal tree:", error);
    res.status(500).json({ message: error.message });
  }
};
// Get top-level (parent) internal nodes
const getParentInternalNodes = async (req, res) => {
  try {
    const parents = await InternalNode.findAll({
      where: { parent_id: null },
      include: [{ model: InternalNode, as: "children" }],
      order: [["created_at", "ASC"]],
    });

    res.status(200).json({
      success: true,
      count: parents.length,
      nodes: parents,
    });
  } catch (error) {
    console.error("Error fetching parent internal nodes:", error);
    res.status(500).json({ message: error.message });
  }
};

//
// Get internal nodes assigned to users for a specific project
const getUserInternalNodesByProject = async (req, res) => {
  try {
    const { project_id } = req.params;
    if (!project_id) {
      return res.status(400).json({ message: "Project ID is required." });
    }

    // Get authenticated user ID from req.user (set by auth middleware)
    const user_id = req.user.user_id;

    console.log("Fetching assignments for project_id:", project_id);
    console.log("Fetching assignments for user_id:", user_id);

    // DEBUG: First check if there are any matching records
    const count = await InternalProjectUserRole.count({
      where: { project_id, user_id },
    });
    console.log("Direct count of matching records:", count);

    // If no records found, return empty array immediately
    if (count === 0) {
      console.log("No assignments found for this user in this project");
      return res.status(200).json({
        success: true,
        count: 0,
        assignments: [],
      });
    }

    // Fetch assignments with includes
    const assignments = await InternalProjectUserRole.findAll({
      where: {
        project_id: project_id,
        user_id: user_id,
      },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["user_id", "full_name", "email"],
        },
        {
          model: InternalNode,
          as: "internalNode",
          attributes: ["internal_node_id", "name", "level", "parent_id"],
        },
        {
          model: Role,
          as: "role",
          attributes: ["role_id", "name"],
        },
      ],
      // Remove paranoid: false unless you need soft-deleted records
    });

    console.log("Assignments fetched:", assignments.length);

    // Map the results using the correct field names from your model
    const result = assignments.map((assignment) => ({
      assignment_id: assignment.internal_project_user_role_id, // This is the correct field name from your model
      user: assignment.user
        ? {
            user_id: assignment.user.user_id,
            full_name: assignment.user.full_name,
            email: assignment.user.email,
          }
        : null,
      role: assignment.role
        ? {
            role_id: assignment.role.role_id,
            name: assignment.role.name,
          }
        : null,
      internal_node: assignment.internalNode
        ? {
            internal_node_id: assignment.internalNode.internal_node_id,
            name: assignment.internalNode.name,
            level: assignment.internalNode.level,
            parent_id: assignment.internalNode.parent_id,
          }
        : null,
    }));

    console.log("Mapped result count:", result.length);

    if (result.length > 0) {
      console.log(
        "First assignment sample:",
        JSON.stringify(result[0], null, 2)
      );
    }

    return res.status(200).json({
      success: true,
      count: result.length,
      assignments: result,
    });
  } catch (error) {
    console.error("Error fetching user internal nodes by project:", error);
    return res.status(500).json({
      message: error.message,
      details: "Database query failed",
    });
  }
};

module.exports = {
  createInternalNode,
  getInternalNodes,
  getInternalNodeById,
  updateInternalNode,
  deleteInternalNode,
  getInternalTree,
  getParentInternalNodes,
  getUserInternalNodesByProject,
};
