"use strict";
const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class ProjectUser extends Model {
    static associate(models) {
      // Each ProjectUser belongs to a project
      ProjectUser.belongsTo(models.Project, {
        foreignKey: "project_id",
        as: "project",
      });

      // Each ProjectUser belongs to a user
      ProjectUser.belongsTo(models.User, {
        foreignKey: "user_id",
        as: "user",
      });

      // The user who assigned this member
      ProjectUser.belongsTo(models.User, {
        foreignKey: "assigned_by",
        as: "assignedBy",
      });
    }
  }

  ProjectUser.init(
    {
      project_user_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      project_id: {
        type: DataTypes.CHAR(36), // Match DB CHAR(36)
        allowNull: false,
      },
      user_id: {
        type: DataTypes.UUID, // Keep UUID if users.user_id is UUID
        allowNull: false,
      },
      main_role: {
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: "Main role: Developer, QA, DevOps, ICT Support, Central Manager",
      },
      sub_role: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: "Optional sub-role: Frontend, Backend, Technical Manager, QA Head, QA Member",
      },
      assigned_by: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      assigned_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
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
    },
    {
      sequelize,
      modelName: "ProjectUser",
      tableName: "project_users",
      underscored: true,
      timestamps: false,
    }
  );

  return ProjectUser;
};