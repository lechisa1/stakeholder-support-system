"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("notifications", {
      notification_id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
      },

      type: {
        type: Sequelize.ENUM(
          // Issue-related
          "ISSUE_CREATED",
          "ISSUE_ASSIGNED",
          "ISSUE_RESOLVED",
          "ISSUE_CONFIRMED",
          "ISSUE_REJECTED",
          "ISSUE_REOPENED",
          "ISSUE_ESCALATED",
          "ISSUE_COMMENTED",

          // User-related
          "PASSWORD_UPDATED",
          "LOGIN_ALERT",
          "USER_DEACTIVATED",
          "USER_REACTIVATED",
          "PROFILE_UPDATED",

          // System
          "SYSTEM_ALERT",
          "BROADCAST_MESSAGE"
        ),
        allowNull: false,
      },

      sender_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: "users",
          key: "user_id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },

      receiver_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "users",
          key: "user_id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },

      issue_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: "issues",
          key: "issue_id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },

      project_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: "projects",
          key: "project_id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },

      title: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },

      message: {
        type: Sequelize.TEXT,
        allowNull: false,
      },

      data: {
        type: Sequelize.JSONB,
        defaultValue: {},
      },

      priority: {
        type: Sequelize.ENUM("LOW", "MEDIUM", "HIGH", "URGENT"),
        defaultValue: "MEDIUM",
      },

      is_read: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },

      read_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },

      is_sent: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },

      sent_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },

      channel: {
        type: Sequelize.ENUM("IN_APP", "EMAIL", "SMS", "PUSH", "ALL"),
        defaultValue: "IN_APP",
      },

      expires_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },

      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });

    // Indexes
    await queryInterface.addIndex("notifications", ["receiver_id", "is_read"], {
      name: "idx_notifications_receiver_read",
    });

    await queryInterface.addIndex("notifications", ["type"], {
      name: "idx_notifications_type",
    });

    await queryInterface.addIndex("notifications", ["created_at"], {
      name: "idx_notifications_created_at",
    });

    await queryInterface.addIndex("notifications", ["issue_id"], {
      name: "idx_notifications_issue",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("notifications");

    // Drop ENUM types (Postgres requirement)
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_notifications_type";'
    );
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_notifications_priority";'
    );
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_notifications_channel";'
    );
  },
};
