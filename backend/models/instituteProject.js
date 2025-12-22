"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class InstituteProject extends Model {
    static associate(models) {
      // Belongs to Institute
      this.belongsTo(models.Institute, {
        foreignKey: "institute_id",
        as: "institute",
      });
      // Belongs to Project
      this.belongsTo(models.Project, {
        foreignKey: "project_id",
        as: "project",
      });
      InstituteProject.hasMany(models.ProjectUserRole, {
        foreignKey: "project_id",
        sourceKey: "project_id",
        as: "projectUserRoles",
      });

    }
  }

  InstituteProject.init(
    {
      institute_project_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      institute_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      project_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      sequelize,
      modelName: "InstituteProject",
      tableName: "institute_projects",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      deletedAt: "deleted_at",
      paranoid: true,
    }
  );

  return InstituteProject;
};
