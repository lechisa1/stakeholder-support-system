"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class UserPosition extends Model {
    static associate(models) {
      // A UserPosition can have many Users
      this.hasMany(models.User, {
        foreignKey: "user_position_id",
        as: "users",
      });
    }
  }

  UserPosition.init(
    {
      user_position_id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "UserPosition",
      tableName: "user_positions",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return UserPosition;
};
