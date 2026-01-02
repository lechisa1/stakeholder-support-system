"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class IssueSolution extends Model {
    static associate(models) {
      IssueSolution.belongsTo(models.Issue, {
        foreignKey: "issue_id",
        as: "issue",
      });
      IssueSolution.hasMany(models.IssueSolutionAttachment, {
        foreignKey: "solution_id",
        as: "attachments",
      });
    }
  }

  IssueSolution.init(
    {
      solution_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      issue_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      created_by: {
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
      modelName: "IssueSolution",
      tableName: "issue_solutions",
      timestamps: false,
      underscored: true,
    }
  );

  return IssueSolution;
};
