const {
  Project,
  ProjectUserRole,
  User,
  Role,
  SubRole,
  HierarchyNode,
  Hierarchy,
  Institute,
  InstituteProject,
  sequelize,
} = require("../models");

// Get all projects assigned to the current user with detailed information
const getMyAssignedProjects = async (req, res) => {
  try {
    const user_id = req.user?.user_id;

    if (!user_id) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const assignedProjects = await ProjectUserRole.findAll({
      where: {
        user_id,
        is_active: true,
      },
      include: [
        {
          model: Project,
          as: "project",
          attributes: [
            "project_id",
            "name",
            "description",
            "is_active",
            "created_at",
          ],
          include: [
            {
              model: InstituteProject,
              as: "instituteProjects",
              attributes: ["institute_project_id"],
              include: [
                {
                  model: Institute,
                  as: "institute",
                  attributes: ["institute_id", "name", "description"],
                },
              ],
            },
            {
              model: HierarchyNode,
              as: "hierarchies",
              attributes: [
                "hierarchy_node_id",
                "name",
                "description",
                "level",
                "parent_id",
              ],
            },
          ],
        },
        {
          model: Role,
          as: "role",
          attributes: ["role_id", "name", "description"],
        },
        {
          model: SubRole,
          as: "subRole",
          attributes: ["sub_role_id", "name", "description"],
        },
        {
          model: HierarchyNode,
          as: "hierarchyNode",
          attributes: ["hierarchy_node_id", "name", "description", "level"],
          include: [
            {
              model: HierarchyNode,
              as: "parent",
              attributes: ["hierarchy_node_id", "name", "level"],
            },
          ],
        },
      ],
      order: [[{ model: Project, as: "project" }, "name", "ASC"]],
    });

    if (!assignedProjects || assignedProjects.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No projects assigned to this user",
        data: [],
      });
    }

    // Transform the data for better structure
    const formattedProjects = assignedProjects
      .filter((assignment) => assignment.project) // only include if project exists
      .map((assignment) => {
        const project = assignment.project;
        const institute = project.instituteProjects?.[0]?.institute;

        return {
          assignment_id: assignment.project_user_role_id,
          project: {
            project_id: project.project_id, // <-- corrected typo (was projects_id)
            name: project.name,
            description: project.description,
            is_active: project.is_active,
            created_at: project.created_at,
            institute: institute
              ? {
                  institute_id: institute.institute_id,
                  name: institute.name,
                  description: institute.description,
                }
              : null,
          },
          role: assignment.role
            ? {
                role_id: assignment.role.role_id,
                name: assignment.role.name,
                description: assignment.role.description,
              }
            : null,
          sub_role: assignment.subRole
            ? {
                sub_role_id: assignment.subRole.sub_role_id,
                name: assignment.subRole.name,
                description: assignment.subRole.description,
              }
            : null,
          hierarchy_structure: assignment.hierarchyNode
            ? {
                node_id: assignment.hierarchyNode.hierarchy_node_id,
                node_name: assignment.hierarchyNode.name,
                node_description: assignment.hierarchyNode.description,
                level: assignment.hierarchyNode.level,
                hierarchy: assignment.hierarchyNode.hierarchy
                  ? {
                      hierarchy_id:
                        assignment.hierarchyNode.hierarchy.hierarchy_id,
                      name: assignment.hierarchyNode.hierarchy.name,
                    }
                  : null,
                parent: assignment.hierarchyNode.parent
                  ? {
                      node_id:
                        assignment.hierarchyNode.parent.hierarchy_node_id,
                      name: assignment.hierarchyNode.parent.name,
                      level: assignment.hierarchyNode.parent.level,
                    }
                  : null,
              }
            : null,
          assignment_details: {
            is_active: assignment.is_active,
            created_at: assignment.created_at,
            updated_at: assignment.updated_at,
          },
        };
      });

    return res.status(200).json({
      success: true,
      message: "User's assigned projects retrieved successfully",
      data: formattedProjects,
      count: formattedProjects.length,
    });
  } catch (error) {
    console.error("Error fetching user's assigned projects:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get detailed project information for a specific assigned project
const getMyAssignedProjectDetail = async (req, res) => {
  try {
    const user_id = req.user?.user_id;
    const { project_id } = req.params;

    if (!user_id) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const assignment = await ProjectUserRole.findOne({
      where: {
        user_id,
        project_id,
        is_active: true,
      },
      include: [
        {
          model: Project,
          as: "project",
          attributes: [
            "projects_id",
            "name",
            "description",
            "is_active",
            "created_at",
            "updated_at",
          ],
          include: [
            {
              model: InstituteProject,
              as: "instituteProjects",
              attributes: ["institue_project_id"],
              include: [
                {
                  model: Institute,
                  as: "institute",
                  attributes: [
                    "institute_id",
                    "name",
                    "description",
                    "is_active",
                  ],
                },
              ],
            },
            {
              model: Hierarchy,
              as: "hierarchies",
              attributes: ["hierarchy_id", "name", "description", "is_active"],
              include: [
                {
                  model: HierarchyNode,
                  as: "hierarchyNodes",
                  attributes: [
                    "hierarchy_node_id",
                    "name",
                    "description",
                    "level",
                    "parent_id",
                    "is_active",
                  ],
                  include: [
                    {
                      model: User,
                      as: "users",
                      attributes: ["user_id", "full_name", "email", "position"],
                      through: { attributes: [] }, // Exclude join table attributes
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          model: Role,
          as: "role",
          attributes: ["role_id", "name", "description"],
        },
        {
          model: SubRole,
          as: "subRole",
          attributes: ["sub_role_id", "name", "description"],
        },
        {
          model: HierarchyNode,
          as: "hierarchyNode",
          attributes: [
            "hierarchy_node_id",
            "name",
            "description",
            "level",
            "parent_id",
          ],
          include: [
            {
              model: HierarchyNode,
              as: "parent",
              attributes: ["hierarchy_node_id", "name", "level"],
            },
            {
              model: HierarchyNode,
              as: "children",
              attributes: ["hierarchy_node_id", "name", "level"],
              include: [
                {
                  model: User,
                  as: "users",
                  attributes: ["user_id", "full_name", "email", "position"],
                  through: { attributes: [] },
                },
              ],
            },
            {
              model: Hierarchy,
              as: "hierarchy",
              attributes: ["hierarchy_id", "name", "description"],
            },
          ],
        },
      ],
    });

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Project not found or user not assigned to this project",
      });
    }

    // Get all users assigned to this project for team information
    const projectTeam = await ProjectUserRole.findAll({
      where: {
        project_id,
        is_active: true,
      },
      include: [
        {
          model: User,
          as: "user",
          attributes: [
            "user_id",
            "full_name",
            "email",
            "position",
            "phone_number",
          ],
        },
        {
          model: Role,
          as: "role",
          attributes: ["name"],
        },
        {
          model: SubRole,
          as: "subRole",
          attributes: ["name"],
        },
        {
          model: HierarchyNode,
          as: "hierarchyNode",
          attributes: ["name", "level"],
        },
      ],
      order: [
        [{ model: HierarchyNode, as: "hierarchyNode" }, "level", "ASC"],
        [{ model: User, as: "user" }, "full_name", "ASC"],
      ],
    });

    const formattedTeam = projectTeam.map((member) => ({
      user_id: member.user.user_id,
      full_name: member.user.full_name,
      email: member.user.email,
      position: member.user.position,
      phone_number: member.user.phone_number,
      role: member.role.name,
      sub_role: member.subRole?.name || null,
      hierarchy_node: member.hierarchyNode
        ? {
            name: member.hierarchyNode.name,
            level: member.hierarchyNode.level,
          }
        : null,
    }));

    const response = {
      assignment_id: assignment.project_user_role_id,
      project: {
        project_id: assignment.project.projects_id,
        name: assignment.project.name,
        description: assignment.project.description,
        is_active: assignment.project.is_active,
        created_at: assignment.project.created_at,
        updated_at: assignment.project.updated_at,
        institute: assignment.project.instituteProjects?.[0]?.institute || null,
        hierarchies: assignment.project.hierarchies.map((hierarchy) => ({
          hierarchy_id: hierarchy.hierarchy_id,
          name: hierarchy.name,
          description: hierarchy.description,
          is_active: hierarchy.is_active,
          nodes: hierarchy.hierarchyNodes.map((node) => ({
            node_id: node.hierarchy_node_id,
            name: node.name,
            description: node.description,
            level: node.level,
            parent_id: node.parent_id,
            is_active: node.is_active,
            assigned_users: node.users.map((user) => ({
              user_id: user.user_id,
              full_name: user.full_name,
              email: user.email,
              position: user.position,
            })),
          })),
        })),
      },
      user_assignment: {
        role: {
          role_id: assignment.role.role_id,
          name: assignment.role.name,
          description: assignment.role.description,
        },
        sub_role: assignment.subRole
          ? {
              sub_role_id: assignment.subRole.sub_role_id,
              name: assignment.subRole.name,
              description: assignment.subRole.description,
            }
          : null,
        hierarchy_structure: assignment.hierarchyNode
          ? {
              node_id: assignment.hierarchyNode.hierarchy_node_id,
              node_name: assignment.hierarchyNode.name,
              node_description: assignment.hierarchyNode.description,
              level: assignment.hierarchyNode.level,
              hierarchy: assignment.hierarchyNode.hierarchy
                ? {
                    hierarchy_id:
                      assignment.hierarchyNode.hierarchy.hierarchy_id,
                    name: assignment.hierarchyNode.hierarchy.name,
                    description: assignment.hierarchyNode.hierarchy.description,
                  }
                : null,
              parent: assignment.hierarchyNode.parent
                ? {
                    node_id: assignment.hierarchyNode.parent.hierarchy_node_id,
                    name: assignment.hierarchyNode.parent.name,
                    level: assignment.hierarchyNode.parent.level,
                  }
                : null,
              children: assignment.hierarchyNode.children.map((child) => ({
                node_id: child.hierarchy_node_id,
                name: child.name,
                level: child.level,
                assigned_users: child.users.map((user) => ({
                  user_id: user.user_id,
                  full_name: user.full_name,
                  email: user.email,
                  position: user.position,
                })),
              })),
            }
          : null,
      },
      project_team: {
        total_members: projectTeam.length,
        members: formattedTeam,
      },
      assignment_metadata: {
        is_active: assignment.is_active,
        created_at: assignment.created_at,
        updated_at: assignment.updated_at,
      },
    };

    return res.status(200).json({
      success: true,
      message: "Project details retrieved successfully",
      data: response,
    });
  } catch (error) {
    console.error("Error fetching project details:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get user's hierarchy structure within a project
const getMyProjectHierarchy = async (req, res) => {
  try {
    const user_id = req.user?.user_id;
    const { project_id } = req.params;

    if (!user_id) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const assignment = await ProjectUserRole.findOne({
      where: {
        user_id,
        project_id,
        is_active: true,
      },
      include: [
        {
          model: HierarchyNode,
          as: "hierarchyNode",
          attributes: [
            "hierarchy_node_id",
            "name",
            "description",
            "level",
            "parent_id",
          ],
          include: [
            {
              model: Hierarchy,
              as: "hierarchy",
              attributes: ["hierarchy_id", "name", "description"],
            },
          ],
        },
        {
          model: Project,
          as: "project",
          attributes: ["projects_id", "name"],
        },
      ],
    });

    if (!assignment || !assignment.hierarchyNode) {
      return res.status(404).json({
        success: false,
        message: "User not assigned to a hierarchy node in this project",
      });
    }

    // Get complete hierarchy tree for the project
    const hierarchyTree = await HierarchyNode.findAll({
      where: {
        hierarchy_id: assignment.hierarchyNode.hierarchy_node_id,
      },
      include: [
        {
          model: User,
          as: "users",
          attributes: ["user_id", "full_name", "email", "position"],
          through: { attributes: [] },
        },
        {
          model: HierarchyNode,
          as: "parent",
          attributes: ["hierarchy_node_id", "name", "level"],
        },
        {
          model: HierarchyNode,
          as: "children",
          attributes: ["hierarchy_node_id", "name", "level"],
          include: [
            {
              model: User,
              as: "users",
              attributes: ["user_id", "full_name", "email", "position"],
              through: { attributes: [] },
            },
          ],
        },
      ],
      order: [
        ["level", "ASC"],
        ["name", "ASC"],
      ],
    });

    // Build hierarchical structure
    const buildHierarchy = (nodes, parentId = null) => {
      return nodes
        .filter((node) => node.parent_id === parentId)
        .map((node) => ({
          node_id: node.hierarchy_node_id,
          name: node.name,
          description: node.description,
          level: node.level,
          assigned_users: node.users.map((user) => ({
            user_id: user.user_id,
            full_name: user.full_name,
            email: user.email,
            position: user.position,
            is_current_user: user.user_id === user_id,
          })),
          children: buildHierarchy(nodes, node.hierarchy_node_id),
        }));
    };

    const hierarchicalStructure = buildHierarchy(hierarchyTree);

    const response = {
      project: {
        project_id: assignment.project.projects_id,
        name: assignment.project.name,
      },
      hierarchy: {
        hierarchy_id: assignment.hierarchyNode.hierarchy.hierarchy_id,
        name: assignment.hierarchyNode.hierarchy.name,
        description: assignment.hierarchyNode.hierarchy.description,
      },
      user_position: {
        node_id: assignment.hierarchyNode.hierarchy_node_id,
        node_name: assignment.hierarchyNode.name,
        level: assignment.hierarchyNode.level,
        description: assignment.hierarchyNode.description,
      },
      complete_hierarchy: hierarchicalStructure,
    };

    return res.status(200).json({
      success: true,
      message: "Project hierarchy structure retrieved successfully",
      data: response,
    });
  } catch (error) {
    console.error("Error fetching project hierarchy:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

module.exports = {
  getMyAssignedProjects,
  getMyAssignedProjectDetail,
  getMyProjectHierarchy,
};
