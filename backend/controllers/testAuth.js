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

    // Generate JWT
    const token = jwt.sign(
      {
        user_id: user.user_id,
        email: user.email,
        user_type: user.userType ? user.userType.name : null,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRATION_TIME || "12h" }
    );

    // Fetch active roles, subroles, and permissions
    const projectRoles = await ProjectUserRole.findAll({
      where: { user_id: user.user_id, is_active: true },
      include: [
        {
          model: Role,
          as: "role",
          where: { is_active: true },
        },
      ],
    });

    // Format roles & permissions
    const roles = projectRoles.map((pr) => ({
      project_user_role_id: pr.project_user_role_id,
      role: pr.role
        ? {
            role_id: pr.role.role_id,
            name: pr.role.name,
            subRoles: pr.role.roleSubRoles.map((rs) => ({
              subRole: rs.subRole,
              permissions: rs.permissions.map((p) => p.permission),
            })),
          }
        : null,
      subRole: pr.subRole,
    }));

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        user_id: user.user_id,
        full_name: user.full_name,
        email: user.email,
        phone_number: user.phone_number,
        position: user.position,
        profile_image: user.profile_image,
        user_type: user.userType ? user.userType.name : null,
        institute: user.institute
          ? {
              institute_id: user.institute.institute_id,
              name: user.institute.name,
            }
          : null,
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

        // 🟢 Include user project roles
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
              attributes: [
                "hierarchy_node_id",
                "name",
                "level",
                "parent_id",
                "description",
              ],
            },
            {
              model: InstituteProject,
              as: "instituteProject",
              attributes: ["institute_project_id", "institute_id"],
            },
          ],
        },
        // Internal Project Roles
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
              required: false,
            },
            {
              model: InternalNode,
              as: "internalNode",
              attributes: ["internal_node_id", "name", "level", "parent_id"],
              required: false,
            },
          ],
        },
      ],
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    console.log("user is me: ", user);

    return res.status(200).json({
      user: {
        user_id: user.user_id,
        full_name: user.full_name,
        email: user.email,
        phone_number: user.phone_number,
        position: user.position,
        profile_image: user.profile_image,

        user_type: user.userType ? user.userType.name : null,

        institute: user.institute
          ? {
              institute_id: user.institute.institute_id,
              name: user.institute.name,
            }
          : null,

        // 🟢 Return project roles, formatted nicely for frontend
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
                description: pr.hierarchyNode.description,
              }
            : null,

          institute_project: pr.instituteProject
            ? {
                institute_project_id: pr.instituteProject.institute_project_id,
                institute_id: pr.instituteProject.institute_id,
              }
            : null,

          // Internal node mapping for user
          internal_node: user.internalNode
            ? {
                internal_node_id: user.internalNode.internal_node_id,
                name: user.internalNode.name,
                level: user.internalNode.level,
                parent_id: user.internalNode.parent_id,
              }
            : null,
        })),
        // 🟢 ADD THIS: Return internal project roles
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
