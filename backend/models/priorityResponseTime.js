// models/issueresponsetime.js
"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class IssueResponseTime extends Model {
    // static associate(models) {
    //   // 🟢 Link to IssuePriority
    //   this.hasMany(models.IssuePriority, {
    //     foreignKey: "response_time_id",
    //     as: "priorities",
    //   });
    // }
  }

  IssueResponseTime.init(
    {
      response_time_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      duration: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: "Numeric value of response time",
      },
      unit: {
        type: DataTypes.ENUM("hour", "day", "month"),
        allowNull: false,
        defaultValue: "hour",
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
      sequelize,
      modelName: "IssueResponseTime",
      tableName: "issue_response_times",
      timestamps: false,
      underscored: true,
    }
  );

  return IssueResponseTime;
};
