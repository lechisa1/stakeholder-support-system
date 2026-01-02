"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("role_sub_roles_permissions", {
      role_sub_roles_permission_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      roles_sub_roles_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "role_sub_roles",
          key: "roles_sub_roles_id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      permission_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "permissions",
          key: "permission_id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      assigned_by: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "users",
          key: "user_id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      assigned_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW"),
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW"),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW"),
      },
    });

    // Add unique constraint to prevent duplicate permission assignments
    await queryInterface.addConstraint("role_sub_roles_permissions", {
      fields: ["roles_sub_roles_id", "permission_id"],
      type: "unique",
      name: "unique_role_sub_role_permission",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("role_sub_roles_permissions");
  },
};