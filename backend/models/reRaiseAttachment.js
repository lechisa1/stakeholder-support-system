"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class ReRaiseAttachment extends Model {
    static associate(models) {
      // Junction belongs to IssueReRaise
      ReRaiseAttachment.belongsTo(models.IssueReRaise, {
        foreignKey: "re_raise_id",
        as: "re_raise",
      });

      // Junction belongs to Attachment
      ReRaiseAttachment.belongsTo(models.Attachment, {
        foreignKey: "attachment_id",
        as: "attachment",
      });
    }
  }

  ReRaiseAttachment.init(
    {
      re_raise_attachment_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      re_raise_id: {
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
      modelName: "ReRaiseAttachment",
      tableName: "re_raise_attachments",
      timestamps: false,
      underscored: true,
    }
  );

  return ReRaiseAttachment;
};
