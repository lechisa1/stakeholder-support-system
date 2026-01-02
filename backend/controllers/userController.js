const {
  User,
  UserType,
  Institute,
  UserPosition,
  ProjectUserRole,
  Role,
  SubRole,
  RoleSubRole,
  RoleSubRolePermission,
  InternalProjectUserRole,
  ProjectMetricUser,
  Permission,
  InternalNode,
  ProjectMetric,
  Project,
  UserRoles,
  HierarchyNode,
  sequelize,
} = require("../models");
const { v4: uuidv4, validate: isUuid } = require("uuid");
const { Op } = require("sequelize");
const bcrypt = require("bcrypt");
const { generateRandomPassword } = require("../utils/password");
const { sendEmail } = require("../utils/sendEmail");

const getUserTypes = async (req, res) => {
  try {
    const userTypes = await UserType.findAll({
      attributes: [
        "user_type_id",
        "name",
        "description",
        "created_at",
        "updated_at",
      ],
      order: [["name", "ASC"]],
    });

    return res.status(200).json({
      success: true,
      message: "User types fetched successfully",
      data: userTypes,
    });
  } catch (error) {
    console.error("Error fetching user types:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch user types",
      error: error.message,
    });
  }
};
const getUserPositions = async (req, res) => {
  try {
    const userPositions = await UserPosition.findAll({
      attributes: [
        "user_position_id",
        "name",
        "description",
        "created_at",
        "updated_at",
      ],
      order: [["name", "ASC"]],
    });

    return res.status(200).json({
      success: true,
      message: "User positions fetched successfully",
      data: userPositions,
    });
  } catch (error) {
    console.error("Error fetching user positions:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch user positions",
      error: error.message,
    });
  }
};

const createUser = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const {
      full_name,
      email,
      user_type_id,
      user_position_id,
      institute_id,
      role_ids,
      project_metrics_ids,
      phone_number,
      hierarchy_node_id,
    } = req.body;

    // ====== Check existing email ======
    const existingUser = await User.findOne({
      where: { email },
      transaction: t,
    });
    if (existingUser) {
      await t.rollback();
      return res
        .status(400)
        .json({ success: false, message: "User already exists." });
    }

    // ====== Validate user type ======
    const userType = await UserType.findByPk(user_type_id, { transaction: t });
    if (!userType) {
      await t.rollback();
      return res
        .status(400)
        .json({ success: false, message: "Invalid user type." });
    }

    // ====== Enforce institute_id for external_user ======
    if (userType.name === "external_user") {
      if (!institute_id) {
        await t.rollback();
        return res.status(400).json({
          success: false,
          message: "Institute ID is required for external users.",
        });
      }
      if (!user_position_id) {
        await t.rollback();
        return res.status(400).json({
          success: false,
          message: "Position is required for external users.",
        });
      }

      // Validate institute existence
      const institute = await Institute.findByPk(institute_id, {
        transaction: t,
      });
      if (!institute) {
        await t.rollback();
        return res
          .status(400)
          .json({ success: false, message: "Invalid institute ID." });
      }
      // Validate institute existence
      const position = await UserPosition.findByPk(user_position_id, {
        transaction: t,
      });
      if (!position) {
        await t.rollback();
        return res
          .status(400)
          .json({ success: false, message: "Invalid Position ID." });
      }
    } else {
      // internal_user or others must not have institute_id
      if (institute_id) {
        await t.rollback();
        return res.status(400).json({
          success: false,
          message: "Institute ID should not be provided for internal users.",
        });
      }
    }

    // ====== Optional hierarchy validation ======
    if (hierarchy_node_id) {
      const node = await HierarchyNode.findByPk(hierarchy_node_id, {
        transaction: t,
      });
      if (!node) {
        await t.rollback();
        return res
          .status(400)
          .json({ success: false, message: "Invalid hierarchy node ID." });
      }
    }

    // ====== MULTIPLE ROLE VALIDATION ======
    if (role_ids && Array.isArray(role_ids) && role_ids.length > 0) {
      const roles = await Role.findAll({
        where: { role_id: role_ids },
        transaction: t,
      });

      if (roles.length !== role_ids.length) {
        await t.rollback();
        return res.status(400).json({
          success: false,
          message: "One or more provided role IDs are invalid.",
        });
      }
    }

    // ====== Validate metrics if provided ======
    if (
      project_metrics_ids &&
      Array.isArray(project_metrics_ids) &&
      project_metrics_ids.length > 0
    ) {
      const metrics = await ProjectMetric.findAll({
        where: { project_metric_id: project_metrics_ids },
        transaction: t,
      });

      if (metrics.length !== project_metrics_ids.length) {
        await t.rollback();
        return res
          .status(404)
          .json({ success: false, message: "One or more metrics not found." });
      }
    }

    // ====== Generate password ======
    // const password = generateRandomPassword();
    const password = "password";
    const hashedPassword = await bcrypt.hash(password, 10);

    // ====== Create User ======
    const user = await User.create(
      {
        user_id: uuidv4(),
        full_name,
        email,
        password: hashedPassword,
        phone_number,
        user_type_id,
        institute_id: userType.name === "external_user" ? institute_id : null,
        user_position_id:
          userType.name === "external_user" ? user_position_id : null,
        hierarchy_node_id: hierarchy_node_id ?? null,
        is_first_logged_in: true,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      { transaction: t }
    );

    // =======================================================
    // 🔵 MULTIPLE ROLE ASSIGNMENT
    // =======================================================
    if (role_ids && Array.isArray(role_ids) && role_ids.length > 0) {
      const roleAssignments = role_ids.map((rid) => ({
        user_role_id: uuidv4(),
        user_id: user.user_id,
        role_id: rid,
        assigned_by: req.user?.user_id || null,
        assigned_at: new Date(),
        is_active: true,
      }));

      await UserRoles.bulkCreate(roleAssignments, { transaction: t });
    }

    // ====== Assign metrics to user if provided ======
    if (
      project_metrics_ids &&
      Array.isArray(project_metrics_ids) &&
      project_metrics_ids.length > 0
    ) {
      // Prepare metric assignments
      const metricAssignments = project_metrics_ids.map((metric_id) => ({
        id: uuidv4(),
        user_id: user.user_id,
        project_metric_id: metric_id,
        value: null, // Default value, can be updated later
      }));

      // Create metric assignments
      await ProjectMetricUser.bulkCreate(metricAssignments, { transaction: t });
    }

    await t.commit();

    // ====== Send welcome email ======
    await sendEmail(
      email,
      `Welcome to ${process.env.APP_NAME}!`,
      `
      Dear ${full_name},
      Your account has been successfully created.
      Email: ${email}
      Temporary Password: ${password}
      Please change your password after first login.
    `
    );

    return res.status(201).json({
      success: true,
      message: "User registered globally (no roles assigned yet)",
      data: user,
    });
  } catch (error) {
    if (!t.finished) await t.rollback();
    console.error("Error creating user:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// =============== Update user ===============
const updateUser = async (req, res) => {
  // console.log("update user reached")

  const t = await sequelize.transaction();
  try {
    const { id: user_id } = req.params;
    const {
      full_name,
      email,
      user_type_id,
      institute_id,
      phone_number,
      hierarchy_node_id,
      is_active,
      role_ids,
      project_metrics_ids,
    } = req.body;

    // ====== Find user ======
    const user = await User.findByPk(user_id, { transaction: t });
    console.log("user: ", user, "user_idL ", user_id, req.params);
    if (!user) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // ====== Check for email duplication ======
    if (email && email !== user.email) {
      const existingEmail = await User.findOne({
        where: { email },
        transaction: t,
      });
      if (existingEmail) {
        await t.rollback();
        return res.status(400).json({
          success: false,
          message: "Email is already in use by another user.",
        });
      }
    }

    // ====== Validate user type ======
    if (user_type_id) {
      const userType = await UserType.findByPk(user_type_id, {
        transaction: t,
      });
      if (!userType) {
        await t.rollback();
        return res
          .status(400)
          .json({ success: false, message: "Invalid user type." });
      }
    }

    // ====== Optional institute validation ======
    if (institute_id) {
      const institute = await Institute.findByPk(institute_id, {
        transaction: t,
      });
      if (!institute) {
        await t.rollback();
        return res
          .status(400)
          .json({ success: false, message: "Invalid institute ID." });
      }
    }

    // ====== Optional hierarchy validation ======
    if (hierarchy_node_id) {
      const node = await HierarchyNode.findByPk(hierarchy_node_id, {
        transaction: t,
      });
      if (!node) {
        await t.rollback();
        return res
          .status(400)
          .json({ success: false, message: "Invalid hierarchy node ID." });
      }
    }

    // ====== Update user ======
    await user.update(
      {
        full_name: full_name ?? user.full_name,
        email: email ?? user.email,
        phone_number: phone_number ?? user.phone_number,
        user_type_id: user_type_id ?? user.user_type_id,
        institute_id: institute_id ?? null,
        hierarchy_node_id: hierarchy_node_id ?? null,
        is_active: is_active ?? user.is_active,
        updated_at: new Date(),
      },
      { transaction: t }
    );

    // ====== Update roles if provided ======
    if (role_ids && Array.isArray(role_ids)) {
      // Validate roles exist
      const roles = await Role.findAll({
        where: { role_id: role_ids },
        transaction: t,
      });
      if (roles.length !== role_ids.length) {
        await t.rollback();
        return res.status(400).json({
          success: false,
          message: "One or more provided role IDs are invalid.",
        });
      }

      // Delete old roles
      await UserRoles.destroy({
        where: { user_id },
        transaction: t,
      });

      // Assign new roles
      const roleAssignments = role_ids.map((rid) => ({
        user_role_id: uuidv4(),
        user_id,
        role_id: rid,
        assigned_by: req.user?.user_id || null,
        assigned_at: new Date(),
        is_active: true,
      }));
      await UserRoles.bulkCreate(roleAssignments, { transaction: t });
    }

    // ====== Update project metrics if provided ======
    if (project_metrics_ids && Array.isArray(project_metrics_ids)) {
      // Validate metrics exist
      const metrics = await ProjectMetric.findAll({
        where: { project_metric_id: project_metrics_ids },
        transaction: t,
      });
      if (metrics.length !== project_metrics_ids.length) {
        await t.rollback();
        return res
          .status(404)
          .json({ success: false, message: "One or more metrics not found." });
      }

      // Delete old metric assignments
      await ProjectMetricUser.destroy({
        where: { user_id },
        transaction: t,
      });

      // Assign new metrics
      const metricAssignments = project_metrics_ids.map((metric_id) => ({
        id: uuidv4(),
        user_id,
        project_metric_id: metric_id,
        value: null,
      }));
      await ProjectMetricUser.bulkCreate(metricAssignments, { transaction: t });
    }

    await t.commit();

    return res.status(200).json({
      success: true,
      message: "User updated successfully.",
      data: user,
    });
  } catch (error) {
    if (!t.finished) await t.rollback();
    console.error("Error updating user:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ============Get all users=====================
const getUsers = async (req, res) => {
  try {
    const {
      institute_id,
      user_type_id,
      user_position_id,
      hierarchy_node_id,
      is_active,
      search, // optional: for name/email search
      page = 1,
      pageSize = 10,
    } = req.query;

    // ====== Build filters dynamically ======
    const whereClause = {};

    if (institute_id) whereClause.institute_id = institute_id;
    if (user_type_id) whereClause.user_type_id = user_type_id;
    if (user_position_id) whereClause.user_position_id = user_position_id;
    if (hierarchy_node_id) whereClause.hierarchy_node_id = hierarchy_node_id;
    if (is_active !== undefined) whereClause.is_active = is_active === "true";

    if (search) {
      whereClause[Op.or] = [
        { full_name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { phone_number: { [Op.like]: `%${search}%` } },
      ];
    }

    // ====== Calculate pagination ======
    const pageNum = parseInt(page);
    const limit = parseInt(pageSize);
    const offset = (pageNum - 1) * limit;

    // ====== Fetch total count ======
    const total = await User.count({ where: whereClause });

    // ====== Fetch users with associations ======
    const users = await User.findAll({
      where: whereClause,
      include: [
        {
          model: Institute,
          as: "institute",
          attributes: ["institute_id", "name"],
        },
        {
          model: UserType,
          as: "userType",
          attributes: ["user_type_id", "name"],
        },
        {
          model: HierarchyNode,
          as: "hierarchyNode",
          attributes: ["hierarchy_node_id", "name"],
        },
      ],
      order: [["created_at", "DESC"]],
      limit: limit,
      offset: offset,
    });

    const totalPages = Math.ceil(total / limit);

    return res.status(200).json({
      success: true,
      message: "Users fetched successfully.",
      data: users,
      meta: {
        page: pageNum,
        pageSize: limit,
        total: total,
        totalPages: totalPages,
      },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch users.",
      error: error.message,
    });
  }
};

// Get users by institute ID
const getUsersByInstituteId = async (req, res) => {
  try {
    const { institute_id } = req.params;

    if (!institute_id) {
      return res.status(400).json({
        success: false,
        message: "Institute ID is required",
      });
    }

    // Fetch users with associations
    const users = await User.findAll({
      where: { institute_id },
      include: [
        {
          model: Institute,
          as: "institute",
          attributes: ["institute_id", "name"],
        },
        {
          model: UserType,
          as: "userType",
          attributes: ["user_type_id", "name"],
        },
        {
          model: HierarchyNode,
          as: "hierarchyNode",
          attributes: ["hierarchy_node_id", "name"],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      message: "Users fetched successfully for the institute.",
      data: users,
    });
  } catch (error) {
    console.error("Error fetching users by institute:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch users by institute.",
      error: error.message,
    });
  }
};

const getUsersAssignedToNode = async (req, res) => {
  try {
    const { project_id, hierarchy_node_id } = req.params;

    // Validate project
    const project = await Project.findByPk(project_id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: `Project with id '${project_id}' not found.`,
      });
    }

    // Validate hierarchy node
    const hierarchyNode = await HierarchyNode.findOne({
      where: { hierarchy_node_id, project_id },
    });

    if (!hierarchyNode) {
      return res.status(404).json({
        success: false,
        message: `Hierarchy node '${hierarchy_node_id}' not found in project '${project_id}'.`,
      });
    }

    // Fetch assignments from junction table
    const userAssignments = await ProjectUserRole.findAll({
      where: {
        project_id,
        hierarchy_node_id,
      },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["user_id", "full_name", "email"],
          include: [
            {
              model: Institute,
              as: "institute",
              attributes: ["institute_id", "name"],
            },
            {
              model: UserType,
              as: "userType",
              attributes: ["user_type_id", "name"],
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
      ],
      order: [["created_at", "DESC"]],
    });

    // Transform and return
    const users = userAssignments.map((assignment) => ({
      project_user_role_id: assignment.project_user_role_id,
      project_id: assignment.project_id,
      user_id: assignment.user_id,
      role_id: assignment.role_id,
      sub_role_id: assignment.sub_role_id,
      hierarchy_node_id: assignment.hierarchy_node_id,

      user: assignment.user,
      role: assignment.role,
      sub_role: assignment.subRole,
      hierarchyNode: assignment.hierarchyNode,

      is_active: assignment.is_active,
      assigned_at: assignment.created_at,
    }));

    return res.status(200).json({
      success: true,
      message: "Users assigned to hierarchy node fetched successfully.",
      project_id,
      hierarchy_node_id,
      count: users.length,
      data: users,
    });
  } catch (error) {
    console.error("Error fetching users assigned to node:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
// const getInternalUsersAssignedToNode = async (req, res) => {
//   try {
//     const { project_id, internal_node_id } = req.params;

//     // Validate project
//     const project = await Project.findByPk(project_id);
//     if (!project) {
//       return res.status(404).json({
//         success: false,
//         message: `Project with id '${project_id}' not found.`,
//       });
//     }

//     // Validate hierarchy node
//     const internalNode = await InternalNode.findOne({
//       where: { internal_node_id },
//     });

//     if (!internalNode) {
//       return res.status(404).json({
//         success: false,
//         message: `Internal node '${internal_node_id}' not found in project '${project_id}'.`,
//       });
//     }

//     // Fetch assignments from junction table
//     const userAssignments = await InternalProjectUserRole.findAll({
//       where: {
//         project_id,
//         internal_node_id,
//       },
//       include: [
//         {
//           model: User,
//           as: "user",
//           attributes: ["user_id", "full_name", "email"],
//         },
//         {
//           model: Role,
//           as: "role",
//           attributes: ["role_id", "name"],
//         },
//         {
//           model: ProjectMetric,
//           as: "projectMetric",
//           attributes: ["project_metric_id", "name", "description"],
//         },
//         {
//           model: InternalNode,
//           as: "internalNode",
//           attributes: ["internal_node_id", "name"],
//         },
//       ],
//       order: [["created_at", "DESC"]],
//     });

//     // Transform and return
//     const users = userAssignments.map((assignment) => ({
//       project_user_role_id: assignment.project_user_role_id,
//       project_id: assignment.project_id,
//       user_id: assignment.user_id,
//       role_id: assignment.role_id,
//       internal_node_id: assignment.internal_node_id,

//       user: assignment.user,
//       role: assignment.role,
//       internalNode: assignment.internalNode,

//       is_active: assignment.is_active,
//       assigned_at: assignment.created_at,
//     }));

//     return res.status(200).json({
//       success: true,
//       message: "Users assigned to hierarchy node fetched successfully.",
//       project_id,
//       internal_node_id,
//       count: users.length,
//       data: users,
//     });
//   } catch (error) {
//     console.error("Error fetching users assigned to node:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Internal server error",
//       error: error.message,
//     });
//   }
// };

const getInternalUsersAssignedToNode = async (req, res) => {
  try {
    const { project_id, internal_node_id } = req.params;

    // ====== Get search and pagination from query params ======
    const {
      search, // optional: for user name/email search
      page = 1,
      pageSize = 10,
    } = req.query;

    // Validate project
    const project = await Project.findByPk(project_id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: `Project with id '${project_id}' not found.`,
      });
    }

    // Validate hierarchy node
    const internalNode = await InternalNode.findOne({
      where: { internal_node_id },
    });

    if (!internalNode) {
      return res.status(404).json({
        success: false,
        message: `Internal node '${internal_node_id}' not found in project '${project_id}'.`,
      });
    }

    // ====== Calculate pagination ======
    const pageNum = parseInt(page);
    const limit = parseInt(pageSize);
    const offset = (pageNum - 1) * limit;

    // ====== Build where clause for assignments ======
    const assignmentWhereClause = {
      project_id,
      internal_node_id,
    };

    // ====== Build include conditions for search ======
    const includeConditions = [
      {
        model: User,
        as: "user",
        attributes: ["user_id", "full_name", "email"],
        required: false, // Make it LEFT JOIN for search
      },
      {
        model: Role,
        as: "role",
        attributes: ["role_id", "name"],
      },
      {
        model: ProjectMetric,
        as: "projectMetric",
        attributes: ["project_metric_id", "name", "description"],
      },
      {
        model: InternalNode,
        as: "internalNode",
        attributes: ["internal_node_id", "name"],
      },
    ];

    // ====== Add search condition ======
    if (search) {
      // Set user as required for search
      includeConditions[0].required = true;

      // Add search condition to user model
      includeConditions[0].where = {
        [Op.or]: [
          { full_name: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } },
        ],
      };

      // Alternatively, you can search in role name too
      // includeConditions[1].required = true;
      // includeConditions[1].where = {
      //   name: { [Op.like]: `%${search}%` },
      // };
    }

    // ====== Fetch assignments from junction table with pagination ======
    const userAssignments = await InternalProjectUserRole.findAndCountAll({
      where: assignmentWhereClause,
      include: includeConditions,
      order: [["created_at", "DESC"]],
      limit: limit,
      offset: offset,
      distinct: true, // Important for correct count when using includes
    });

    // Transform and return
    const users = userAssignments.rows.map((assignment) => ({
      project_user_role_id: assignment.project_user_role_id,
      project_id: assignment.project_id,
      user_id: assignment.user_id,
      role_id: assignment.role_id,
      internal_node_id: assignment.internal_node_id,

      user: assignment.user,
      role: assignment.role,
      internalNode: assignment.internalNode,

      is_active: assignment.is_active,
      assigned_at: assignment.created_at,
    }));

    // ====== Calculate pagination metadata ======
    const totalPages = Math.ceil(userAssignments.count / limit);

    return res.status(200).json({
      success: true,
      message: "Users assigned to hierarchy node fetched successfully.",
      project_id,
      internal_node_id,
      search_query: search || null,
      count: users.length,
      total_count: userAssignments.count,
      data: users,
      meta: {
        page: pageNum,
        pageSize: limit,
        total: userAssignments.count,
        totalPages: totalPages,
      },
    });
  } catch (error) {
    console.error("Error fetching users assigned to node:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const getUsersAssignedToProject = async (req, res) => {
  try {
    const { project_id } = req.params;

    if (!project_id) {
      return res.status(400).json({
        success: false,
        message: "Project ID is required.",
      });
    }

    const assignments = await ProjectUserRole.findAll({
      where: { project_id },
      include: [
        {
          model: User,
          as: "user",
          include: [
            {
              model: Institute,
              as: "institute",
              attributes: ["institute_id", "name"],
            },
            {
              model: UserType,
              as: "userType",
              attributes: ["user_type_id", "name"],
            },
          ],
        },
        {
          model: Role,
          as: "role",
          attributes: ["role_id", "name"],
        },
        {
          model: HierarchyNode,
          as: "hierarchyNode",
          attributes: ["hierarchy_node_id", "name", "level", "parent_id"],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      message: "Users assigned to project fetched successfully.",
      count: assignments.length,
      data: assignments,
    });
  } catch (error) {
    console.error("Error fetching assigned users:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch assigned users.",
      error: error.message,
    });
  }
};

// const getInternalUsersAssignedToProject = async (req, res) => {
//   try {
//     const { project_id } = req.params;

//     if (!project_id) {
//       return res.status(400).json({
//         success: false,
//         message: "Project ID is required.",
//       });
//     }

//     const assignments = await InternalProjectUserRole.findAll({
//       where: { project_id },
//       include: [
//         {
//           model: User,
//           as: "user",
//           include: [
//             {
//               model: UserType,
//               as: "userType",
//               attributes: ["user_type_id", "name"],
//             },
//           ],
//         },
//         {
//           model: Role,
//           as: "role",
//           attributes: ["role_id", "name"],
//         },
//         {
//           model: InternalNode,
//           as: "internalNode",
//           attributes: ["internal_node_id", "name", "level", "parent_id"],
//         },
//         {
//           model: ProjectMetric,
//           as: "projectMetric",
//         },
//       ],
//       order: [["created_at", "DESC"]],
//     });

//     return res.status(200).json({
//       success: true,
//       message: "Users assigned to project fetched successfully.",
//       count: assignments.length,
//       data: assignments,
//     });
//   } catch (error) {
//     console.error("Error fetching assigned users:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to fetch assigned users.",
//       error: error.message,
//     });
//   }
// };

const getInternalUsersAssignedToProject = async (req, res) => {
  try {
    const { project_id } = req.params;

    // ====== Get search and pagination from query params ======
    const {
      search, // optional: for user name/email search
      page = 1,
      pageSize = 10,
    } = req.query;

    if (!project_id) {
      return res.status(400).json({
        success: false,
        message: "Project ID is required.",
      });
    }

    // Validate project exists
    const project = await Project.findByPk(project_id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: `Project with id '${project_id}' not found.`,
      });
    }

    // ====== Calculate pagination ======
    const pageNum = parseInt(page);
    const limit = parseInt(pageSize);
    const offset = (pageNum - 1) * limit;

    // ====== Build where clause for assignments ======
    const assignmentWhereClause = {
      project_id,
    };

    // ====== Build include conditions ======
    const includeConditions = [
      {
        model: User,
        as: "user",
        include: [
          {
            model: UserType,
            as: "userType",
            attributes: ["user_type_id", "name"],
          },
        ],
        required: false, // Make it LEFT JOIN for search
      },
      {
        model: Role,
        as: "role",
        attributes: ["role_id", "name"],
      },
      {
        model: InternalNode,
        as: "internalNode",
        attributes: ["internal_node_id", "name", "level", "parent_id"],
      },
      {
        model: ProjectMetric,
        as: "projectMetric",
      },
    ];

    // ====== Add search condition ======
    if (search) {
      // Set user as required for search
      includeConditions[0].required = true;

      // Add search condition to user model
      includeConditions[0].where = {
        [Op.or]: [
          { full_name: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } },
        ],
      };

      // Optional: Also search in role name
      // includeConditions[1].required = true;
      // includeConditions[1].where = {
      //   name: { [Op.like]: `%${search}%` }
      // };

      // Optional: Also search in internal node name
      // includeConditions[2].required = true;
      // includeConditions[2].where = {
      //   name: { [Op.like]: `%${search}%` }
      // };
    }

    // ====== Fetch assignments with pagination ======
    const assignments = await InternalProjectUserRole.findAndCountAll({
      where: assignmentWhereClause,
      include: includeConditions,
      order: [["created_at", "DESC"]],
      limit: limit,
      offset: offset,
      distinct: true, // Important for correct count when using includes
    });

    // ====== Transform data if needed ======
    const transformedAssignments = assignments.rows.map((assignment) => ({
      project_user_role_id: assignment.project_user_role_id,
      project_id: assignment.project_id,
      user_id: assignment.user_id,
      role_id: assignment.role_id,
      internal_node_id: assignment.internal_node_id,
      project_metric_id: assignment.project_metric_id,

      user: assignment.user,
      role: assignment.role,
      internalNode: assignment.internalNode,
      projectMetric: assignment.projectMetric,

      is_active: assignment.is_active,
      created_at: assignment.created_at,
      updated_at: assignment.updated_at,
    }));

    // ====== Calculate pagination metadata ======
    const totalPages = Math.ceil(assignments.count / limit);

    return res.status(200).json({
      success: true,
      message: "Users assigned to project fetched successfully.",
      project_id,
      search_query: search || null,
      count: transformedAssignments.length,
      total_count: assignments.count,
      data: transformedAssignments,
      meta: {
        page: pageNum,
        pageSize: limit,
        total: assignments.count,
        totalPages: totalPages,
      },
    });
  } catch (error) {
    console.error("Error fetching assigned users:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch assigned users.",
      error: error.message,
    });
  }
};

const getUsersNotAssignedToProject = async (req, res) => {
  // console.log("not external one assigned called");
  try {
    const { institute_id, project_id } = req.params;

    if (!institute_id) {
      return res.status(400).json({
        success: false,
        message: "Institute ID is required",
      });
    }

    if (!project_id) {
      return res.status(400).json({
        success: false,
        message: "Project ID is required.",
      });
    }

    // 1. Get all assigned users for the project
    const assignments = await ProjectUserRole.findAll({
      where: { project_id },
      attributes: ["user_id"], // we only need user_id
    });

    const assignedUserIds = assignments.map((a) => a.user_id);
    console.log("assignedUserIds: ", assignedUserIds);

    const whereClause = {
      institute_id,
    };

    if (assignedUserIds.length > 0) {
      whereClause.user_id = { [Op.notIn]: assignedUserIds };
    }
    // 2. Get all users from institute except assigned ones
    const users = await User.findAll({
      where: whereClause,
      include: [
        {
          model: Institute,
          as: "institute",
          attributes: ["institute_id", "name"],
        },
        {
          model: UserType,
          as: "userType",
          attributes: ["user_type_id", "name"],
        },
        {
          model: HierarchyNode,
          as: "hierarchyNode",
          attributes: ["hierarchy_node_id", "name"],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      message: "Unassigned users fetched successfully.",
      data: users,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch users.",
      error: error.message,
    });
  }
};

const getInternalUsersNotAssignedToProject = async (req, res) => {
  console.log("not assigned called");
  try {
    const { project_id } = req.params;

    if (!project_id) {
      return res.status(400).json({
        success: false,
        message: "Project ID is required.",
      });
    }

    // 1. Find already assigned internal users for this project
    const assignments = await InternalProjectUserRole.findAll({
      where: { project_id },
      attributes: ["user_id"],
    });

    const assignedUserIds = assignments.map((a) => a.user_id);

    // console.log("assignedUserIds: ", assignedUserIds);
    // 2. Get users where:
    //    institute_id IS NULL
    //    AND user_id NOT IN assignedUserIds
    const users = await User.findAll({
      where: {
        institute_id: { [Op.is]: null }, // users with NULL institute_id
        user_id: {
          [Op.notIn]: assignedUserIds.length > 0 ? assignedUserIds : [], // avoid SQL error
        },
      },
      include: [
        {
          model: InternalNode,
          as: "internalNode",
          attributes: ["internal_node_id", "name"],
        },
        {
          model: UserType,
          as: "userType",
          attributes: ["user_type_id", "name"],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    console.log("users: ", users);

    return res.status(200).json({
      success: true,
      message: "Unassigned internal users fetched successfully.",
      data: users,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch users.",
      error: error.message,
    });
  }
};

const getProjectSubNodeUsers = async (req, res) => {
  try {
    const { project_id, Internal_node_id } = req.params;

    if (!project_id || !Internal_node_id) {
      return res.status(400).json({
        success: false,
        message: "Project ID and Internal Node ID are required.",
      });
    }

    // 1️⃣ Get direct children of this node
    const children = await InternalNode.findAll({
      where: { parent_id: Internal_node_id },
      attributes: ["internal_node_id"],
    });

    const childNodeIds = children.map((c) => c.internal_node_id);
    // Include the parent node itself
    // childNodeIds.push(Internal_node_id);

    // 2️⃣ Fetch assignments for users under these nodes
    const assignments = await InternalProjectUserRole.findAll({
      where: {
        project_id,
        internal_node_id: { [Op.in]: childNodeIds },
      },
      include: [
        {
          model: User,
          as: "user", // ✅ must match association alias
          attributes: ["user_id", "full_name", "email"],
        },
        {
          model: Role,
          as: "role", // ✅ must match association alias
          attributes: ["role_id", "name"],
        },
        {
          model: InternalNode,
          as: "internalNode", // ✅ must match association alias
          attributes: ["internal_node_id", "name", "level", "parent_id"],
        },
      ],
    });

    return res.status(200).json({
      success: true,
      message: "Users under child nodes fetched successfully.",
      assignments,
      count: assignments.length,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch users.",
      error: error.message,
    });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id: user_id } = req.params;

    console.log("user_id: ", user_id);

    // ====== Find user with relations ======
    const user = await User.findByPk(user_id, {
      include: [
        {
          model: Institute,
          as: "institute",
          attributes: ["institute_id", "name"],
        },
        {
          model: UserType,
          as: "userType",
          attributes: ["user_type_id", "name"],
        },
        {
          model: HierarchyNode,
          as: "hierarchyNode",
          attributes: ["hierarchy_node_id", "name"],
        },
        {
          model: Role,
          as: "roles",
          through: { attributes: [] },
        },
        {
          model: ProjectMetric,
          as: "metrics",
          through: { attributes: ["value"] },
        },
        {
          model: ProjectUserRole,
          as: "projectRoles",
          include: [
            {
              model: Project,
              as: "project",
              attributes: ["project_id", "name", "description"],
            },
            {
              model: HierarchyNode,
              as: "hierarchyNode",
              attributes: ["hierarchy_node_id", "name", "description"],
            },
          ],
        },
        {
          model: InternalProjectUserRole,
          as: "internalProjectUserRoles",
          include: [
            {
              model: Project,
              as: "project",
              attributes: ["project_id", "name", "description"],
            },
            {
              model: ProjectMetric,
              as: "projectMetric",
              attributes: ["project_metric_id", "name", "description"],
            },
            {
              model: InternalNode,
              as: "internalNode",
              attributes: ["internal_node_id", "name", "description"],
            },
          ],
        },
      ],
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User fetched successfully.",
      data: user,
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch user.",
      error: error.message,
    });
  }
};

const deleteUser = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;

    if (!isUuid(id)) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format.",
      });
    }

    const user = await User.findByPk(id, { transaction: t });
    if (!user) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Soft delete (deactivate)
    await user.update(
      { is_active: false, updated_at: new Date() },
      { transaction: t }
    );
    await t.commit();

    return res.status(200).json({
      success: true,
      message: "User deactivated successfully.",
    });
  } catch (error) {
    await t.rollback();
    return res.status(500).json({
      success: false,
      message: "Error deactivating user",
      error: error.message,
    });
  }
};
const toggleUserActiveStatus = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { is_active } = req.body; // expect boolean true/false

    if (!isUuid(id)) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format.",
      });
    }

    if (typeof is_active !== "boolean") {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: "is_active must be a boolean value.",
      });
    }

    const user = await User.findByPk(id, { transaction: t });
    if (!user) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    await user.update(
      { is_active, updated_at: new Date() },
      { transaction: t }
    );
    await t.commit();

    return res.status(200).json({
      success: true,
      message: `User ${is_active ? "activated" : "deactivated"} successfully.`,
      data: { user_id: id, is_active },
    });
  } catch (error) {
    await t.rollback();
    return res.status(500).json({
      success: false,
      message: "Error toggling user status",
      error: error.message,
    });
  }
};

const resetUserPassword = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.user.user_id;
    const user = await User.findByPk(id, { transaction: t });
    if (!user) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Generate and hash new password
    const newPassword = generateRandomPassword();
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await user.update(
      {
        password: hashedPassword,
        is_first_logged_in: true,
        updated_at: new Date(),
      },
      { transaction: t }
    );

    await t.commit();

    // Send email notification
    await sendEmail(
      user.email,
      `Password Reset - ${process.env.APP_NAME}`,
      `
      Dear ${user.full_name},
      Your password has been reset successfully.
      Email: ${user.email}
      New Temporary Password: ${newPassword}
      Please change your password after logging in.
      `
    );

    return res.status(200).json({
      success: true,
      message:
        "Password reset successfully. The new password has been sent via email.",
    });
  } catch (error) {
    await t.rollback();
    return res.status(500).json({
      success: false,
      message: "Error resetting user password",
      error: error.message,
    });
  }
};

const getProfile = async (req, res) => {
  try {
    const userId = req.user.user_id;

    const user = await User.findOne({
      where: { user_id: userId },
      attributes: [
        "user_id",
        "full_name",
        "email",
        "phone_number",
        "position",
        "profile_image",
        "is_first_logged_in",
        "last_login_at",
        "password_changed_at",
        "is_active",
        "created_at",
        "updated_at",
      ],
      include: [
        {
          model: UserType,
          as: "userType",
          attributes: ["user_type_id", "name", "description"],
        },
        {
          model: Institute,
          as: "institute",
          attributes: ["institute_id", "name", "description", "is_active"],
        },
        {
          model: ProjectUserRole,
          as: "projectRoles",
          attributes: [
            "project_user_role_id",
            "project_id",
            "role_id",
            "sub_role_id",
          ],
          include: [
            {
              model: Role,
              as: "role",
              attributes: ["role_id", "name", "description"],
              include: [
                {
                  model: RoleSubRole,
                  as: "roleSubRoles",
                  attributes: ["roles_sub_roles_id", "sub_role_id"],
                  include: [
                    {
                      model: SubRole,
                      as: "subRole",
                      attributes: ["sub_role_id", "name", "description"],
                    },
                    {
                      model: RoleSubRolePermission,
                      as: "permissions",
                      attributes: [
                        "role_sub_roles_permission_id",
                        "permission_id",
                      ],
                      include: [
                        {
                          model: Permission,
                          as: "permission",
                          attributes: ["permission_id", "resource", "action"],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              model: SubRole,
              as: "subRole",
              attributes: ["sub_role_id", "name", "description"],
            },
          ],
        },
      ],
    });

    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    return res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

module.exports = {
  createUser,
  getUsers,
  getUsersByInstituteId,
  getUsersAssignedToNode,
  getInternalUsersAssignedToNode,
  getUsersAssignedToProject,
  getInternalUsersAssignedToProject,
  getUsersNotAssignedToProject,
  getInternalUsersNotAssignedToProject,
  getProjectSubNodeUsers,
  getUserById,
  updateUser,
  deleteUser,
  toggleUserActiveStatus,
  resetUserPassword,
  getProfile,
  getUserTypes,
  getUserPositions,
};
