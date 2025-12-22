"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class ProjectMetric extends Model {
    static associate(models) {
      // Many-to-Many with Users
      this.belongsToMany(models.User, {
        through: models.ProjectMetricUser, // junction table
        foreignKey: "project_metric_id",
        otherKey: "user_id",
        as: "users",
      });

      // Many-to-Many with Projects
      this.belongsToMany(models.Project, {
        through: models.ProjectMetricProject, // junction table
        foreignKey: "project_metric_id",
        otherKey: "project_id",
        as: "projects",
      });
    }
  }

  ProjectMetric.init(
    {
      project_metric_id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
      },
      name: {
        type: DataTypes.STRING(150),
        allowNull: false,
        unique: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      weight: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      sequelize,
      modelName: "ProjectMetric",
      tableName: "project_metrics",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return ProjectMetric;
};
