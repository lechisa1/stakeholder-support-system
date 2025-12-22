"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1️⃣ Add the new column (allow NULL temporarily to avoid errors)
    await queryInterface.addColumn(
      "internal_project_user_roles",
      "project_metric_id",
      {
        type: Sequelize.UUID,
        allowNull: true, // temporary
      }
    );

    // 2️⃣ Delete invalid rows (optional if needed)
    // Only if you have rows that shouldn't exist without a metric
    await queryInterface.sequelize.query(`
      DELETE FROM internal_project_user_roles
      WHERE project_metric_id IS NULL;
    `);

    // 3️⃣ Alter column to NOT NULL now that bad rows are gone
    await queryInterface.changeColumn(
      "internal_project_user_roles",
      "project_metric_id",
      {
        type: Sequelize.UUID,
        allowNull: false,
      }
    );

    // 4️⃣ Add FK constraint
    await queryInterface.addConstraint("internal_project_user_roles", {
      fields: ["project_metric_id"],
      type: "foreign key",
      name: "fk_ipur_project_metric",
      references: {
        table: "project_metrics",
        field: "project_metric_id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });

    // 5️⃣ Remove old unique constraint if exists
    const constraints = await queryInterface.showConstraint(
      "internal_project_user_roles"
    );
    if (
      constraints.some((c) => c.constraintName === "unique_project_user_role")
    ) {
      await queryInterface.removeConstraint(
        "internal_project_user_roles",
        "unique_project_user_role"
      );
    }

    // 6️⃣ Create NEW unique constraint including the metric
    await queryInterface.addConstraint("internal_project_user_roles", {
      fields: ["project_id", "user_id", "project_metric_id"],
      type: "unique",
      name: "unique_project_user_role_metric",
    });
  },

  async down(queryInterface) {
    // Remove the new unique constraint
    await queryInterface.removeConstraint(
      "internal_project_user_roles",
      "unique_project_user_role_metric"
    );

    // Recreate old unique constraint
    await queryInterface.addConstraint("internal_project_user_roles", {
      fields: ["project_id", "user_id"],
      type: "unique",
      name: "unique_project_user_role",
    });

    // Remove FK
    await queryInterface.removeConstraint(
      "internal_project_user_roles",
      "fk_ipur_project_metric"
    );

    // Remove column
    await queryInterface.removeColumn(
      "internal_project_user_roles",
      "project_metric_id"
    );
  },
};
