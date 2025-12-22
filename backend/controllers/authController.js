const {
  User,
  UserType,
  Institute,
  ProjectUserRole,
  Project,
  HierarchyNode,
  InstituteProject,
  Role,
  SubRole,
  RoleSubRole,
  RoleSubRolePermission,
  InternalProjectUserRole,
  InternalNode,
  Permission,
  UserPosition,
  ProjectMetric,
  ProjectMetricUser,
  UserRoles,
} = require("../models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({
      where: { email },
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
          model: UserPosition,
          as: "userPosition",
          attributes: ["user_position_id", "name"],
        },
        {
          model: HierarchyNode,
          as: "hierarchyNode",
          attributes: [
            "hierarchy_node_id",
            "name",
            "level",
            "parent_id",
            "description",
          ],
        },
        {
          model: InternalNode,
          as: "internalNode",
          attributes: ["internal_node_id", "name", "level", "parent_id"],
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
              attributes: ["hierarchy_node_id", "name", "level", "parent_id"],
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
              model: Role,
              as: "role",
              attributes: ["role_id", "name"],
            },
            {
              model: InternalNode,
              as: "internalNode",
              attributes: ["internal_node_id", "name", "level", "parent_id"],
            },
          ],
        },
      ],
    });

    if (!user)
      return res.status(401).json({ message: "Invalid email or password" });
    if (!user.is_active)
      return res.status(403).json({ message: "User is inactive" });

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid email or password" });

    // Format user data for token
    const userDataForToken = {
      user_id: user.user_id,
      email: user.email,
      full_name: user.full_name,
      user_type: user.userType ? user.userType.name : null,
      institute: user.institute
        ? {
            institute_id: user.institute.institute_id,
            name: user.institute.name,
          }
        : null,
      user_position: user.userPosition
        ? {
            user_position_id: user.userPosition.user_position_id,
            name: user.userPosition.name,
          }
        : null,
      hierarchy_node: user.hierarchyNode
        ? {
            hierarchy_node_id: user.hierarchyNode.hierarchy_node_id,
            name: user.hierarchyNode.name,
            level: user.hierarchyNode.level,
          }
        : null,
      internal_node: user.internalNode
        ? {
            internal_node_id: user.internalNode.internal_node_id,
            name: user.internalNode.name,
            level: user.internalNode.level,
          }
        : null,
      // Include global roles and permissions
      roles: user.roles
        ? user.roles.map((role) => ({
            role_id: role.role_id,
            name: role.name,
          }))
        : [],
      // Include metrics
      metrics: user.metrics
        ? user.metrics.map((metric) => ({
            project_metric_id: metric.project_metric_id,
            name: metric.name,
            description: metric.description,
            value: metric.ProjectMetricUser.value,
          }))
        : [],
    };

    // Generate JWT with comprehensive user data
    const token = jwt.sign(userDataForToken, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRATION_TIME || "12h",
    });

    // Update last login
    await User.update(
      { last_login_at: new Date() },
      { where: { user_id: user.user_id } }
    );

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        ...userDataForToken,
        phone_number: user.phone_number,
        profile_image: user.profile_image,
        is_first_logged_in: user.is_first_logged_in,
        // Include project-specific roles
        project_roles: user.projectRoles?.map((pr) => ({
          project_user_role_id: pr.project_user_role_id,
          project: pr.project
            ? {
                project_id: pr.project.project_id,
                name: pr.project.name,
                description: pr.project.description,
              }
            : null,
          role: pr.role ? pr.role.name : null,
          role_id: pr.role ? pr.role.role_id : null,
          sub_role_id: pr.subRole ? pr.subRole.sub_role_id : null,
          hierarchy_node: pr.hierarchyNode
            ? {
                hierarchy_node_id: pr.hierarchyNode.hierarchy_node_id,
                name: pr.hierarchyNode.name,
                level: pr.hierarchyNode.level,
              }
            : null,
        })),
        // Include internal project roles
        internal_project_roles: user.internalProjectUserRoles?.map((ipr) => ({
          internal_project_user_role_id: ipr.internal_project_user_role_id,
          project: ipr.project
            ? {
                project_id: ipr.project.project_id,
                name: ipr.project.name,
                description: ipr.project.description,
              }
            : null,
          role: ipr.role ? ipr.role.name : null,
          role_id: ipr.role ? ipr.role.role_id : null,
          internal_node: ipr.internalNode
            ? {
                internal_node_id: ipr.internalNode.internal_node_id,
                name: ipr.internalNode.name,
                level: ipr.internalNode.level,
              }
            : null,
          is_active: ipr.is_active,
        })),
      },
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Logout (token invalidation example using a blacklist)
const logout = async (req, res) => {
  try {
    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

const getCurrentUser = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: "Unauthorized" });

    const token = authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findOne({
      where: { user_id: decoded.user_id },
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
          model: UserPosition,
          as: "userPosition",
          attributes: ["user_position_id", "name"],
        },
        {
          model: HierarchyNode,
          as: "hierarchyNode",
          attributes: [
            "hierarchy_node_id",
            "name",
            "level",
            "parent_id",
            "description",
          ],
        },
        {
          model: InternalNode,
          as: "internalNode",
          attributes: ["internal_node_id", "name", "level", "parent_id"],
        },
        {
          model: Role,
          as: "roles",
        },
        {
          model: ProjectMetric,
          as: "metrics",
          through: { attributes: ["value"] },
        },
        // Project roles
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
              model: Role,
              as: "role",
              attributes: ["role_id", "name"],
            },
            {
              model: HierarchyNode,
              as: "hierarchyNode",
              attributes: ["hierarchy_node_id", "name", "level", "parent_id"],
            },
            {
              model: InstituteProject,
              as: "instituteProject",
              attributes: ["institute_project_id", "institute_id"],
            },
          ],
        },
        // Internal project roles
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
              model: Role,
              as: "role",
              attributes: ["role_id", "name"],
            },
            {
              model: InternalNode,
              as: "internalNode",
              attributes: ["internal_node_id", "name", "level", "parent_id"],
            },
          ],
        },
      ],
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    return res.status(200).json({
      user: {
        user_id: user.user_id,
        full_name: user.full_name,
        email: user.email,
        phone_number: user.phone_number,
        position: user.position,
        profile_image: user.profile_image,
        is_first_logged_in: user.is_first_logged_in,

        user_type: user.userType ? user.userType.name : null,

        institute: user.institute
          ? {
              institute_id: user.institute.institute_id,
              name: user.institute.name,
            }
          : null,

        user_position: user.userPosition
          ? {
              user_position_id: user.userPosition.user_position_id,
              name: user.userPosition.name,
            }
          : null,

        hierarchy_node: user.hierarchyNode
          ? {
              hierarchy_node_id: user.hierarchyNode.hierarchy_node_id,
              name: user.hierarchyNode.name,
              level: user.hierarchyNode.level,
              parent_id: user.hierarchyNode.parent_id,
              description: user.hierarchyNode.description,
            }
          : null,

        internal_node: user.internalNode
          ? {
              internal_node_id: user.internalNode.internal_node_id,
              name: user.internalNode.name,
              level: user.internalNode.level,
              parent_id: user.internalNode.parent_id,
            }
          : null,

        // Global roles with permissions
        roles: user.roles
          ? user.roles.map((role) => ({
              role_id: role.role_id,
              name: role.name,
            }))
          : [],

        // User metrics
        metrics: user.metrics
          ? user.metrics.map((metric) => ({
              project_metric_id: metric.project_metric_id,
              name: metric.name,
              description: metric.description,
              weight: metric.weight,
              value: metric.ProjectMetricUser.value,
            }))
          : [],

        // Project roles
        project_roles: user.projectRoles?.map((pr) => ({
          project_user_role_id: pr.project_user_role_id,
          project: pr.project
            ? {
                project_id: pr.project.project_id,
                name: pr.project.name,
                description: pr.project.description,
              }
            : null,
          role: pr.role ? pr.role.name : null,
          role_id: pr.role ? pr.role.role_id : null,
          sub_role: pr.subRole ? pr.subRole.name : null,
          sub_role_id: pr.subRole ? pr.subRole.sub_role_id : null,
          hierarchy_node: pr.hierarchyNode
            ? {
                hierarchy_node_id: pr.hierarchyNode.hierarchy_node_id,
                name: pr.hierarchyNode.name,
                level: pr.hierarchyNode.level,
                parent_id: pr.hierarchyNode.parent_id,
              }
            : null,
          institute_project: pr.instituteProject
            ? {
                institute_project_id: pr.instituteProject.institute_project_id,
                institute_id: pr.instituteProject.institute_id,
              }
            : null,
        })),

        // Internal project roles
        internal_project_roles: user.internalProjectUserRoles?.map((ipr) => ({
          internal_project_user_role_id: ipr.internal_project_user_role_id,
          project: ipr.project
            ? {
                project_id: ipr.project.project_id,
                name: ipr.project.name,
                description: ipr.project.description,
              }
            : null,
          role: ipr.role ? ipr.role.name : null,
          role_id: ipr.role ? ipr.role.role_id : null,
          internal_node: ipr.internalNode
            ? {
                internal_node_id: ipr.internalNode.internal_node_id,
                name: ipr.internalNode.name,
                level: ipr.internalNode.level,
                parent_id: ipr.internalNode.parent_id,
              }
            : null,
          is_active: ipr.is_active,
          created_at: ipr.created_at,
          updated_at: ipr.updated_at,
        })),
      },
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

module.exports = { login, logout, getCurrentUser };
