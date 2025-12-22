"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class AssignmentAttachment extends Model {
    static associate(models) {
      // AssignmentAttachment ↔ IssueAssignment
      AssignmentAttachment.belongsTo(models.IssueAssignment, {
        foreignKey: "assignment_id",
        as: "assignment",
      });

      // AssignmentAttachment ↔ Attachment
      AssignmentAttachment.belongsTo(models.Attachment, {
        foreignKey: "attachment_id",
        as: "attachment",
      });
    }
  }

  AssignmentAttachment.init(
    {
      assignment_attachment_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      assignment_id: {
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
      modelName: "AssignmentAttachment",
      tableName: "assignment_attachments",
      timestamps: false,
      underscored: true,
    }
  );

  return AssignmentAttachment;
};
