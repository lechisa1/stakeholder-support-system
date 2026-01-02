"use strict";
const { v4: uuidv4 } = require("uuid");

module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    await queryInterface.bulkInsert("user_positions", [
      {
        user_position_id: uuidv4(),
        name: "adminstrative_user",
        description:
          "Users who are external stakeholders, such as clients or partners, interacting with the Issue Tracking System.",
        created_at: now,
        updated_at: now,
      },
      {
        user_position_id: uuidv4(),
        name: "ict_support_user",
        description:
          "Users who are external staff or employees within the organization managing or overseeing projects and issues.",
        created_at: now,
        updated_at: now,
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("user_positions", null, {});
  },
};
