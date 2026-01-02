'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class HierarchyNodeOrganization extends Model {
    static associate(models) {
      // Belongs to HierarchyNode
      this.belongsTo(models.HierarchyNode, {
        foreignKey: "hierarchy_node_id",
        as: "hierarchyNode",
      });
      // Belongs to Institute
      this.belongsTo(models.Institute, {
        foreignKey: "institute_id",
        as: "institute",
      });
    }
  }

  HierarchyNodeOrganization.init(
    {
      hierarchy_node_organization_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      hierarchy_node_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      institute_id: {
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
      modelName: "HierarchyNodeOrganization",
      tableName: "hierarchy_node_organization",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      deletedAt: "deleted_at",
      paranoid: true,
    }
  );

  return HierarchyNodeOrganization;
};
