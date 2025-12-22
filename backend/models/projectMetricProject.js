"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class ProjectMetricProject extends Model {}
  ProjectMetricProject.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      project_id: { type: DataTypes.UUID, allowNull: false },
      project_metric_id: { type: DataTypes.UUID, allowNull: false },
    },
    {
      sequelize,
      modelName: "ProjectMetricProject",
      tableName: "project_metric_projects",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );
  return ProjectMetricProject;
};
