"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("attachments", {
      attachment_id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: Sequelize.UUIDV4,
      },
      file_name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      file_path: {
        type: Sequelize.STRING(500),
        allowNull: false,
      },
      uploaded_by: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "users",
          key: "user_id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("NOW()"),
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("attachments");
  },
};
