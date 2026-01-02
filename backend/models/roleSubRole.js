// models/rolesubrole.js
"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class RoleSubRole extends Model {
    static associate(models) {
      RoleSubRole.belongsTo(models.Role, {
        foreignKey: "role_id",
        as: "role",
      });

      RoleSubRole.belongsTo(models.SubRole, {
        foreignKey: "sub_role_id",
        as: "subRole",
      });

      // RoleSubRole has many RoleSubRolePermissions
      RoleSubRole.hasMany(models.RoleSubRolePermission, {
        foreignKey: "roles_sub_roles_id",
        as: "permissions",
      });
    }
  }

  RoleSubRole.init(
    {
      roles_sub_roles_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      role_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      sub_role_id: {
        type: DataTypes.UUID,
        allowNull: true, // Nullable as per schema
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      deleted_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "RoleSubRole",
      tableName: "role_sub_roles",
      timestamps: false,
      underscored: true,
      paranoid: true,
      deletedAt: 'deleted_at',
      indexes: [
        {
          unique: true,
          fields: ['role_id', 'sub_role_id']
        }
      ]
    }
  );

  return RoleSubRole;
};