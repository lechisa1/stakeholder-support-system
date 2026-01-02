"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class EscalationAttachment extends Model {
    static associate(models) {
      // Junction belongs to Issue
      EscalationAttachment.belongsTo(models.Issue, {
        foreignKey: "escalation_id",
        as: "escalation",
      });

      // Junction belongs to Attachment
      EscalationAttachment.belongsTo(models.Attachment, {
        foreignKey: "attachment_id",
        as: "attachment",
      });
    }
  }

  EscalationAttachment.init(
    {
      escalation_attachment_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      escalation_id: {
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
      modelName: "EscalationAttachment",
      tableName: "escalation_attachments",
      timestamps: false,
      underscored: true,
    }
  );

  return EscalationAttachment;
};
