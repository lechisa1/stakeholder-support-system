"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class IssueSolutionAttachment extends Model {
    static associate(models) {
      IssueSolutionAttachment.belongsTo(models.IssueSolution, {
        foreignKey: "solution_id",
        as: "solution",
      });
    //   IssueSolutionAttachment.belongsTo(models.Attachment, {
    //     foreignKey: "attachment_id",
    //     as: "attachment",
    //   });
    }
  }

  IssueSolutionAttachment.init(
    {
      issue_solution_attachment_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      solution_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
    //   attachment_id: {
    //     type: DataTypes.UUID,
    //     allowNull: false,
    //   },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: "IssueSolutionAttachment",
      tableName: "issue_solution_attachments",
      timestamps: false,
      underscored: true,
    }
  );

  return IssueSolutionAttachment;
};
