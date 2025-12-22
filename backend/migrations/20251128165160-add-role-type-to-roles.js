"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("roles", "role_type", {
      type: Sequelize.ENUM("internal", "external"),
      allowNull: false,
      defaultValue: "internal",
    });
  },

  async down(queryInterface, Sequelize) {
    // First remove column
    await queryInterface.removeColumn("roles", "role_type");

    // Then drop ENUM type to avoid leftover type conflicts (Postgres)
    await queryInterface.sequelize.query(`
      DROP TYPE IF EXISTS "enum_roles_role_type";
    `);
  },
};
