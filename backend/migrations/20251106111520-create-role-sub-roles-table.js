"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("role_sub_roles", {
      roles_sub_roles_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      role_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "roles",
          key: "role_id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      sub_role_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: "sub_roles",
          key: "sub_role_id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false,
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
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });

    // Add unique constraint for role_id and sub_role_id combination
    await queryInterface.addConstraint("role_sub_roles", {
      fields: ["role_id", "sub_role_id"],
      type: "unique",
      name: "unique_role_sub_role_combination",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("role_sub_roles");
  },
};