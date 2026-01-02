"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("re_raise_attachments", {
      re_raise_attachment_id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
      },

      re_raise_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "issue_re_rises",
          key: "re_raise_id",
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
    await queryInterface.dropTable("re_raise_attachments");
  },
};
