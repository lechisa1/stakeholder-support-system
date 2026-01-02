"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("issue_histories", {
      history_id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
      },

      issue_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "issues",
          key: "issue_id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },

      user_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: "users",
          key: "user_id",
        },
        onUpdate: "SET NULL",
        onDelete: "SET NULL",
      },

      action: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      status_at_time: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      escalation_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: "issue_escalations",
          key: "escalation_id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },

      resolution_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: "issue_resolutions",
          key: "resolution_id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },

      assignment_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: "issue_assignments",
          key: "assignment_id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },

      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("NOW()"),
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("issue_histories");
  },
};
