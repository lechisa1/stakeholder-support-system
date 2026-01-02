"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class IssueAction extends Model {
    static associate(models) {
      // IssueAction ↔ Issue
      IssueAction.belongsTo(models.Issue, {
        foreignKey: "issue_id",
        as: "issue",
      });

      // IssueAction ↔ User (performed by)
      IssueAction.belongsTo(models.User, {
        foreignKey: "performed_by",
        as: "performer",
      });
    }
  }

  IssueAction.init(
    {
      action_id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
      },
      issue_id: DataTypes.UUID,
      action_name: DataTypes.STRING(100),
      action_description: DataTypes.TEXT,
      performed_by: DataTypes.UUID,
      related_tier: DataTypes.STRING(50),
      created_at: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "IssueAction",
      tableName: "issue_actions",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: false, // No updated_at field in the table
    }
  );

  return IssueAction;
};
