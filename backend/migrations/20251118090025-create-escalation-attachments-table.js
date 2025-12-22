"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("escalation_attachments", {
      escalation_attachment_id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
      },

      escalation_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "issue_escalations",
          key: "escalation_id",
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
    await queryInterface.dropTable("escalation_attachments");
  },
};
