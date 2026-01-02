"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("project_metric_projects", {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
      },
      project_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "projects",
          key: "project_id",
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

    // Optional: unique constraint so a project cannot have the same metric multiple times
    await queryInterface.addConstraint("project_metric_projects", {
      fields: ["project_id", "project_metric_id"],
      type: "unique",
      name: "unique_project_metric",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("project_metric_projects");
  },
};
