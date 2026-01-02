"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class IssueReRaise extends Model {
    static associate(models) {
      // IssueReRaise ↔ Issue
      IssueReRaise.belongsTo(models.Issue, {
        foreignKey: "issue_id",
        as: "issue",
      });

      // IssueReRaise ↔ User (re-raised by)
      IssueReRaise.belongsTo(models.User, {
        foreignKey: "re_raised_by",
        as: "re_raiser",
      });

      // IssueReRaise ↔ ReRaiseAttachments
      IssueReRaise.hasMany(models.ReRaiseAttachment, {
        foreignKey: "re_raise_id",
        as: "attachments",
      });
    }
  }

  IssueReRaise.init(
    {
      re_raise_id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
      },
      issue_id: DataTypes.UUID,
      reason: DataTypes.TEXT,
      re_raised_by: DataTypes.UUID,
      re_raised_at: DataTypes.DATE,
      created_at: DataTypes.DATE,
      updated_at: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "IssueReRaise",
      tableName: "issue_re_rises",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return IssueReRaise;
};
