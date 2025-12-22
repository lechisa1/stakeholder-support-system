"use strict";
const crypto = require("crypto");

function generateTicket() {
  const year = new Date().getFullYear().toString().slice(-2);
  const randomCode = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `TICK-${year}-${randomCode}`;
}

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1️⃣ Add column as NULLABLE first
    await queryInterface.addColumn("issues", "ticket_number", {
      type: Sequelize.STRING(30),
      allowNull: true,
      unique: true,
    });

    // 2️⃣ Fetch all existing issues
    const [issues] = await queryInterface.sequelize.query(`
      SELECT issue_id FROM "issues"
    `);

    for (const issue of issues) {
      let ticket;
      let exists = true;

      // Keep generating until you get a unique one
      while (exists) {
        ticket = generateTicket();

        const [found] = await queryInterface.sequelize.query(`
          SELECT ticket_number FROM "issues"
          WHERE ticket_number = '${ticket}'
        `);

        exists = found.length > 0;
      }

      await queryInterface.sequelize.query(`
        UPDATE "issues"
        SET ticket_number = '${ticket}'
        WHERE issue_id = '${issue.issue_id}'
      `);
    }

    // 3️⃣ Now enforce NOT NULL + UNIQUE
    await queryInterface.changeColumn("issues", "ticket_number", {
      type: Sequelize.STRING(30),
      allowNull: false,
      unique: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("issues", "ticket_number");
  },
};
