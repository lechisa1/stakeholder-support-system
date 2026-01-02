"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Create the table
    await queryInterface.createTable("institute_attachments", {
      institute_attachment_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      institute_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "institutes",
          key: "institute_id",
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
      type: {
        type: Sequelize.ENUM("logo", "other"),
        allowNull: false,
        defaultValue: "other",
        comment: "Attachment type; default is 'other'",
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        allowNull: false,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    // Drop the table
    await queryInterface.dropTable("institute_attachments");
  },
};
