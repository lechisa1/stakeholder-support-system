"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class IssueAttachment extends Model {
    static associate(models) {
      // Junction belongs to Issue
      IssueAttachment.belongsTo(models.Issue, {
        foreignKey: "issue_id",
        as: "issue",
      });

      // Junction belongs to Attachment
      IssueAttachment.belongsTo(models.Attachment, {
        foreignKey: "attachment_id",
        as: "attachment",
      });
    }
  }

  IssueAttachment.init(
    {
      issue_attachment_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      issue_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      attachment_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: "IssueAttachment",
      tableName: "issue_attachments",
      timestamps: false,
      underscored: true,
    }
  );

  return IssueAttachment;
};
