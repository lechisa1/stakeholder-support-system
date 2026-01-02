"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("assignment_attachments", {
      assignment_attachment_id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
      },

      assignment_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "issue_assignments",
          key: "assignment_id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },

      attachment_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "attachments",
          key: "attachment_id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },

      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("NOW()"),
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("assignment_attachments");
  },
};
