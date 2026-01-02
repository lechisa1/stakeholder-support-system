"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class ResolutionAttachment extends Model {
    static associate(models) {
      // Junction belongs to IssueResolution
      ResolutionAttachment.belongsTo(models.IssueResolution, {
        foreignKey: "resolution_id",
        as: "resolution",
      });

      // Junction belongs to Attachment
      ResolutionAttachment.belongsTo(models.Attachment, {
        foreignKey: "attachment_id",
        as: "attachment",
      });
    }
  }

  ResolutionAttachment.init(
    {
      resolution_attachment_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      resolution_id: {
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
      modelName: "ResolutionAttachment",
      tableName: "resolution_attachments",
      timestamps: false,
      underscored: true,
    }
  );

  return ResolutionAttachment;
};
