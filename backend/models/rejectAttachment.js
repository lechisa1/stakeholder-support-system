"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class RejectAttachment extends Model {
    static associate(models) {
      // Junction belongs to IssueReject
      RejectAttachment.belongsTo(models.IssueReject, {
        foreignKey: "reject_id",
        as: "reject",
      });

      // Junction belongs to Attachment
      RejectAttachment.belongsTo(models.Attachment, {
        foreignKey: "attachment_id",
        as: "attachment",
      });
    }
  }

  RejectAttachment.init(
    {
      reject_attachment_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      reject_id: {
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
      modelName: "RejectAttachment",
      tableName: "reject_attachments",
      timestamps: false,
      underscored: true,
    }
  );

  return RejectAttachment;
};
