// models/subrole.js
"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class SubRole extends Model {
    static associate(models) {
      // SubRole has many RoleSubRoles
      SubRole.hasMany(models.RoleSubRole, {
        foreignKey: "sub_role_id",
        as: "roleSubRoles",
      });

      // SubRole can be used in ProjectUserRoles
      SubRole.hasMany(models.ProjectUserRole, {
        foreignKey: "sub_role_id",
        as: "projectUserRoles",
      });
    }
  }

  SubRole.init(
    {
      sub_role_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
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
      modelName: "SubRole",
      tableName: "sub_roles",
      timestamps: false,
      underscored: true,
      paranoid: true,
      deletedAt: 'deleted_at',
    }
  );

  return SubRole;
};