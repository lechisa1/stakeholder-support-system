"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class InternalNode extends Model {
    static associate(models) {
      // Self-referencing for parent-child relationship
      this.belongsTo(models.InternalNode, {
        foreignKey: "parent_id",
        as: "parent",
      });
      this.hasMany(models.InternalNode, {
        foreignKey: "parent_id",
        as: "children",
      });
    }
  }

  InternalNode.init(
    {
      internal_node_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        field: "internal_node_id",
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
      modelName: "InternalNode",
      tableName: "internal_nodes",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      deletedAt: "deleted_at",
      paranoid: true,
    }
  );

  return InternalNode;
};
