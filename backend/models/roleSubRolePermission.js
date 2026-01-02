// models/rolesubrolepermission.js
"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class RoleSubRolePermission extends Model {
    static associate(models) {
      RoleSubRolePermission.belongsTo(models.RoleSubRole, {
        foreignKey: "roles_sub_roles_id",
        as: "roleSubRole",
      });

      RoleSubRolePermission.belongsTo(models.Permission, {
        foreignKey: "permission_id",
        as: "permission",
      });

      RoleSubRolePermission.belongsTo(models.User, {
        foreignKey: "assigned_by",
        as: "assigner",
      });
    }
  }

  RoleSubRolePermission.init(
    {
      role_sub_roles_permission_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      roles_sub_roles_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      permission_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      assigned_by: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      assigned_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: "RoleSubRolePermission",
      tableName: "role_sub_roles_permissions",
      timestamps: false,
      underscored: true,
    }
  );

  return RoleSubRolePermission;
};