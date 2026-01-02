"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class HierarchyNode extends Model {
    static associate(models) {
      // Belongs to Project
      this.belongsTo(models.Project, {
        foreignKey: "project_id",
        as: "project",
      });

      // Self-referencing for parent-child relationship
      this.belongsTo(models.HierarchyNode, {
        foreignKey: "parent_id",
        as: "parent",
      });
      this.hasMany(models.HierarchyNode, {
        foreignKey: "parent_id",
        as: "children",
      });
    }
  }

  HierarchyNode.init(
    {
      hierarchy_node_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        field: "hierarchy_node_id",
      },
      project_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      parent_id: {
        type: DataTypes.UUID,
        allowNull: true,
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
      level: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      sequelize,
      modelName: "HierarchyNode",
      tableName: "hierarchy_nodes",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      deletedAt: "deleted_at",
      paranoid: true,
    }
  );

  return HierarchyNode;
};
