"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class IssueResolution extends Model {
    static associate(models) {
      // IssueResolution ↔ Issue
      IssueResolution.belongsTo(models.Issue, {
        foreignKey: "issue_id",
        as: "issue",
      });

      // IssueResolution ↔ User (resolved by)
      IssueResolution.belongsTo(models.User, {
        foreignKey: "resolved_by",
        as: "resolver",
      });

      // IssueResolution ↔ ResolutionAttachments
      IssueResolution.hasMany(models.ResolutionAttachment, {
        foreignKey: "resolution_id",
        as: "attachments",
      });
    }
  }

  IssueResolution.init(
    {
      resolution_id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
      },
      issue_id: DataTypes.UUID,
      reason: DataTypes.TEXT,
      resolved_by: DataTypes.UUID,
      resolved_at: DataTypes.DATE,
      created_at: DataTypes.DATE,
      updated_at: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "IssueResolution",
      tableName: "issue_resolutions",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return IssueResolution;
};
