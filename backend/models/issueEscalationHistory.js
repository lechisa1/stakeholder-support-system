"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class IssueEscalationHistory extends Model {
    static associate(models) {
      // IssueEscalationHistory ↔ Issue
      IssueEscalationHistory.belongsTo(models.Issue, {
        foreignKey: "issue_id",
        as: "issue",
      });

      // IssueEscalationHistory ↔ User (escalated_by)
      IssueEscalationHistory.belongsTo(models.User, {
        foreignKey: "escalated_by",
        as: "escalator",
      });
    }
  }

  IssueEscalationHistory.init(
    {
      issue_escalation_history_id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
      },
      issue_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      from_tier: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      to_tier: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      escalated_by: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: "IssueEscalationHistory",
      tableName: "issue_escalation_history",
      timestamps: false, // since only created_at exists
    }
  );

  return IssueEscalationHistory;
};
