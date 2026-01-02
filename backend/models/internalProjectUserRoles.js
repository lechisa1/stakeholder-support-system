"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class InternalProjectUserRole extends Model {
    static associate(models) {
      // 🔵 Link to project
      InternalProjectUserRole.belongsTo(models.Project, {
        foreignKey: "project_id",
        as: "project",
      });

      // 🔵 Link to user
      InternalProjectUserRole.belongsTo(models.User, {
        foreignKey: "user_id",
        as: "user",
      });

      // 🔵 Link to role
      InternalProjectUserRole.belongsTo(models.Role, {
        foreignKey: "role_id",
        as: "role",
      });

      // 🔵 Link to InternalNode (instead of HierarchyNode)
      InternalProjectUserRole.belongsTo(models.InternalNode, {
        foreignKey: "internal_node_id",
        as: "internalNode",
      });

      // 🟢 NEW → Required Project Metric
      this.belongsTo(models.ProjectMetric, {
        foreignKey: "project_metric_id",
        as: "projectMetric",
      });

      // Optional: link to institute_project if applicable
      InternalProjectUserRole.hasOne(models.InstituteProject, {
        foreignKey: "project_id",
        sourceKey: "project_id",
        as: "instituteProject",
      });
    }
  }

  InternalProjectUserRole.init(
    {
      internal_project_user_role_id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      project_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      role_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      project_metric_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      // 🟢 NEW: Internal node reference
      internal_node_id: {
        type: DataTypes.UUID,
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
    },
    {
      sequelize,
      modelName: "InternalProjectUserRole",
      tableName: "internal_project_user_roles",
      timestamps: false,
      underscored: true,
      indexes: [
        {
          unique: true,
          fields: ["project_id", "user_id", "project_metric_id"],
        },
      ],
    }
  );

  return InternalProjectUserRole;
};
