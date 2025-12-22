"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("project_metric_users", {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "users",
          key: "user_id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      project_metric_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "project_metrics",
          key: "project_metric_id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      value: {
        type: Sequelize.FLOAT,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("NOW()"),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("NOW()"),
      },
    });

    // Optional: add a unique constraint so a user cannot have the same metric multiple times
    await queryInterface.addConstraint("project_metric_users", {
      fields: ["user_id", "project_metric_id"],
      type: "unique",
      name: "unique_user_metric",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("project_metric_users");
  },
};
