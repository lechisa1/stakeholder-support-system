const {
  Project,
  Institute,
  HierarchyNode,
  ProjectUserRole,
  Role,
  SubRole,
  UserType,
  User,
  InstituteProject,
  ProjectMaintenance,
  InternalProjectUserRole,
  ProjectMetricProject,
  ProjectMetric,
  UserRoles,
  sequelize,
  InternalNode,
} = require("../models");
const { v4: uuidv4 } = require("uuid");

// Create a new project
const createProject = async (req, res) => {
  try {
    const {
      name,
      description,
      is_active,
      institute_id,
      maintenance_start,
      maintenance_end,
      project_metrics_ids,
    } = req.body;

    // Check if project exists
    const existingProject = await Project.findOne({ where: { name } });
    if (existingProject)
      return res
        .status(400)
        .json({ message: "Project with this name already exists." });

    const project_id = uuidv4();

    // Create project
    const project = await Project.create({
      project_id,
      name,
      description,
      is_active,
      institute_id: institute_id || null,
    });

    // Create maintenance record if dates are provided
    if (maintenance_start || maintenance_end) {
      await ProjectMaintenance.create({
        maintenance_id: uuidv4(),
        project_id,
        start_date: maintenance_start || null,
        end_date: maintenance_end || null,
      });
    }

    // If institute_id is provided, create the association
    if (institute_id) {
      const institute = await Institute.findByPk(institute_id);
      if (!institute) {
        return res.status(404).json({ message: "Institute not found" });
      }

      // Check if association already exists
      const existingAssociation = await InstituteProject.findOne({
        where: { institute_id, project_id: project_id },
      });
      if (existingAssociation) {
        return res
          .status(400)
          .json({ message: "Project is already assigned to this institute" });
      }

      // Create association
      const institute_project_id = await InstituteProject.create({
        institute_project_id: uuidv4(),
        institute_id,
        project_id: project_id,
        is_active: true,
      });
      console.log(
        "institute_project_id institute_project_id institute_project_id",
        institute_project_id
      );
    }

    // Assign metrics to project if provided
    if (
      project_metrics_ids &&
      Array.isArray(project_metrics_ids) &&
      project_metrics_ids.length > 0
    ) {
      // Check if all metrics exist
      const metrics = await ProjectMetric.findAll({
        where: { project_metric_id: project_metrics_ids },
      });

      if (metrics.length !== project_metrics_ids.length) {
        return res
          .status(404)
          .json({ message: "One or more metrics not found." });
      }

      // Prepare metric assignments
      const metricAssignments = project_metrics_ids.map((metric_id) => ({
        id: uuidv4(),
        project_id,
        project_metric_id: metric_id,
      }));

      // Create metric assignments
      await ProjectMetricProject.bulkCreate(metricAssignments);
    }

    res.status(201).json(project);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Get all projects
const getProjects = async (req, res) => {
  try {
    const projects = await Project.findAll({
      include: [
        {
          model: Institute,
          as: "institutes",
          through: { attributes: ["is_active"] },
        },
      ],
    });
    res.status(200).json(projects);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Get project by ID
const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findByPk(id, {
      include: [
        {
          model: Institute,
          as: "institutes",
          through: { attributes: ["is_active"] },
        },
        // HierarchyNode
        {
          model: ProjectUserRole,
          as: "projectUserRoles", // make sure your Project model has `hasMany(ProjectUserRole, { as: "projectUserRoles" })`
          include: [
            {
              model: User,
              as: "user",
              attributes: ["user_id", "full_name", "email"],
            },
            { model: Role, as: "role", attributes: ["role_id", "name"] },
            {
              model: SubRole,
              as: "subRole",
              attributes: ["sub_role_id", "name"],
            }, // MUST match the alias
            {
              model: HierarchyNode,
              as: "hierarchyNode",
              attributes: ["hierarchy_node_id", "name"],
            },
          ],
        },
        // Maintenance
        {
          model: ProjectMaintenance,
          as: "maintenances", // Make sure your Project model has hasMany(ProjectMaintenance, { as: "maintenances" })
          attributes: [
            "maintenance_id",
            "start_date",
            "end_date",
            "created_at",
            "updated_at",
          ],
        },
        {
          model: ProjectMetric,
          as: "metrics",
          attributes: ["project_metric_id", "name", "description", "is_active"],
        },
      ],
    });
    if (!project) return res.status(404).json({ message: "Project not found" });
    res.status(200).json(project);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};
// Get all projects by institute ID
const getProjectByInstituteId = async (req, res) => {
  try {
    const { institute_id } = req.params;

    if (!institute_id) {
      return res.status(400).json({ message: "Institute ID is required" });
    }

    const projects = await Project.findAll({
      include: [
        {
          model: Institute,
          as: "institutes",
          where: { institute_id },
          required: true, // Only return projects linked to this institute
          through: { attributes: ["is_active"] },
        },
        {
          model: ProjectUserRole,
          as: "projectUserRoles",
          include: [
            {
              model: User,
              as: "user",
              attributes: ["user_id", "full_name", "email"],
            },
            {
              model: Role,
              as: "role",
              attributes: ["role_id", "name"],
            },
            {
              model: SubRole,
              as: "subRole",
              attributes: ["sub_role_id", "name"],
            },
            {
              model: HierarchyNode,
              as: "hierarchyNode",
              attributes: ["hierarchy_node_id", "name"],
            },
          ],
        },
        // Maintenance
        {
          model: ProjectMaintenance,
          as: "maintenances", // Make sure your Project model has hasMany(ProjectMaintenance, { as: "maintenances" })
          attributes: [
            "maintenance_id",
            "start_date",
            "end_date",
            "created_at",
            "updated_at",
          ],
        },
      ],
    });

    if (!projects || projects.length === 0) {
      return res.status(404).json({
        message: "No projects found for this institute",
      });
    }

    return res.status(200).json(projects);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

// const assignUserToProject = async (req, res) => {
//   const t = await sequelize.transaction();
//   try {
//     const { project_id, user_id, hierarchy_node_id } = req.body;

//     // ====== Validate project ======
//     const project = await Project.findByPk(project_id, { transaction: t });
//     if (!project) {
//       await t.rollback();
//       return res
//         .status(404)
//         .json({ success: false, message: "Project not found." });
//     }

//     // ====== Validate user ======
//     const user = await User.findByPk(user_id, {
//       include: [{ model: Role, as: "roles", through: { attributes: [] } }],
//       transaction: t,
//     });
//     if (!user) {
//       await t.rollback();
//       return res
//         .status(404)
//         .json({ success: false, message: "User not found." });
//     }

//     // ====== Get user's role from UserRoles table ======
//     const userRoles = await UserRoles.findAll({
//       where: {
//         user_id: user_id,
//         is_active: true,
//       },
//       include: [
//         {
//           model: Role,
//           as: "role",
//           where: { is_active: true },
//         },
//       ],
//       transaction: t,
//     });

//     if (!userRoles || userRoles.length === 0) {
//       await t.rollback();
//       return res.status(400).json({
//         success: false,
//         message:
//           "User does not have any assigned roles. Please assign a role to the user first.",
//       });
//     }

//     // Always select the first active role (you can modify this logic if needed)
//     const userRole = userRoles[0];
//     const role_id = userRole.role_id;

//     // ====== Prevent duplicate assignment ======
//     const existing = await ProjectUserRole.findOne({
//       where: { project_id, user_id },
//       transaction: t,
//     });
//     if (existing) {
//       await t.rollback();
//       return res.status(400).json({
//         success: false,
//         message: "User already assigned to this project.",
//       });
//     }

//     // ====== External user logic ======
//     if (user.user_type === "external_user") {
//       if (!hierarchy_node_id) {
//         await t.rollback();
//         return res.status(400).json({
//           success: false,
//           message: "External users must be assigned a hierarchy node.",
//         });
//       }

//       // Validate hierarchy node
//       const node = await HierarchyNode.findByPk(hierarchy_node_id, {
//         transaction: t,
//       });
//       if (!node || node.project_id !== project_id) {
//         await t.rollback();
//         return res.status(400).json({
//           success: false,
//           message:
//             "Hierarchy node not found or does not belong to this project.",
//         });
//       }
//     }
//     const finalHierarchyId =
//       user.user_type === "external_user" ? hierarchy_node_id : null;
//     // ====== Create project-user-role ======
//     const assignment = await ProjectUserRole.create(
//       {
//         project_user_role_id: uuidv4(),
//         project_id,
//         user_id,
//         role_id,
//         hierarchy_node_id: hierarchy_node_id,
//         is_active: true,
//         created_at: new Date(),
//         updated_at: new Date(),
//       },
//       { transaction: t }
//     );

//     await t.commit();

//     return res.status(201).json({
//       success: true,
//       message: "User assigned to project successfully.",
//       data: assignment,
//     });
//   } catch (error) {
//     if (!t.finished) await t.rollback();
//     console.error("Error assigning user to project:", error);
//     return res.status(500).json({ success: false, message: error.message });
//   }
// };

const assignUserToProject = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { project_id, user_id, hierarchy_node_id } = req.body;

    // ====== Validate project ======
    const project = await Project.findByPk(project_id, { transaction: t });
    if (!project) {
      await t.rollback();
      return res
        .status(404)
        .json({ success: false, message: "Project not found." });
    }

    // ====== Validate user ======
    const user = await User.findByPk(user_id, {
      include: [
        {
          model: Role,
          as: "roles",
          through: { attributes: [] },
        },
      ],
      transaction: t,
    });
    if (!user) {
      await t.rollback();
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    // ====== Get user's role from UserRoles table ======
    const userRoles = await UserRoles.findAll({
      where: {
        user_id: user_id,
        is_active: true,
      },
      include: [
        {
          model: Role,
          as: "role",
          where: { is_active: true },
        },
      ],
      transaction: t,
    });

    if (!userRoles || userRoles.length === 0) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message:
          "User does not have any assigned roles. Please assign a role to the user first.",
      });
    }

    // Always select the first active role (you can modify this logic if needed)
    const userRole = userRoles[0];
    const role_id = userRole.role_id;

    // ====== Prevent duplicate assignment ======
    const existing = await ProjectUserRole.findOne({
      where: { project_id, user_id },
      transaction: t,
    });
    if (existing) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: "User already assigned to this project.",
      });
    }

    // ====== External user logic ======
    if (user.user_type_id) {
      // Get user type name to check if external user
      const userType = await UserType.findByPk(user.user_type_id, {
        transaction: t,
      });

      if (userType && userType.name === "external_user") {
        if (!hierarchy_node_id) {
          await t.rollback();
          return res.status(400).json({
            success: false,
            message: "External users must be assigned a hierarchy node.",
          });
        }

        // Validate hierarchy node
        const node = await HierarchyNode.findByPk(hierarchy_node_id, {
          transaction: t,
        });
        if (!node || node.project_id !== project_id) {
          await t.rollback();
          return res.status(400).json({
            success: false,
            message:
              "Hierarchy node not found or does not belong to this project.",
          });
        }
      }
    }

    // ====== Create project-user-role ======
    const assignment = await ProjectUserRole.create(
      {
        project_user_role_id: uuidv4(),
        project_id,
        user_id,
        role_id, // Automatically taken from user's roles
        hierarchy_node_id: hierarchy_node_id,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      { transaction: t }
    );

    await t.commit();

    // Fetch complete assignment with role details
    const completeAssignment = await ProjectUserRole.findByPk(
      assignment.project_user_role_id,
      {
        include: [
          {
            model: Role,
            as: "role",
            attributes: ["role_id", "name"],
          },
          {
            model: Project,
            as: "project",
            attributes: ["project_id", "name"],
          },
          {
            model: User,
            as: "user",
            attributes: ["user_id", "full_name", "email"],
          },
        ],
      }
    );

    return res.status(201).json({
      success: true,
      message: "User assigned to project successfully.",
      data: completeAssignment,
    });
  } catch (error) {
    if (!t.finished) await t.rollback();
    console.error("Error assigning user to project:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// const assignInternalUsersToProject = async (req, res) => {
//   const t = await sequelize.transaction();

//   try {
//     const { project_id, user_id, internal_node_id, project_metric_id } =
//       req.body;

//     // ====== Validate project ======
//     const project = await Project.findByPk(project_id, { transaction: t });
//     if (!project) {
//       await t.rollback();
//       return res.status(404).json({
//         success: false,
//         message: "Project not found.",
//       });
//     }

//     // ====== Validate user ======
//     const user = await User.findByPk(user_id, {
//       include: [
//         {
//           model: Role,
//           as: "roles",
//           through: { attributes: [] },
//         },
//       ],
//       transaction: t,
//     });
//     if (!user) {
//       await t.rollback();
//       return res.status(404).json({
//         success: false,
//         message: "User not found.",
//       });
//     }

//     // ====== Get user's role from UserRoles table ======
//     const userRoles = await UserRoles.findAll({
//       where: {
//         user_id: user_id,
//         is_active: true,
//       },
//       include: [
//         {
//           model: Role,
//           as: "role",
//           where: { is_active: true },
//         },
//       ],
//       transaction: t,
//     });

//     if (!userRoles || userRoles.length === 0) {
//       await t.rollback();
//       return res.status(400).json({
//         success: false,
//         message:
//           "User does not have any assigned roles. Please assign a role to the user first.",
//       });
//     }

//     // Always select the first active role (you can modify this logic if needed)
//     const userRole = userRoles[0];
//     const role_id = userRole.role_id;

//     // ====== Validate Internal Node (if provided) ======
//     let finalInternalNodeId = null;

//     if (internal_node_id) {
//       const internalNode = await InternalNode.findByPk(internal_node_id, {
//         transaction: t,
//       });
//       if (!internalNode) {
//         await t.rollback();
//         return res.status(400).json({
//           success: false,
//           message: "Internal node not found.",
//         });
//       }
//       finalInternalNodeId = internal_node_id;
//     }

//     // ====== Prevent duplicate assignment ======
//     const existing = await InternalProjectUserRole.findOne({
//       where: { project_id, user_id },
//       transaction: t,
//     });

//     if (existing) {
//       await t.rollback();
//       return res.status(400).json({
//         success: false,
//         message: "User is already assigned to this project.",
//       });
//     }

//     // ====== Create internal project-user-role ======
//     const assignment = await InternalProjectUserRole.create(
//       {
//         internal_project_user_role_id: uuidv4(),
//         project_id,
//         user_id,
//         role_id,
//         internal_node_id: finalInternalNodeId,
//         is_active: true,
//         created_at: new Date(),
//         updated_at: new Date(),
//       },
//       { transaction: t }
//     );

//     await t.commit();

//     return res.status(201).json({
//       success: true,
//       message: "Internal user assigned to project successfully.",
//       data: assignment,
//     });
//   } catch (error) {
//     if (!t.finished) await t.rollback();
//     console.error("Error assigning internal user to project:", error);

//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// Update project

const assignInternalUsersToProject = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { project_id, user_id, internal_node_id, project_metric_id } =
      req.body;

    // ====== Validate project ======
    const project = await Project.findByPk(project_id, { transaction: t });
    if (!project) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: "Project not found.",
      });
    }

    // ====== Validate user ======
    const user = await User.findByPk(user_id, {
      include: [
        {
          model: Role,
          as: "roles",
          through: { attributes: [] },
        },
      ],
      transaction: t,
    });
    if (!user) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // ====== Validate Project Metric (required) ======
    const metric = await ProjectMetric.findByPk(project_metric_id, {
      transaction: t,
    });

    if (!metric) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: "Project metric not found.",
      });
    }

    // ====== Get user's role from UserRoles table ======
    const userRoles = await UserRoles.findAll({
      where: {
        user_id: user_id,
        is_active: true,
      },
      include: [
        {
          model: Role,
          as: "role",
          where: { is_active: true },
        },
      ],
      transaction: t,
    });

    if (!userRoles || userRoles.length === 0) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message:
          "User does not have any assigned roles. Please assign a role to the user first.",
      });
    }

    // Always select the first active role (you can modify this logic if needed)
    const userRole = userRoles[0];
    const role_id = userRole.role_id;

    // ====== Validate Internal Node (if provided) ======
    let finalInternalNodeId = null;

    if (internal_node_id) {
      const internalNode = await InternalNode.findByPk(internal_node_id, {
        transaction: t,
      });
      if (!internalNode) {
        await t.rollback();
        return res.status(400).json({
          success: false,
          message: "Internal node not found.",
        });
      }
      finalInternalNodeId = internal_node_id;
    }

    if (!internal_node_id) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: "Internal node ID is required.",
      });
    }

    // ====== Prevent duplicate assignment ======
    const existing = await InternalProjectUserRole.findOne({
      where: { project_id, user_id, project_metric_id },
      transaction: t,
    });

    if (existing) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message:
          "User is already assigned to this project with the same metric.",
      });
    }

    // ====== Create internal project-user-role ======
    const assignment = await InternalProjectUserRole.create(
      {
        internal_project_user_role_id: uuidv4(),
        project_id,
        user_id,
        role_id,
        internal_node_id: finalInternalNodeId,
        project_metric_id,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      { transaction: t }
    );

    await t.commit();

    return res.status(201).json({
      success: true,
      message: "Internal user assigned to project successfully.",
      data: assignment,
    });
  } catch (error) {
    if (!t.finished) await t.rollback();
    console.error("Error assigning internal user to project:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, is_active } = req.body;

    const project = await Project.findByPk(id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    project.name = name || project.name;
    project.description = description || project.description;
    if (is_active !== undefined) project.is_active = is_active;

    await project.save();
    res.status(200).json(project);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

const updateProjectMaintenance = async (req, res) => {
  try {
    const { project_id } = req.params;
    const { maintenance_start, maintenance_end } = req.body;

    // Check if project exists
    const project = await Project.findByPk(project_id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Find existing maintenance record for the project
    const maintenance = await ProjectMaintenance.findOne({
      where: { project_id },
    });

    if (!maintenance) {
      return res.status(404).json({ message: "Maintenance record not found" });
    }

    // Validate dates if provided
    if (
      maintenance_start &&
      maintenance_end &&
      new Date(maintenance_start) > new Date(maintenance_end)
    ) {
      return res
        .status(400)
        .json({ message: "Maintenance start cannot be after end date" });
    }

    // Update fields
    if (maintenance_start) maintenance.start_date = maintenance_start;
    if (maintenance_end) maintenance.end_date = maintenance_end;

    await maintenance.save();

    res.status(200).json({
      message: "Project maintenance updated successfully",
      maintenance,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Delete project
const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findByPk(id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    await project.destroy();
    res.status(200).json({ message: "Project deleted successfully" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};
const removeUserFromProject = async (req, res) => {
  try {
    const { project_id, user_id } = req.body;

    const deleted = await ProjectUserRole.destroy({
      where: { project_id, user_id },
    });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "User not found in this project.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User removed from project successfully",
    });
  } catch (error) {
    console.error("Error removing user from project:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get list of projects assigned to a user
const getProjectsAssignedToUser = async (req, res) => {
  try {
    const { user_id } = req.params;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const assignments = await ProjectUserRole.findAll({
      where: { user_id, is_active: true },
      include: [
        {
          model: Project,
          as: "project",
          include: [
            {
              model: InstituteProject,
              as: "instituteProjects",
            },
          ],
        },
        {
          model: Role,
          as: "role",
          attributes: ["role_id", "name"],
        },
        {
          model: SubRole,
          as: "subRole",
          attributes: ["sub_role_id", "name"],
        },
        {
          model: HierarchyNode,
          as: "hierarchyNode",
          attributes: ["hierarchy_node_id", "name"],
        },
        // Maintenance
        // {
        //   model: ProjectMaintenance,
        //   as: "maintenances", // Make sure your Project model has hasMany(ProjectMaintenance, { as: "maintenances" })
        //   attributes: [
        //     "maintenance_id",
        //     "start_date",
        //     "end_date",
        //     "created_at",
        //     "updated_at",
        //   ],
        // },
      ],
      order: [["created_at", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      count: assignments.length,
      data: assignments,
    });
  } catch (error) {
    console.error("Error fetching assigned projects:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  getProjectByInstituteId,
  updateProject,
  updateProjectMaintenance,
  deleteProject,
  assignUserToProject,
  assignInternalUsersToProject,
  removeUserFromProject,
  getProjectsAssignedToUser,
};
