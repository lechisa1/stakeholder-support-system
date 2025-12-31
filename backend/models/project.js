"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Project extends Model {
    static associate(models) {
      // Many-to-Many relationship with Institute through InstituteProject
      this.belongsToMany(models.Institute, {
        through: models.InstituteProject,
        foreignKey: "project_id",
        otherKey: "institute_id",
        as: "institutes",
      });
      // One-to-Many relationship with Hierarchy
      this.hasMany(models.HierarchyNode, {
        foreignKey: "project_id",
        as: "hierarchies",
      });
      this.hasMany(models.InstituteProject, {
        foreignKey: "project_id",
        as: "instituteProjects", // must match the include in your query
      });
      this.hasMany(models.ProjectUserRole, {
        foreignKey: "project_id",
        as: "projectUserRoles",
      });
      this.hasMany(models.ProjectMaintenance, {
        foreignKey: "project_id",
        as: "maintenances",
      });
      this.hasMany(models.Issue, {
        foreignKey: "project_id",
        as: "issues",
      });
      // Remove the one-to-many metric association
      this.belongsToMany(models.ProjectMetric, {
        through: models.ProjectMetricProject,
        foreignKey: "project_id",
        otherKey: "project_metric_id",
        as: "metrics",
      });
    }
  }

  Project.init(
    {
      project_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(255),
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
    },
    {
      sequelize,
      modelName: "Project",
      tableName: "projects",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      deletedAt: "deleted_at",
      paranoid: true, // enables soft delete
    }
  );

  return Project;
};
