"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Notification extends Model {
    static associate(models) {
      // Notification ↔ User (sender)
      Notification.belongsTo(models.User, {
        foreignKey: "sender_id",
        as: "sender",
      });

      // Notification ↔ User (receiver)
      Notification.belongsTo(models.User, {
        foreignKey: "receiver_id",
        as: "receiver",
      });

      // Notification ↔ Issue (for issue-related notifications)
      Notification.belongsTo(models.Issue, {
        foreignKey: "issue_id",
        as: "issue",
      });

      // Notification ↔ Project (for project-related notifications)
      Notification.belongsTo(models.Project, {
        foreignKey: "project_id",
        as: "project",
      });
    }
  }

  Notification.init(
    {
      notification_id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
      },
      type: {
        type: DataTypes.ENUM(
          // Issue-related notifications
          "ISSUE_CREATED",
          "ISSUE_ASSIGNED",
          "ISSUE_RESOLVED",
          "ISSUE_CONFIRMED",
          "ISSUE_REJECTED",
          "ISSUE_REOPENED",
          "ISSUE_ESCALATED",
          "ISSUE_COMMENTED",

          // User account notifications
          "PASSWORD_UPDATED",
          "LOGIN_ALERT",
          "USER_DEACTIVATED",
          "USER_REACTIVATED",
          "PROFILE_UPDATED",

          // System notifications
          "SYSTEM_ALERT",
          "BROADCAST_MESSAGE"
        ),
        allowNull: false,
      },
      sender_id: {
        type: DataTypes.UUID,
        allowNull: true, // Can be null for system notifications
      },
      receiver_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      issue_id: {
        type: DataTypes.UUID,
        allowNull: true, // Only for issue-related notifications
      },
      project_id: {
        type: DataTypes.UUID,
        allowNull: true, // For project-specific notifications
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      data: {
        type: DataTypes.JSONB, // For storing additional structured data
        defaultValue: {},
        comment: "Stores additional data like user IP, device info, etc.",
      },
      priority: {
        type: DataTypes.ENUM("LOW", "MEDIUM", "HIGH", "URGENT"),
        defaultValue: "MEDIUM",
      },
      is_read: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      read_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      is_sent: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: "Whether notification was sent via email/push",
      },
      sent_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      channel: {
        type: DataTypes.ENUM("IN_APP", "EMAIL", "SMS", "PUSH", "ALL"),
        defaultValue: "IN_APP",
      },
      expires_at: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: "Optional expiration for time-sensitive notifications",
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: "Notification",
      tableName: "notifications",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: false, // We don't need updated_at for notifications
      indexes: [
        {
          fields: ["receiver_id", "is_read"],
          name: "idx_notifications_receiver_read",
        },
        {
          fields: ["type"],
          name: "idx_notifications_type",
        },
        {
          fields: ["created_at"],
          name: "idx_notifications_created_at",
        },
        {
          fields: ["issue_id"],
          name: "idx_notifications_issue",
        },
      ],
    }
  );

  return Notification;
};
