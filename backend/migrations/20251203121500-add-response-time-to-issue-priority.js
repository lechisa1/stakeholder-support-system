"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1️⃣ Remove FK if exists
    await queryInterface
      .removeConstraint("issue_priorities", "fk_issuepriority_response_time")
      .catch(() => {});

    // 2️⃣ Remove old FK column if exists
    await queryInterface
      .removeColumn("issue_priorities", "response_time_id")
      .catch(() => {});

    // 3️⃣ Add nullable merged fields first
    await queryInterface.addColumn("issue_priorities", "response_duration", {
      type: Sequelize.INTEGER,
      allowNull: true, // TEMPORARILY NULL
    });

    await queryInterface.addColumn("issue_priorities", "response_unit", {
      type: Sequelize.ENUM("hour", "day", "month"),
      allowNull: true, // TEMPORARILY NULL
    });

    // 4️⃣ Add is_active if missing
    await queryInterface
      .addColumn("issue_priorities", "is_active", {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      })
      .catch(() => {});

    // 5️⃣ Fill existing rows with default values
    await queryInterface.sequelize.query(`
      UPDATE issue_priorities
      SET response_duration = 1,
          response_unit = 'hour'
      WHERE response_duration IS NULL;
    `);

    // 6️⃣ Now enforce NOT NULL
    await queryInterface.changeColumn("issue_priorities", "response_duration", {
      type: Sequelize.INTEGER,
      allowNull: false,
    });

    await queryInterface.changeColumn("issue_priorities", "response_unit", {
      type: Sequelize.ENUM("hour", "day", "month"),
      allowNull: false,
      defaultValue: "hour",
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove merged fields
    await queryInterface.removeColumn("issue_priorities", "response_duration");
    await queryInterface.removeColumn("issue_priorities", "response_unit");
    await queryInterface
      .removeColumn("issue_priorities", "is_active")
      .catch(() => {});

    // Drop ENUM for Postgres
    if (queryInterface.sequelize.getDialect() === "postgres") {
      await queryInterface.sequelize.query(
        `DROP TYPE IF EXISTS "enum_issue_priorities_response_unit";`
      );
    }

    // Restore old column
    await queryInterface.addColumn("issue_priorities", "response_time_id", {
      type: Sequelize.UUID,
      allowNull: true,
    });

    // Restore FK
    await queryInterface.addConstraint("issue_priorities", {
      fields: ["response_time_id"],
      type: "foreign key",
      name: "fk_issuepriority_response_time",
      references: {
        table: "issue_response_times",
        field: "response_time_id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });
  },
};
