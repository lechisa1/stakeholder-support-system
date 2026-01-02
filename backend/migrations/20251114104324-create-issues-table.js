"use strict";
const crypto = require("crypto");

function generateTicket() {
  const year = new Date().getFullYear().toString().slice(-2);
  const randomCode = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `TICK-${year}-${randomCode}`;
}

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("issues", {
      issue_id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: Sequelize.UUIDV4,
      },
      project_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "projects", // table name
          key: "project_id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE", // issues must be deleted if project is deleted
      },
      ticket_number: {
        type: Sequelize.STRING(30),
        allowNull: false,
        unique: true,
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      issue_category_id: {
        type: Sequelize.UUID, // ✅ must match IssueCategory.category_id
        references: {
          model: "issue_categories",
          key: "category_id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },

      hierarchy_node_id: {
        type: Sequelize.UUID,
        references: {
          model: "hierarchy_nodes",
          key: "hierarchy_node_id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      priority_id: {
        type: Sequelize.UUID,
        references: {
          model: "issue_priorities",
          key: "priority_id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      status: {
        type: Sequelize.STRING(50),
        defaultValue: "pending",
      },
      reported_by: {
        type: Sequelize.UUID,
        references: {
          model: "users",
          key: "user_id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      assigned_to: {
        type: Sequelize.UUID,
        references: {
          model: "users",
          key: "user_id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      action_taken: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      url_path: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      issue_description: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      issue_occured_time: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("NOW()"),
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("NOW()"),
      },
      resolved_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      closed_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("issues");
  },
};
