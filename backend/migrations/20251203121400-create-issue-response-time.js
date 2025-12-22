"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("issue_response_times", {
      response_time_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      duration: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: "Numeric value of response time",
      },
      unit: {
        type: Sequelize.ENUM("hour", "day", "month"),
        allowNull: false,
        defaultValue: "hour",
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("issue_response_times");
  },
};
