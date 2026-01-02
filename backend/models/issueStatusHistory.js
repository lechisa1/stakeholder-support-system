"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class IssueStatusHistory extends Model {
    static associate(models) {
      // IssueStatusHistory ↔ Issue
      IssueStatusHistory.belongsTo(models.Issue, {
        foreignKey: "issue_id",
        as: "issue",
      });

      // IssueStatusHistory ↔ User (changed by)
      IssueStatusHistory.belongsTo(models.User, {
        foreignKey: "changed_by",
        as: "changer",
      });
    }
  }

  IssueStatusHistory.init(
    {
      status_history_id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
      },
      issue_id: DataTypes.UUID,
      from_status: DataTypes.STRING(50),
      to_status: DataTypes.STRING(50),
      changed_by: DataTypes.UUID,
      reason: DataTypes.TEXT,
      created_at: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "IssueStatusHistory",
      tableName: "issue_status_history",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: false, // No updated_at field in the table
    }
  );

  return IssueStatusHistory;
};
