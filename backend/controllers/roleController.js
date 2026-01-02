// controllers/roleController.js
const {
  Role,
  SubRole,
  RoleSubRole,
  RoleSubRolePermission,
  Permission,
  ProjectUserRole,
  RolePermission,
} = require("../models");
const { v4: uuidv4 } = require("uuid");
const { Op } = require("sequelize");
const { Sequelize } = require("sequelize");

const createRole = async (req, res) => {
  const t = await Role.sequelize.transaction();
  try {
    const { name, description, sub_roles, role_type, permission_ids } =
      req.body;

    // ====== Validate role_type ======
    const allowedRoleTypes = ["internal", "external"];
    let finalRoleType = "internal"; // default
    if (role_type) {
      if (!allowedRoleTypes.includes(role_type)) {
        await t.rollback();
        return res.status(400).json({
          success: false,
          message: "Invalid role_type. Allowed values: internal, external",
        });
      }
      finalRoleType = role_type;
    }
    // ====== Check if role exists ======
    const existing = await Role.findOne({ where: { name }, transaction: t });
    if (existing) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: "Role name already exists",
      });
    }

    // ====== Create Role ======
    const role = await Role.create(
      {
        role_id: uuidv4(),
        name,
        description,
        role_type: finalRoleType,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      { transaction: t }
    );

    // ====== Handle sub-roles if provided ======
    if (Array.isArray(sub_roles) && sub_roles.length > 0) {
      for (const sr of sub_roles) {
        let subRole;

        // Existing sub-role
        if (sr.sub_role_id) {
          subRole = await SubRole.findOne({
            where: { sub_role_id: sr.sub_role_id, is_active: true },
            transaction: t,
          });

          if (!subRole) {
            await t.rollback();
            return res.status(400).json({
              success: false,
              message: `Invalid or inactive sub-role ID: ${sr.sub_role_id}`,
            });
          }
        }
        // New sub-role
        else if (sr.name) {
          subRole = await SubRole.create(
            {
              sub_role_id: uuidv4(),
              name: sr.name,
              description: sr.description || null,
              is_active: true,
              created_at: new Date(),
              updated_at: new Date(),
            },
            { transaction: t }
          );
        } else {
          await t.rollback();
          return res.status(400).json({
            success: false,
            message: "Either sub_role_id or name must be provided for sub-role",
          });
        }

        // Link sub-role to role
        const roleSubRole = await RoleSubRole.create(
          {
            roles_sub_roles_id: uuidv4(),
            role_id: role.role_id,
            sub_role_id: subRole.sub_role_id,
            is_active: true,
            created_at: new Date(),
            updated_at: new Date(),
          },
          { transaction: t }
        );

        // Attach permissions to this sub-role
        if (sr.permission_ids && sr.permission_ids.length > 0) {
          let permissionIds = sr.permission_ids;
          if (typeof permissionIds === "string") {
            try {
              permissionIds = JSON.parse(permissionIds);
            } catch {
              permissionIds = permissionIds.split(",").map((i) => i.trim());
            }
          }

          const validPermissions = await Permission.findAll({
            where: { permission_id: permissionIds, is_active: true },
            transaction: t,
          });

          if (validPermissions.length !== permissionIds.length) {
            await t.rollback();
            return res.status(400).json({
              success: false,
              message: "Some permissions are invalid for sub-role",
            });
          }

          const roleSubRolePerms = permissionIds.map((pid) => ({
            role_sub_roles_permission_id: uuidv4(),
            roles_sub_roles_id: roleSubRole.roles_sub_roles_id,
            permission_id: pid,
            assigned_by: "49f1a85c-17c9-401b-9cce-3185cc2ccc4e",
            assigned_at: new Date(),
            created_at: new Date(),
            updated_at: new Date(),
          }));

          await RoleSubRolePermission.bulkCreate(roleSubRolePerms, {
            transaction: t,
          });
        }
      }
    }
    // ====== Assign permissions directly to role if no sub-roles ======
    else if (permission_ids && permission_ids.length > 0) {
      let permissionIds = permission_ids;
      if (typeof permissionIds === "string") {
        try {
          permissionIds = JSON.parse(permissionIds);
        } catch {
          permissionIds = permissionIds.split(",").map((i) => i.trim());
        }
      }

      const validPermissions = await Permission.findAll({
        where: { permission_id: permissionIds, is_active: true },
        transaction: t,
      });

      if (validPermissions.length !== permissionIds.length) {
        await t.rollback();
        return res.status(400).json({
          success: false,
          message: "Some permissions are invalid for role",
        });
      }

      const rolePermissions = permissionIds.map((pid) => ({
        role_permission_id: uuidv4(),
        role_id: role.role_id,
        permission_id: pid,
        assigned_by: "8993455e-312b-433f-b8d7-15491875d38a",
        assigned_at: new Date(),
        created_at: new Date(),
        updated_at: new Date(),
      }));

      await RolePermission.bulkCreate(rolePermissions, { transaction: t });
    }

    await t.commit();

    // ====== Fetch role with sub-roles and permissions ======
    const createdRole = await Role.findOne({
      where: { role_id: role.role_id },
      include: [
        {
          model: RoleSubRole,
          as: "roleSubRoles",
          include: [
            { model: SubRole, as: "subRole" },
            {
              model: RoleSubRolePermission,
              as: "permissions",
              include: [{ model: Permission, as: "permission" }],
            },
          ],
        },
        {
          model: RolePermission,
          as: "rolePermissions",
          include: [{ model: Permission, as: "permission" }],
        },
      ],
    });

    return res.status(201).json({
      success: true,
      message:
        "Role created successfully (with sub-roles or direct permissions)",
      data: createdRole,
    });
  } catch (error) {
    if (!t.finished) await t.rollback();
    console.error("Error creating role:", error);
    return res.status(500).json({
      success: false,
      message: "Error creating role",
      error: error.message,
    });
  }
};

// Get all roles with sub-roles and permissions
const getRoles = async (req, res) => {
  try {
    const {
      role_type,
      is_active,
      search, // optional: for name/email search
      page = 1,
      pageSize = 10,
    } = req.query; // expecting query params

    // Build dynamic where clause
    const whereClause = {};
    if (role_type) whereClause.role_type = role_type;
    if (is_active !== undefined) whereClause.is_active = is_active === "true";

    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
        // { role_type: { [Op.like]: `%${search}%` } },
      ];
    }

    // ====== Calculate pagination ======
    const pageNum = parseInt(page);
    const limit = parseInt(pageSize);
    const offset = (pageNum - 1) * limit;

    // ====== Fetch total count ======
    const total = await Role.count({ where: whereClause });

    const roles = await Role.findAll({
      where: whereClause,
      include: [
        {
          model: RoleSubRole,
          as: "roleSubRoles",
          where: { is_active: true },
          required: false,
          include: [
            {
              model: SubRole,
              as: "subRole",
              attributes: ["sub_role_id", "name", "description"],
            },
            {
              model: RoleSubRolePermission,
              as: "permissions",
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
      order: [["created_at", "DESC"]],
      limit: limit,
      offset: offset,
    });

    const totalPages = Math.ceil(total / limit);

    return res.status(200).json({
      success: true,
      message: "Roles fetched successfully.",
      data: roles,
      meta: {
        page: pageNum,
        pageSize: limit,
        total: total,
        totalPages: totalPages,
      },
    });
  } catch (error) {
    console.error("Error fetching roles:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get role by ID
const getRoleById = async (req, res) => {
  try {
    const { id } = req.params;

    const role = await Role.findOne({
      where: {
        role_id: id,
        is_active: true,
      },
      include: [
        {
          model: RoleSubRole,
          as: "roleSubRoles",
          where: { is_active: true },
          required: false,
          include: [
            {
              model: SubRole,
              as: "subRole",
              attributes: ["sub_role_id", "name", "description"],
            },
            {
              model: RoleSubRolePermission,
              as: "permissions",
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
        {
          model: RolePermission,
          as: "rolePermissions",
          required: false,
          include: [
            {
              model: Permission,
              as: "permission",
              attributes: ["permission_id", "resource", "action"],
            },
          ],
        },
      ],
    });

    if (!role) {
      return res.status(404).json({
        success: false,
        message: "Role not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: role,
    });
  } catch (error) {
    console.error("Error fetching role:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const updateRole = async (req, res) => {
  const t = await Role.sequelize.transaction();
  try {
    const { id } = req.params;
    const { name, description, sub_roles, permission_ids, role_type } =
      req.body;

    // Find the role
    const role = await Role.findOne({
      where: { role_id: id, is_active: true },
      transaction: t,
    });

    if (!role) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: "Role not found",
      });
    }

    // Check for duplicate name
    if (name && name !== role.name) {
      const existingRole = await Role.findOne({
        where: { name },
        transaction: t,
      });

      if (existingRole) {
        await t.rollback();
        return res.status(400).json({
          success: false,
          message: "Role name already exists",
        });
      }
    }

    //Update role info
    const allowedRoleTypes = ["internal", "external"];
    let roleTypeToUpdate = role.role_type; // default keep old

    if (req.body.role_type) {
      if (!allowedRoleTypes.includes(req.body.role_type)) {
        await t.rollback();
        return res.status(400).json({
          success: false,
          message: "Invalid role_type. Allowed values: internal, external",
        });
      }
      roleTypeToUpdate = req.body.role_type;
    }
    await role.update(
      {
        name: name || role.name,
        description: description || role.description,
        role_type: roleTypeToUpdate,
        updated_at: new Date(),
      },
      { transaction: t }
    );

    // CASE 1: If sub_roles are provided, handle as before
    // ==========================================================
    if (Array.isArray(sub_roles) && sub_roles.length > 0) {
      await RoleSubRole.update(
        { is_active: false, deleted_at: new Date(), updated_at: new Date() },
        { where: { role_id: id }, transaction: t }
      );

      // Recreate role-subrole + permissions
      for (const sr of sub_roles) {
        const subRole = await SubRole.findOne({
          where: { sub_role_id: sr.sub_role_id, is_active: true },
          transaction: t,
        });

        if (!subRole) {
          await t.rollback();
          return res.status(400).json({
            success: false,
            message: `Invalid or inactive sub-role ID: ${sr.sub_role_id}`,
          });
        }

        // Create new RoleSubRole
        const roleSubRole = await RoleSubRole.create(
          {
            roles_sub_roles_id: uuidv4(),
            role_id: id,
            sub_role_id: sr.sub_role_id,
            is_active: true,
            created_at: new Date(),
            updated_at: new Date(),
          },
          { transaction: t }
        );

        // Assign permissions to sub-role (if any)
        if (sr.permission_ids?.length > 0) {
          const validPerms = await Permission.findAll({
            where: { permission_id: sr.permission_ids },
            transaction: t,
          });

          if (validPerms.length !== sr.permission_ids.length) {
            await t.rollback();
            return res.status(400).json({
              success: false,
              message: "Some permissions are invalid",
            });
          }

          const roleSubRolePerms = sr.permission_ids.map((pid) => ({
            role_sub_roles_permission_id: uuidv4(),
            roles_sub_roles_id: roleSubRole.roles_sub_roles_id,
            permission_id: pid,
            assigned_by: req.user?.user_id || null,
            assigned_at: new Date(),
            created_at: new Date(),
            updated_at: new Date(),
          }));

          await RoleSubRolePermission.bulkCreate(roleSubRolePerms, {
            transaction: t,
          });
        }
      }

      //  When role has sub_roles, remove direct permissions if any
      await RolePermission.destroy({ where: { role_id: id }, transaction: t });
    }

    // CASE 2: If NO sub_roles, allow assigning direct permissions
    // ==========================================================
    else if (Array.isArray(permission_ids) && permission_ids.length > 0) {
      // Soft delete old direct role permissions
      await RolePermission.update(
        { is_active: false, updated_at: new Date() },
        { where: { role_id: id }, transaction: t }
      );

      // Validate permissions
      const validPerms = await Permission.findAll({
        where: { permission_id: permission_ids },
        transaction: t,
      });

      if (validPerms.length !== permission_ids.length) {
        await t.rollback();
        return res.status(400).json({
          success: false,
          message: "Some permissions are invalid",
        });
      }

      // Assign new permissions directly to the role
      const rolePerms = permission_ids.map((pid) => ({
        role_permission_id: uuidv4(),
        role_id: id,
        permission_id: pid,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      }));

      await RolePermission.bulkCreate(rolePerms, { transaction: t });
    }

    await t.commit();

    //  Fetch updated role details
    const updatedRole = await Role.findOne({
      where: { role_id: id },
      include: [
        {
          model: RoleSubRole,
          as: "roleSubRoles",
          where: { is_active: true },
          required: false,
          include: [
            { model: SubRole, as: "subRole" },
            {
              model: RoleSubRolePermission,
              as: "permissions",
              include: [{ model: Permission, as: "permission" }],
            },
          ],
        },
        {
          model: RolePermission,
          as: "rolePermissions",
          where: { is_active: true },
          required: false,
          include: [{ model: Permission, as: "permission" }],
        },
      ],
    });

    return res.status(200).json({
      success: true,
      message: "Role updated successfully",
      data: updatedRole,
    });
  } catch (error) {
    if (!t.finished) await t.rollback();
    console.error("Error updating role:", error);
    return res.status(500).json({
      success: false,
      message: "Error updating role",
      error: error.message,
    });
  }
};

// Delete Role (Soft Delete)
const deleteRole = async (req, res) => {
  const t = await Role.sequelize.transaction();
  try {
    const { id } = req.params;

    // Find the role
    const role = await Role.findOne({
      where: {
        role_id: id,
        is_active: true,
      },
      transaction: t,
    });

    if (!role) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: "Role not found",
      });
    }

    // Check if role is being used in project user roles
    const roleInUse = await ProjectUserRole.findOne({
      where: {
        role_id: id,
        is_active: true,
      },
      transaction: t,
    });

    if (roleInUse) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message:
          "Cannot delete role. It is currently assigned to users in projects.",
      });
    }

    // Soft delete the role
    await role.update(
      {
        is_active: false,
        deleted_at: new Date(),
        updated_at: new Date(),
      },
      { transaction: t }
    );

    // Soft delete related role-subrole associations
    await RoleSubRole.update(
      {
        is_active: false,
        deleted_at: new Date(),
        updated_at: new Date(),
      },
      {
        where: { role_id: id },
        transaction: t,
      }
    );

    await t.commit();

    return res.status(200).json({
      success: true,
      message: "Role deleted successfully",
    });
  } catch (error) {
    if (!t.finished) await t.rollback();
    console.error("Error deleting role:", error);
    return res.status(500).json({
      success: false,
      message: "Error deleting role",
      error: error.message,
    });
  }
};

// Get all sub-roles for a specific role
const getSubRolesByRole = async (req, res) => {
  try {
    const { id } = req.params;

    const role = await Role.findOne({
      where: {
        role_id: id,
        is_active: true,
      },
      include: [
        {
          model: RoleSubRole,
          as: "roleSubRoles",
          where: { is_active: true },
          required: false,
          include: [
            {
              model: SubRole,
              as: "subRole",
              attributes: ["sub_role_id", "name", "description"],
            },
          ],
        },
      ],
    });

    if (!role) {
      return res.status(404).json({
        success: false,
        message: "Role not found",
      });
    }

    const subRoles = role.roleSubRoles.map((rsr) => rsr.subRole);

    return res.status(200).json({
      success: true,
      data: subRoles,
    });
  } catch (error) {
    console.error("Error fetching sub-roles:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get all permissions for a specific role and sub-role combination
const getPermissionsByRoleSubRole = async (req, res) => {
  try {
    const { roleId, subRoleId } = req.params;

    const roleSubRole = await RoleSubRole.findOne({
      where: {
        role_id: roleId,
        sub_role_id: subRoleId,
        is_active: true,
      },
      include: [
        {
          model: RoleSubRolePermission,
          as: "permissions",
          include: [
            {
              model: Permission,
              as: "permission",
              attributes: ["permission_id", "resource", "action"],
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
      ],
    });

    if (!roleSubRole) {
      return res.status(404).json({
        success: false,
        message: "Role-subrole combination not found",
      });
    }

    const permissions = roleSubRole.permissions.map((perm) => perm.permission);

    return res.status(200).json({
      success: true,
      data: {
        role: roleSubRole.role,
        subRole: roleSubRole.subRole,
        permissions: permissions,
      },
    });
  } catch (error) {
    console.error("Error fetching permissions:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

module.exports = {
  createRole,
  getRoles,
  getRoleById,
  updateRole,
  deleteRole,
  getSubRolesByRole,
  getPermissionsByRoleSubRole,
};
