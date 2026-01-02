"use strict";
module.exports = (sequelize, DataTypes) => {
  const IssueCategory = sequelize.define(
    "IssueCategory",
    {
      category_id: {
        type: DataTypes.UUID, // changed from CHAR(36) to UUID
        defaultValue: DataTypes.UUIDV4, // auto-generate UUID
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(100),
        unique: true,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "issue_categories",
      timestamps: false,
    }
  );

  return IssueCategory;
};
