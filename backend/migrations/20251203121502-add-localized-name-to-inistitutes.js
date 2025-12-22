"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1️⃣ Add a temporary JSON column for localized names
    await queryInterface.addColumn("institutes", "name_json", {
      type: Sequelize.JSON,
      allowNull: false,
      defaultValue: {},
      comment: "Localized names JSON: { en: 'Name', am: '', fr: '' }",
    });

    // 2️⃣ Copy existing name to JSON 'en'
    await queryInterface.sequelize.query(`
      UPDATE institutes
      SET name_json = json_build_object('en', name)
    `);

    // 3️⃣ Remove old 'name' column
    await queryInterface.removeColumn("institutes", "name");

    // 4️⃣ Rename new column to 'name'
    await queryInterface.renameColumn("institutes", "name_json", "name");
  },

  async down(queryInterface, Sequelize) {
    // Revert back to string name
    await queryInterface.addColumn("institutes", "name_str", {
      type: Sequelize.STRING(255),
      allowNull: false,
      unique: true,
      comment: "Institute name as string",
    });

    // Copy JSON 'en' back to string
    await queryInterface.sequelize.query(`
      UPDATE institutes
      SET name_str = name->>'en'
    `);

    // Remove JSON column
    await queryInterface.removeColumn("institutes", "name");

    // Rename back to original 'name'
    await queryInterface.renameColumn("institutes", "name_str", "name");
  },
};
