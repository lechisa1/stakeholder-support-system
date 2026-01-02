"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class InstituteAttachment extends Model {
    static associate(models) {
      // Each attachment belongs to an Institute
      InstituteAttachment.belongsTo(models.Institute, {
        foreignKey: "institute_id",
        as: "institute",
      });
    }
  }

  InstituteAttachment.init(
    {
      institute_attachment_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      institute_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      attachment_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      type: {
        type: DataTypes.ENUM("logo", "other"),
        allowNull: false,
        defaultValue: "other",
        comment: "Attachment type; default is 'other'",
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: "InstituteAttachment",
      tableName: "institute_attachments",
      timestamps: false,
      underscored: true,
    }
  );

  return InstituteAttachment;
};
