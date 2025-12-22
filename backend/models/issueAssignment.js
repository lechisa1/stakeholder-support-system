"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class IssueAssignment extends Model {
    static associate(models) {
      // IssueAssignment ↔ Issue
      IssueAssignment.belongsTo(models.Issue, {
        foreignKey: "issue_id",
        as: "issue",
      });

      // IssueAssignment ↔ User (assignee)
      IssueAssignment.belongsTo(models.User, {
        foreignKey: "assignee_id",
        as: "assignee",
      });

      // IssueAssignment ↔ User (assigned by - Technical Manager)
      IssueAssignment.belongsTo(models.User, {
        foreignKey: "assigned_by",
        as: "assigner",
      });

      // IssueAssignment ↔ AssignmentAttachments
      IssueAssignment.hasMany(models.AssignmentAttachment, {
        foreignKey: "assignment_id",
        as: "attachments",
      });
    }
  }

  IssueAssignment.init(
    {
      assignment_id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
      },
      issue_id: DataTypes.UUID,
      assignee_id: DataTypes.UUID,
      assigned_by: DataTypes.UUID,
      assigned_at: DataTypes.DATE,
      status: {
        type: DataTypes.STRING(50),
        defaultValue: "pending",
      },
      remarks: DataTypes.TEXT,
      created_at: DataTypes.DATE,
      updated_at: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "IssueAssignment",
      tableName: "issue_assignments",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return IssueAssignment;
};
