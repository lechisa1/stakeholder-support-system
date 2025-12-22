"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class IssueTier extends Model {
    static associate(models) {
      // IssueTier ↔ Issue
      IssueTier.belongsTo(models.Issue, {
        foreignKey: "issue_id",
        as: "issue",
      });

      // IssueTier ↔ User (handler)
      IssueTier.belongsTo(models.User, {
        foreignKey: "handler_id",
        as: "handler",
      });
    }
  }

  IssueTier.init(
    {
      issue_tier_id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
      },
      issue_id: DataTypes.UUID,
      tier_level: DataTypes.STRING(50),
      handler_id: DataTypes.UUID,
      assigned_at: DataTypes.DATE,
      completed_at: DataTypes.DATE,
      status: DataTypes.STRING(50),
      remarks: DataTypes.TEXT,
      created_at: DataTypes.DATE,
      updated_at: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "IssueTier",
      tableName: "issue_tiers",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return IssueTier;
};
