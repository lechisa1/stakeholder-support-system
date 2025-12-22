"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class IssueComment extends Model {
    static associate(models) {
      // IssueComment ↔ Issue
      IssueComment.belongsTo(models.Issue, {
        foreignKey: "issue_id",
        as: "issue",
      });

      // IssueComment ↔ User (author)
      IssueComment.belongsTo(models.User, {
        foreignKey: "author_id",
        as: "author",
      });
    }
  }

  IssueComment.init(
    {
      comment_id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
      },
      issue_id: DataTypes.UUID,
      author_id: DataTypes.UUID,
      comment_text: DataTypes.TEXT,
      is_internal_note: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      created_at: DataTypes.DATE,
      updated_at: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "IssueComment",
      tableName: "issue_comments",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return IssueComment;
};
