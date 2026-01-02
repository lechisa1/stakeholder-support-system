// models/user.js
"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.belongsTo(models.UserType, {
        foreignKey: "user_type_id",
        as: "userType",
      });
      User.belongsTo(models.UserPosition, {
        foreignKey: "user_position_id",
        as: "userPosition",
      });

      User.belongsTo(models.Institute, {
        foreignKey: "institute_id",
        as: "institute",
      });

      // Project roles association
      User.hasMany(models.ProjectUserRole, {
        foreignKey: "user_id",
        as: "projectRoles",
      });

      // Internal project roles association
      User.hasMany(models.InternalProjectUserRole, {
        foreignKey: "user_id",
        as: "internalProjectUserRoles",
      });
      // Issues reported by user
      User.hasMany(models.Issue, {
        foreignKey: "reported_by",
        as: "reportedIssues",
      });
      User.belongsToMany(models.Role, {
        through: models.UserRoles,
        foreignKey: "user_id",
        otherKey: "role_id",
        as: "roles",
      });
      User.belongsTo(models.HierarchyNode, {
        foreignKey: "hierarchy_node_id",
        as: "hierarchyNode",
      });
      User.belongsTo(models.InternalNode, {
        foreignKey: "internal_node_id",
        as: "internalNode",
      });
      // Remove the one-to-many metric association
      this.belongsToMany(models.ProjectMetric, {
        through: models.ProjectMetricUser,
        foreignKey: "user_id",
        otherKey: "project_metric_id",
        as: "metrics",
      });
    }
  }

  User.init(
    {
      user_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      full_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: { isEmail: true },
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      phone_number: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      user_type_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      user_position_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      institute_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      position: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      hierarchy_node_id: { type: DataTypes.UUID, allowNull: true },
      internal_node_id: { type: DataTypes.UUID, allowNull: true },
      profile_image: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      is_first_logged_in: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      last_login_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      password_changed_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
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
      modelName: "User",
      tableName: "users",
      timestamps: false,
      underscored: true,
    }
  );

  return User;
};
