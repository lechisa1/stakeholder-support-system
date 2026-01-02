"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class ProjectMaintenance extends Model {
    static associate(models) {
      // Each maintenance belongs to a project
      this.belongsTo(models.Project, {
        foreignKey: "project_id",
        as: "project",
      });
    }
  }

  ProjectMaintenance.init(
    {
      maintenance_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      project_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      start_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      end_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "ProjectMaintenance",
      tableName: "project_maintenances",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return ProjectMaintenance;
};
