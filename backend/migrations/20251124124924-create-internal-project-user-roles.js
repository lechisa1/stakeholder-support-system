"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("internal_project_user_roles", {
      internal_project_user_role_id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
      },

      project_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "projects",
          key: "project_id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },

      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "users",
          key: "user_id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },

      role_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "roles",
          key: "role_id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },

      internal_node_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: "internal_nodes",
          key: "internal_node_id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },

      project_metric_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: "project_metrics",
          key: "project_metric_id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },

      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
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

    // Add unique constraint for (project_id, user_id)
    await queryInterface.addConstraint("internal_project_user_roles", {
      fields: ["project_id", "user_id", "project_metric_id"],
      type: "unique",
      name: "unique_project_user_role",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("internal_project_user_roles");
  },
};
