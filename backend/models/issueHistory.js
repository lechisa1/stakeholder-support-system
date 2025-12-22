"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class IssueHistory extends Model {
    static associate(models) {
      IssueHistory.belongsTo(models.Issue, {
        foreignKey: "issue_id",
        as: "issue",
      });

      IssueHistory.belongsTo(models.User, {
        foreignKey: "user_id",
        as: "performed_by",
      });

      // Optional FK to IssueEscalation (nullable)
      IssueHistory.belongsTo(models.IssueEscalation, {
        foreignKey: "escalation_id",
        as: "escalation",
      });

      // Optional FK to IssueResolution (nullable)
      IssueHistory.belongsTo(models.IssueResolution, {
        foreignKey: "resolution_id",
        as: "resolution",
      });
      // Optional FK to IssueAssignment (nullable)
      IssueHistory.belongsTo(models.IssueAssignment, {
        foreignKey: "assignment_id",
        as: "assignment",
      });
    }
  }

  IssueHistory.init(
    {
      history_id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      issue_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      action: {
        type: DataTypes.STRING,
        allowNull: false,
        comment:
          "created | accepted | updated | assigned | escalated | resolved | reopened | commented | assigned",
      },
      status_at_time: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      escalation_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      resolution_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      // assignment_id: {
      //   type: DataTypes.UUID,
      //   allowNull: true,
      // },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: "IssueHistory",
      tableName: "issue_histories",
      timestamps: false,
    }
  );

  return IssueHistory;
};
