"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("issue_solution_attachments", {
      issue_solution_attachment_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      solution_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "issue_solutions",
          key: "solution_id",
        },
        onDelete: "CASCADE",
      },
      file_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      original_name: {
        type: Sequelize.STRING,
      },
      mime_type: {
        type: Sequelize.STRING,
      },
      path: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("NOW"),
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("NOW"),
        allowNull: false,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("issue_solution_attachments");
  },
};
