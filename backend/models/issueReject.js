"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class IssueReject extends Model {
    static associate(models) {
      // IssueReject ↔ Issue
      IssueReject.belongsTo(models.Issue, {
        foreignKey: "issue_id",
        as: "issue",
      });

      // IssueReject ↔ User (rejected by)
      IssueReject.belongsTo(models.User, {
        foreignKey: "rejected_by",
        as: "rejector",
      });

      // IssueReject ↔ RejectAttachments
      IssueReject.hasMany(models.RejectAttachment, {
        foreignKey: "reject_id",
        as: "attachments",
      });
    }
  }

  IssueReject.init(
    {
      reject_id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
      },
      issue_id: DataTypes.UUID,
      reason: DataTypes.TEXT,
      rejected_by: DataTypes.UUID,
      rejected_at: DataTypes.DATE,
      created_at: DataTypes.DATE,
      updated_at: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "IssueReject",
      tableName: "issue_rejects",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return IssueReject;
};
