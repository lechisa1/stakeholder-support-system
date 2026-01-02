"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class ProjectMetricUser extends Model {}
  ProjectMetricUser.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      user_id: { type: DataTypes.UUID, allowNull: false },
      project_metric_id: { type: DataTypes.UUID, allowNull: false },
      value: { type: DataTypes.FLOAT, allowNull: true }, // optional metric value
    },
    {
      sequelize,
      modelName: "ProjectMetricUser",
      tableName: "project_metric_users",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );
  return ProjectMetricUser;
};
