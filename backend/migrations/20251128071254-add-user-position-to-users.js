"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("users", "user_position_id", {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: "user_positions",
        key: "user_position_id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("users", "user_position_id");
  },
};
