// models/permission.js
"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Permission extends Model {
    static associate(models) {
      // Permission belongs to many RoleSubRole through RoleSubRolePermission
      Permission.belongsToMany(models.RoleSubRole, {
        through: models.RoleSubRolePermission,
        foreignKey: "permission_id",
        otherKey: "roles_sub_roles_id",
        as: "roleSubRoles",
      });

      Permission.belongsToMany(models.Role, {
        through: models.RolePermission,
        foreignKey: "permission_id",
        otherKey: "role_id",
        as: "roles",
      });
    }
  }

  Permission.init(
    {
      permission_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      resource: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
      },
      action: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false,
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
      modelName: "Permission",
      tableName: "permissions",
      timestamps: false,
      underscored: true,
    }
  );

  return Permission;
};
